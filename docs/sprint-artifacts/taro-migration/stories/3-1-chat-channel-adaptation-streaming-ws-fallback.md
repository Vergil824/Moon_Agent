# Story 3.1: 聊天通道适配（流式/WS/兜底）

Status: review

## Story

As a shopper,
I want chat to stream and stay reliable across H5/weapp/Taro RN,
so that 我能实时获得回复，并且在弱网/平台限制下仍可继续完成对话。

## Acceptance Criteria

1. **客户端只连接 `payment_interface`（禁止直连 n8n）**: H5/weapp/Taro RN 端不得直接访问 n8n（不得暴露 n8n 地址与 token）；聊天相关请求必须统一发往 `payment_interface`，由其统一执行鉴权/限流/审计日志/错误映射。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
2. **Phase 1：`payment_interface` 提供“真实 SSE”流式代理（上游可为 SSE/JSONL）**: 在 `payment_interface` 新增 `chat/stream`（或等价 `/app-api/chat/stream`）作为 **SSE 流式代理**：校验登录态/权限后，将请求转发到 n8n 的流式接口，并将上游返回的流 **边读边写**给客户端。需要明确：当前 `moon-agent` 中存在两种上游形态（SSE 与 JSONL chunked），迁移后对客户端输出必须统一为 **`text/event-stream` 的 SSE 帧**（SSE `data:` 内承载 JSON/文本），而不是仅仅输出 JSONL。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
3. **避免“假流式”与中间层缓冲**: `payment_interface` 端必须正确设置 `Content-Type: text/event-stream`，并关闭/绕开 proxy buffering、compression；客户端应能看到 `partial` 文本逐步到达，而不是一次性返回。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
4. **客户端断开时可中止上游请求**: 当客户端断开连接（页面切换/手动取消/网络中断）时，`payment_interface` 必须中止对 n8n 的上游请求，避免资源泄露与无效计费。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
5. **为 Phase 2 预留统一协议与端点规划（weapp 优先）**: 明确并记录 `chat/ws` 端点与事件协议（`auth_ack/partial/end/error/heartbeat`），用于后续将 n8n 流式输出转换为 WS 事件并支持心跳/重连/失败降级轮询；Phase 1 不要求完成全部 WS 代理实现，但不得阻碍 Phase 2 落地（例如：协议字段、鉴权方式、路由约定要先对齐）。 [Source: docs/sprint-artifacts/taro-migration/README.md#聊天通道]

## Tasks / Subtasks

- [x] **确定统一对话协议（跨端一致）** (AC: 1, 5)
  - [x] 定义客户端 → 服务端请求结构（sessionId、messageId、text、metadata），以及服务端 → 客户端事件结构。
  - [x] 明确事件语义与顺序：`auth_ack`（可选）→ 多次 `partial` → `end`（或 `error`）。
  - [x] 保持与现有 Next.js 实现语义一致（`partial/end/error`），避免前端组件逻辑分叉。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1]

