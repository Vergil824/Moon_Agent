package cn.iocoder.yudao.module.infra.service.chat;

import cn.iocoder.yudao.module.infra.controller.app.chat.config.ChatStreamProperties;
import cn.iocoder.yudao.module.infra.controller.app.chat.vo.AppChatStreamReqVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Chat Stream Service
 *
 * Handles SSE streaming proxy between client and n8n.
 * Implements the core requirements:
 * - True SSE streaming (no buffering)
 * - Proper Content-Type headers
 * - Client disconnect detection and upstream abort
 * - Error mapping
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */
@Service
@Slf4j
@EnableConfigurationProperties(ChatStreamProperties.class)
public class ChatStreamService {

    @Resource
    private ChatStreamProperties properties;

    /**
     * Track concurrent streams per user for rate limiting
     */
    private final ConcurrentHashMap<Long, AtomicInteger> userStreamCounts = new ConcurrentHashMap<>();

    /**
     * Stream chat response from n8n to client
     *
     * @param userId      Current user ID
     * @param reqVO       Chat request
     * @param response    HTTP response to write SSE to
     * @return true if stream completed successfully, false otherwise
     */
    public boolean streamChat(Long userId, AppChatStreamReqVO reqVO, HttpServletResponse response) {
        long startTime = System.currentTimeMillis();
        HttpURLConnection upstreamConn = null;

        try {
            // Rate limiting check
            if (!acquireStreamSlot(userId)) {
                sendSseError(response, "RATE_LIMITED", "Too many concurrent requests", true);
                return false;
            }

            // Setup SSE response headers (AC3: avoid proxy buffering)
            setupSseHeaders(response);

            // Connect to n8n upstream
            upstreamConn = connectToN8n(reqVO);
            int upstreamStatus = upstreamConn.getResponseCode();

            if (upstreamStatus != HttpURLConnection.HTTP_OK) {
                String errorMsg = readErrorResponse(upstreamConn);
                log.warn("[streamChat] n8n returned non-200: status={}, sessionId={}, error={}",
                        upstreamStatus, reqVO.getSessionId(), errorMsg);
                sendSseError(response, "UPSTREAM_ERROR", "Upstream service error", false);
                return false;
            }

            // Stream proxy: read from n8n, write to client (AC3: edge-by-edge flush)
            return proxyStream(upstreamConn, response, reqVO.getSessionId());

        } catch (IOException e) {
            log.error("[streamChat] IO error: sessionId={}, error={}", reqVO.getSessionId(), e.getMessage());
            try {
                sendSseError(response, "NETWORK_ERROR", "Connection error", true);
            } catch (IOException ignored) {
                // Client already disconnected
            }
            return false;
        } finally {
            releaseStreamSlot(userId);

            // AC4: Abort upstream on client disconnect
            if (upstreamConn != null) {
                upstreamConn.disconnect();
            }

            // Audit logging
            if (properties.isAuditLogEnabled()) {
                long duration = System.currentTimeMillis() - startTime;
                log.info("[streamChat][audit] userId={}, sessionId={}, platform={}, duration={}ms, time={}",
                        userId, reqVO.getSessionId(), reqVO.getPlatform(), duration, LocalDateTime.now());
            }
        }
    }

    /**
     * Setup SSE response headers for true streaming
     */
    private void setupSseHeaders(HttpServletResponse response) {
        // AC3: Correct SSE headers
        response.setContentType("text/event-stream; charset=utf-8");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");
        // Disable compression to prevent buffering
        response.setHeader("Content-Encoding", "identity");
        // Nginx proxy buffering hints
        response.setHeader("X-Accel-Buffering", "no");
    }

    /**
     * Connect to n8n upstream
     */
    private HttpURLConnection connectToN8n(AppChatStreamReqVO reqVO) throws IOException {
        URL url = new URL(properties.getN8nChatStreamUrl());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setConnectTimeout(properties.getConnectionTimeout());
        conn.setReadTimeout(properties.getReadTimeout());

        // Request headers
        conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        conn.setRequestProperty("Accept", "text/event-stream, text/plain, application/json");

        // Build request body (compatible with existing moon-agent format)
        String requestBody = String.format(
                "{\"sessionId\":\"%s\",\"chatInput\":\"%s\"}",
                escapeJson(reqVO.getSessionId()),
                escapeJson(reqVO.getText())
        );

        // Write request
        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }

