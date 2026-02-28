package cn.iocoder.yudao.module.infra.controller.app.chat.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Positive;

/**
 * Chat Stream Configuration Properties
 *
 * Configuration for the n8n upstream connection.
 * Loaded from application.yml with prefix: yudao.chat
 *
 * Example configuration:
 * <pre>
 * yudao:
 *   chat:
 *     n8n-base-url: http://n8n:5678
 *     n8n-chat-stream-path: /webhook/chat/stream
 *     connection-timeout: 30000
 *     read-timeout: 120000
 * </pre>
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md AC3
 */
@ConfigurationProperties(prefix = "yudao.chat")
@Validated
@Data
public class ChatStreamProperties {

    /**
     * n8n base URL (e.g., http://n8n:5678)
     * Must NOT include trailing slash
     */
    @NotEmpty(message = "n8n base URL 不能为空")
    private String n8nBaseUrl;

    /**
     * n8n chat stream webhook path (e.g., /webhook/chat/stream)
     * Must start with /
     */
    @NotEmpty(message = "n8n chat stream path 不能为空")
    private String n8nChatStreamPath;

    /**
     * Connection timeout in milliseconds
     * Default: 30 seconds
     */
    @Positive(message = "连接超时必须为正数")
    private int connectionTimeout = 30000;

    /**
     * Read timeout in milliseconds
     * Default: 120 seconds (2 minutes for long AI responses)
     */
    @Positive(message = "读取超时必须为正数")
    private int readTimeout = 120000;

    /**
     * Maximum concurrent streams per user
     * Default: 2
     */
    @Positive(message = "最大并发数必须为正数")
    private int maxConcurrentStreamsPerUser = 2;

    /**
     * Enable audit logging for chat requests
     * Default: true
     */
    private boolean auditLogEnabled = true;

    /**
     * Get the full n8n chat stream URL
     */
    public String getN8nChatStreamUrl() {
        String base = n8nBaseUrl.endsWith("/") ? n8nBaseUrl.substring(0, n8nBaseUrl.length() - 1) : n8nBaseUrl;
        String path = n8nChatStreamPath.startsWith("/") ? n8nChatStreamPath : "/" + n8nChatStreamPath;
        return base + path;
    }

}
