# Story 1.3: BFF 层 API Route 与 n8n 连通性实现 (已更新协议)

Status: done

## Story

作为一名 **全栈开发人员**，
我想要 **实现 Next.js 的 BFF 接口并处理 n8n 的流式响应协议**，
以便 **前端能实时接收文字，并根据隐藏的 State 指令渲染特定 UI 组件**。

## Acceptance Criteria

- **Given** n8n 配置为返回流式响应 (Streaming Response)。
- **When** 前端请求 `/api/chat`。
- **Then** 后端能正确转发 n8n 的 ReadableStream。
- **And** **协议解析 (Protocol Parsing)**: 前端能识别并分离响应中的 `<STATE>` 标签。
  - 示例输入: `<STATE>{"step":"size_input"}</STATE>宝贝，撑撑姐教你先测量...`
  - 解析结果:
    - **State**: `{"step":"size_input"}` (用于触发 UI)。
    - **Text**: `宝贝，撑撑姐教你先测量...` (用于打字机显示)。
- **And** `<STATE>` 标签内容在对话气泡中 **不可见**。

## Tasks / Subtasks

- [x] Implement `app/api/chat/route.ts` to act as a BFF for n8n webhook calls.
- [x] Configure `N8N_WEBHOOK_URL` as an environment variable.
- [x] Add basic authentication/authorization logic within `app/api/chat/route.ts` (e.g., check `SessionId`).
- [x] Implement the `fetch` call to the n8n webhook from the Next.js API Route.
- [x] Handle n8n response and format it for the frontend.

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Next.js API Routes (BFF Pattern)** for secure intermediary logic to n8n.
  - n8n Webhook URL must be stored as an environment variable and not directly exposed to the frontend.
  - The API route should handle authentication/authorization checks.

### Technical Notes

- **Regex 解析**: 使用正则表达式 `/<STATE>(.*?)<\/STATE>/s` 提取 JSON 数据。
- **流式处理**: 建议使用 `ai` SDK (Vercel AI SDK) 的 `StreamingTextResponse` 或原生 `fetch` reader 处理流，确保在接收到 `</STATE>` 闭合标签的瞬间立即触发 UI 状态更新，不必等待整个流结束。

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): The `app/api/chat/route.ts` aligns with Next.js App Router conventions for API routes.
- Detected conflicts or variances (with rationale): None apparent, as the BFF pattern is explicitly supported and recommended for security in the architecture document.

### References

- [Source: docs/sprint-artifacts/architecture.md#4.1 对话交互协议 (Next.js BFF Pattern)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Implemented `app/api/chat/route.ts` for n8n webhook calls.
- Guided user to configure `N8N_WEBHOOK_URL` environment variable.
- Added basic authentication/authorization placeholder logic using `isUserBanned` function.
- Implemented `fetch` call to n8n webhook and handled its response.
- Updated `/api/chat` to proxy streaming response (ReadableStream) from n8n.
- Added `<STATE>` protocol parser utilities for frontend (full-string and streaming incremental).
- Added SSE (`text/event-stream`) parser and a combined dual-channel parser (SSE framing + `<STATE>` inner protocol).
- Added unit tests for streaming proxy and protocol parser.

### File List

- moon-agent/app/api/chat/route.ts
- moon-agent/app/api/chat/route.test.ts
- moon-agent/lib/chatProtocol.ts
- moon-agent/lib/chatProtocol.test.ts
- moon-agent/lib/sse.ts
- moon-agent/lib/sse.test.ts
- moon-agent/lib/n8nDualChannel.ts
- moon-agent/lib/n8nDualChannel.test.ts
- .env.local (user-configured)

## Senior Developer Review (AI)

_Reviewer: Lilangjun on 2025-12-13_

### Outcome

Approve (after fixes)

### Key Findings (Resolved)

- [CRITICAL] Backend was not streaming; it consumed `n8nResponse.json()` and returned JSON instead of proxying ReadableStream (`moon-agent/app/api/chat/route.ts`)
- [HIGH] `<STATE>` protocol parsing utilities were missing in frontend codebase (`moon-agent/lib/chatProtocol.ts`)
- [CRITICAL] Auth check was commented out while task was marked [x] (restored placeholder check)
- [HIGH] Missing tests for streaming proxy and protocol parser (added)

### Tests

- `cd moon-agent && npm test` (Vitest) ✅ 6 files, 11 tests passed