- [x] **Phase 1：实现 `payment_interface` 的 SSE 透传代理** (AC: 1, 2, 3, 4)
  - [x] **接口设计**: 统一对外路径（建议 `/app-api/chat/stream`），请求方法（POST/GET）与鉴权（Cookie/Authorization）。
  - [x] **鉴权与限流**: 校验登录态/权限；对单用户并发与 QPS 做限制；记录审计日志（userId、sessionId、请求耗时、上游状态）。
  - [x] **上游转发**: 通过环境变量配置 n8n 目标（建议 `N8N_BASE_URL` + `N8N_CHAT_STREAM_PATH`），禁止硬编码 IP，支持多环境部署。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
  - [x] **上游格式适配（SSE → SSE / JSONL → SSE）**:
    - [x] 若 n8n 返回 `text/event-stream`：保持 SSE 外层帧，并在必要时过滤/转换 payload（保证前端消费的 `partial/end/error` 语义一致）。
    - [x] 若 n8n 返回 JSONL chunked：将每行 JSON 转换为 SSE `data:` 事件输出（对客户端暴露仍然是 `text/event-stream`），避免客户端只收到“非 SSE 的 JSON 流”。（现有解析参考：`moon-agent/lib/chat/n8nDualChannel.ts`） 
  - [x] **SSE 正确性**:
    - [x] 写入头：`Content-Type: text/event-stream; charset=utf-8`、`Cache-Control: no-cache, no-transform`、`Connection: keep-alive`。
    - [x] 禁用/绕开 gzip/compression 与 proxy buffering（应用层与网关层都要处理；若有 Nginx，需 `proxy_buffering off; gzip off;` 之类配置）。
    - [x] 确保边读边写（flush），避免聚合缓冲导致“假流式”。
  - [x] **断开中止**: 监听客户端连接关闭并触发 Abort/Cancel（例如 AbortController），确保上游请求立即停止。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1 补充说明]
  - [x] **错误映射**: 将上游错误映射为稳定可消费的错误输出（HTTP 状态码 + SSE `error` 事件/错误 JSON），并避免将上游内部信息直接暴露给客户端。

- [x] **前端：H5 流式请求走 `payment_interface`（不直连 n8n）** (AC: 1, 2, 3)
  - [x] 在 `moon_agent_taro` 的聊天请求层实现 H5 流式读取（fetch + ReadableStream / SSE 客户端实现）。
  - [x] 确保请求携带登录态（cookie/withCredentials）并对齐租户/headers 注入策略（与网络适配层保持一致，但允许聊天通道在 H5 端使用 fetch 以支持流式）。 [Source: docs/sprint-artifacts/taro-migration/epics.md#FR4]
  - [x] UI 层能实时渲染 `partial` 增量，并在 `end` 时合并为最终消息（为 Story 3.4 的渲染策略打底）。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.4]

- [x] **前端：weapp 优先的 Phase 2 预留（WS/轮询兜底）** (AC: 5)
  - [x] 预留 `chat/ws` 的客户端接口与实现位置（`Taro.connectSocket`、心跳 20–30s、重连退避、失败降级轮询），但不在 Phase 1 强制完成 WS 后端代理。
  - [x] 确保 weapp 侧不会尝试使用 SSE（平台不支持），并在 WS/轮询不可用时展示降级提示（可复用 `DegradedHint` 组件）。 [Source: docs/sprint-artifacts/taro-migration/README.md#WebSocket 统一协议（草案）]

## Dev Notes

- **核心约束（必须遵守）**:
  - H5/weapp/Taro RN **只连 `payment_interface`**；n8n 地址与 token 仅存在于服务端配置中。
  - Phase 1 先落地 SSE 透传代理，确保“真流式”（禁缓冲/禁压缩/边读边写/可中止）。
- **现有实现参考（moon-agent / Next.js）**:
  - SSE 与协议语义：`moon-agent/lib/chat/sse.ts`, `moon-agent/lib/chat/chatProtocol.ts`
  - 双通道/重连策略参考：`moon-agent/lib/chat/n8nDualChannel.ts`
  - 现有 BFF 聊天入口（需迁移思路到 payment_interface）：`moon-agent/app/api/chat/route.ts` [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1]
- **架构依据**:
  - “前端不直连 n8n，走 BFF/代理层”的基本原则：`docs/sprint-artifacts/architecture.md#4.1 对话交互协议 (Next.js BFF Pattern)`
  - Taro 迁移与聊天通道约束：`docs/sprint-artifacts/taro-migration/README.md`

### Project Structure Notes

- **建议新增目录（moon_agent_taro）**:
  - `moon_agent_taro/src/core/chat/`：chat client（H5 stream client、weapp ws client stub、fallback 策略、协议 types）
  - `moon_agent_taro/src/core/chat/protocol.ts`：统一事件/消息类型与解析器（对齐 `partial/end/error/auth_ack`）
  - `moon_agent_taro/src/core/chat/index.ts`：对外导出 `useChat`/`chatClient`（后续与页面层对接）
- **服务端（payment_interface）**:
  - 本仓库内对应服务代码位于：`Payment_Interface/`（Spring Boot / Yudao 体系）。
  - Phase 1 建议 **不新增 Maven 子模块**（避免改动 pom 与模块装配带来的额外复杂度）；仅新增一个独立的功能包（controller + service + config），做到边界清晰、易于后续抽离。
  - 建议落点：在 `Payment_Interface` 下新增 App 端控制器（`**.controller.app.**`）提供 `/app-api/chat/stream`（或等价）接口，例如：
    - `Payment_Interface/yudao-module-infra/src/main/java/cn/iocoder/yudao/module/infra/controller/app/chat/AppChatController.java`
  - 说明：`/app-api` 前缀与 App Controller 扫描规则由 `Payment_Interface/yudao-framework/yudao-spring-boot-starter-web` 管理（参见 `WebProperties`），请按现有模块约定接入鉴权与限流。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.1]
