package cn.iocoder.yudao.module.infra.controller.app.chat;

import cn.iocoder.yudao.module.infra.controller.app.chat.vo.AppChatStreamReqVO;
import cn.iocoder.yudao.module.infra.service.chat.ChatStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import static cn.iocoder.yudao.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;

/**
 * App Chat Controller
 *
 * Provides SSE streaming chat endpoint for H5/weapp/Taro RN clients.
 * Clients MUST NOT connect directly to n8n - all chat requests go through this controller.
 *
 * Endpoint: POST /app-api/infra/chat/stream
 *
 * Features:
 * - SSE streaming proxy to n8n
 * - Authentication via Spring Security (Cookie/Authorization header)
 * - Rate limiting per user
 * - Audit logging
 * - Upstream abort on client disconnect
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */
@Tag(name = "用户 App - AI 聊天")
@RestController
@RequestMapping("/infra/chat")
@Validated
@Slf4j
public class AppChatController {

    @Resource
    private ChatStreamService chatStreamService;

    /**
     * SSE Streaming Chat Endpoint
     *
     * Accepts chat requests and proxies to n8n, returning SSE stream.
     *
     * Response format: text/event-stream
     * - event: partial / data: {content}
     * - event: end / data: [DONE]
     * - event: error / data: {code, message, recoverable}
     *
     * @param reqVO    Chat request with sessionId, messageId, text
     * @param response HTTP response for SSE output
     */
    @PostMapping(value = "/stream", produces = "text/event-stream;charset=UTF-8")
    @Operation(summary = "发送聊天消息（流式）", description = "SSE 流式返回 AI 回复，用于实时渲染对话内容")
    public void streamChat(@Valid @RequestBody AppChatStreamReqVO reqVO, HttpServletResponse response) {
        Long userId = getLoginUserId();

        // Validate user is authenticated
        if (userId == null) {
            log.warn("[streamChat] Unauthenticated request: sessionId={}", reqVO.getSessionId());
            try {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"msg\":\"请先登录\"}");
            } catch (Exception e) {
                log.error("[streamChat] Failed to send auth error", e);
            }
            return;
        }

        log.debug("[streamChat] Request: userId={}, sessionId={}, messageId={}, platform={}",
                userId, reqVO.getSessionId(), reqVO.getMessageId(), reqVO.getPlatform());

        // Delegate to service for streaming
        chatStreamService.streamChat(userId, reqVO, response);
    }

}
