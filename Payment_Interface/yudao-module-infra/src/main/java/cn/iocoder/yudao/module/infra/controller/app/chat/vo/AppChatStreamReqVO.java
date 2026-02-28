package cn.iocoder.yudao.module.infra.controller.app.chat.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * Chat Stream Request VO
 *
 * Request payload for initiating a chat streaming conversation.
 * This is the standardized request structure for client-to-server communication.
 *
 * @see Story 3-1-chat-channel-adaptation-streaming-ws-fallback.md
 */
@Schema(description = "App - Chat 流式请求 Request VO")
@Data
public class AppChatStreamReqVO {

    @Schema(description = "会话 ID，用于对话连续性", requiredMode = Schema.RequiredMode.REQUIRED, example = "session-123")
    @NotBlank(message = "会话 ID 不能为空")
    private String sessionId;

    @Schema(description = "消息 ID，用于去重和追踪", requiredMode = Schema.RequiredMode.REQUIRED, example = "msg-456")
    @NotBlank(message = "消息 ID 不能为空")
    private String messageId;

    @Schema(description = "用户输入的文本内容", requiredMode = Schema.RequiredMode.REQUIRED, example = "你好")
    @NotBlank(message = "消息内容不能为空")
    private String text;

    @Schema(description = "平台标识: h5 | weapp | rn", example = "h5")
    private String platform;

}