- [Source: docs/sprint-artifacts/taro-migration/README.md]
- [Source: docs/sprint-artifacts/architecture.md#4.1 对话交互协议 (Next.js BFF Pattern)]
- [Source: docs/sprint-artifacts/prd.md#4.2 核心对话流程 (Core Conversation Flow)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

N/A

### Completion Notes List

1. **Task 1 - 统一对话协议**: 定义了完整的客户端→服务端请求结构（ChatRequest）和服务端→客户端事件结构（auth_ack/partial/end/error/heartbeat）。从 moon-agent 移植了 `<STATE>` 协议解析器，保持语义一致。

2. **Task 2 - payment_interface SSE 代理**: 实现了 Spring Boot 端的 SSE 流式代理控制器 `AppChatController`，包含：
   - 接口路径：`POST /app-api/infra/chat/stream`
   - 鉴权：通过 Spring Security getLoginUserId()
   - 限流：每用户最大并发流数配置
   - 上游格式适配：SSE→SSE 和 JSONL→SSE 转换
   - 正确的 SSE headers（禁用缓冲/压缩）
   - 客户端断开时中止上游请求
   - 审计日志

3. **Task 3 - H5 流式请求客户端**: 实现了基于 fetch + ReadableStream 的 H5 流式客户端 `h5StreamClient.ts` 和 React Hook `useChat.ts`。支持：
   - 自动携带 credentials
   - 连接中止
   - SSE 解析与 STATE 协议处理
   - 实时更新消息状态

4. **Task 4 - weapp Phase 2 预留**: 创建了 WebSocket 客户端接口和轮询降级占位实现 `weappWsClient.ts`。Phase 1 返回降级模式，复用现有 `DegradedHint` 组件。

### File List

**New Files (moon_agent_taro/src/core/chat/):**
- `protocol.ts` - 统一聊天协议类型与解析器
- `sse.ts` - SSE 解析器
- `dualChannel.ts` - 双通道解析器（SSE + JSONL）
- `h5StreamClient.ts` - H5 流式客户端
- `useChat.ts` - React Hook
- `weappWsClient.ts` - weapp WS 客户端占位
- `index.ts` - 模块入口
- `__tests__/protocol.test.ts` - 协议类型测试

**New Files (Payment_Interface/yudao-module-infra/):**
- `controller/app/chat/AppChatController.java` - SSE 流式控制器
- `controller/app/chat/vo/AppChatStreamReqVO.java` - 请求 VO
- `controller/app/chat/config/ChatStreamProperties.java` - 配置属性
- `service/chat/ChatStreamService.java` - 流式代理服务

**Modified Files:**
- `Payment_Interface/yudao-server/src/main/resources/application.yaml` - 添加 chat 配置
- `docs/sprint-artifacts/taro-migration/sprint-status.yaml` - 状态更新