        return conn;
    }

    /**
     * Proxy stream from n8n to client
     * AC3: Read and write edge-by-edge, no buffering
     *
     * Uses InputStreamReader with UTF-8 charset to properly handle multi-byte
     * characters that may be split across read boundaries. This is critical for
     * Chinese and other non-ASCII characters.
     *
     * IMPORTANT: Direct byte-to-String conversion using new String(buffer, 0, bytesRead, UTF_8)
     * will corrupt multi-byte UTF-8 characters when they are split at buffer boundaries.
     * For example, the Chinese character "大" (E5 A4 A7 in UTF-8) would become garbled
     * if the read boundary falls between its bytes.
     */
    private boolean proxyStream(HttpURLConnection upstreamConn, HttpServletResponse response, String sessionId) throws IOException {
        String contentType = upstreamConn.getContentType();
        boolean isSse = contentType != null && contentType.contains("text/event-stream");

        try (InputStream is = upstreamConn.getInputStream();
             // Use InputStreamReader to properly handle UTF-8 character boundaries
             InputStreamReader reader = new InputStreamReader(is, StandardCharsets.UTF_8);
             OutputStream os = response.getOutputStream()) {

            // Use char buffer instead of byte buffer for proper UTF-8 handling
            char[] charBuffer = new char[256];
            StringBuilder lineBuffer = new StringBuilder();
            int charsRead;

            while ((charsRead = reader.read(charBuffer)) != -1) {
                String chunk = new String(charBuffer, 0, charsRead);

                if (isSse) {
                    // SSE format: pass through directly
                    os.write(chunk.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                } else {
                    // JSONL format: buffer until we have complete lines, then wrap as SSE
                    lineBuffer.append(chunk);

                    // Process all complete lines in buffer
                    int newlineIdx;
                    while ((newlineIdx = lineBuffer.indexOf("\n")) != -1) {
                        String line = lineBuffer.substring(0, newlineIdx).trim();
                        lineBuffer.delete(0, newlineIdx + 1);

                        if (!line.isEmpty()) {
                            // Wrap JSONL line as SSE data event and flush immediately
                            String sseEvent = "data: " + line + "\n\n";
                            os.write(sseEvent.getBytes(StandardCharsets.UTF_8));
                            os.flush();
                            log.debug("[proxyStream] Sent SSE event: sessionId={}, length={}", sessionId, line.length());
                        }
                    }
                }
            }

            // Handle any remaining data in buffer
            String remaining = lineBuffer.toString().trim();
            if (!remaining.isEmpty()) {
                String sseEvent = "data: " + remaining + "\n\n";
                os.write(sseEvent.getBytes(StandardCharsets.UTF_8));
                os.flush();
            }

            // Send end event
            os.write("event: end\ndata: [DONE]\n\n".getBytes(StandardCharsets.UTF_8));
            os.flush();

            return true;
        }
    }

    /**
     * Send SSE error event
     */
    private void sendSseError(HttpServletResponse response, String code, String message, boolean recoverable) throws IOException {
        setupSseHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK); // SSE always returns 200, error in payload

        String errorJson = String.format(
                "{\"type\":\"error\",\"code\":\"%s\",\"message\":\"%s\",\"recoverable\":%s}",
                code, escapeJson(message), recoverable
        );

        try (PrintWriter writer = response.getWriter()) {
            writer.print("event: error\ndata: " + errorJson + "\n\n");
            writer.flush();
        }
    }

    /**
     * Read error response from upstream
     * Uses JDK 8 compatible method instead of readAllBytes()
     */
    private String readErrorResponse(HttpURLConnection conn) {
        try (InputStream es = conn.getErrorStream()) {
            if (es == null) return "Unknown error";
            return readInputStreamToString(es);
        } catch (IOException e) {
            return "Failed to read error: " + e.getMessage();
        }
    }

    /**
     * Read InputStream to String (JDK 8 compatible)
     */
    private String readInputStreamToString(InputStream is) throws IOException {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length;
        while ((length = is.read(buffer)) != -1) {
            result.write(buffer, 0, length);
        }
        return result.toString(StandardCharsets.UTF_8.name());
    }

    /**
     * Acquire a stream slot for rate limiting
     */
    private boolean acquireStreamSlot(Long userId) {
        AtomicInteger count = userStreamCounts.computeIfAbsent(userId, k -> new AtomicInteger(0));
        int current = count.incrementAndGet();
        if (current > properties.getMaxConcurrentStreamsPerUser()) {
            count.decrementAndGet();
            return false;
        }
        return true;
    }

    /**
     * Release a stream slot
     */
    private void releaseStreamSlot(Long userId) {
        AtomicInteger count = userStreamCounts.get(userId);
        if (count != null) {
            count.decrementAndGet();
        }
    }

    /**
     * Simple JSON string escaping
     */
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

}
