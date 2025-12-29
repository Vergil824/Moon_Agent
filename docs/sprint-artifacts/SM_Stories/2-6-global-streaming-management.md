# Story 2.6: 全局流式对话管理与背景追更 (Global Streaming Management & Background Updates)

Status: done

## Story

作为一名 **用户**，
我想要 **在切换到购物车或个人中心时，聊天对话依然能在后台继续接收**，
以便 **我返回聊天界面时，能够看到完整的建议，而不会因为页面切换导致连接中断或报错**。

## Acceptance Criteria

1. **Given** 用户正在与“满月”进行流式对话。 (AC: 1)
2. **When** 用户点击底部导航栏跳转到其他页面（如购物车）。 (AC: 2)
3. **Then** 正在进行的 `fetch` 请求和流解析逻辑 **不应中断**。 (AC: 3)
4. **And** 消息内容应持续异步追加到 `useChatStore` 的 `messages` 数组中。 (AC: 4)
5. **And** `isStreaming` 状态在后台保持为 `true` 直至流结束。 (AC: 5)
6. **Given** 流在后台已经结束或仍在继续。 (AC: 6)
7. **When** 用户再次点击“聊天”返回。 (AC: 7)
8. **Then** 聊天气泡应正确显示后台已接收的所有内容。 (AC: 8)
9. **And** 如果流仍在进行，应自动触发“打字机”追赶逻辑，继续显示剩余内容。 (AC: 9)
10. **And** **不再显示** 因页面切换导致的“网络错误”或“请求失败”警告。 (AC: 10)

## Tasks / Subtasks

- [x] **Task 1: 重构 `useChatStore` 增加全局流式处理 Action (AC: 3, 4, 5)**
  - [x] 将 `streamAssistantReply` 函数从 `app/chat/page.tsx` 迁移到 `lib/store.ts`。
  - [x] 确保 Store Action 能够独立处理 fetch 请求、流解析，并持续更新 `messages`。
  - [x] 在 `useChatStore` 中管理 `isStreaming` 全局状态。
- [x] **Task 2: 实现“数据与 UI”解耦的打字机逻辑 (AC: 9)**
  - [x] 在 Store 中为流式消息增加一个 `fullContent` 字段或在组件层维护 `displayedLength`。
  - [x] 将消息的“实际接收内容”与“当前 UI 显示内容”分离，确保后台更新不干扰 UI 的平滑显示。
- [x] **Task 3: 重构 `ChatPage` 与 `ChatInterface` 的对接 (AC: 7, 8, 9, 10)**
  - [x] 移除 `ChatPage` 内冗余的本地流式处理逻辑。
  - [x] 在 `ChatPage` 挂载时，检查 `isStreaming` 状态，并启动“追赶”打字机效果。
  - [x] 确保组件卸载（Unmount）时不中止 Store 中的流读取。
- [x] **Task 4: 健壮性与异常处理**
  - [x] 确保流结束（无论正常还是异常）都能正确重置 `isStreaming` 状态。
  - [x] 处理网络异常情况，确保 UI 能给出友好提示且不影响后续对话。

## Dev Notes

- **逻辑上移 (Logic Migration)**: 核心是将 `streamAssistantReply` 从 `ChatPage.tsx` 迁移到 `lib/store.ts`。由于 Zustand Store 是单例且生命周期贯穿整个浏览器会话，只要不刷新页面，即使离开 `/chat` 路由，Store Action 中的 `fetch` 和流解析逻辑也会继续运行。
- **状态管理 (State Management)**: 在 Store 中管理 `isStreaming` 和 `isTyping`。对于正在接收的消息，Store 应该实时追加内容。
- **打字机解耦 (Typewriter Decoupling)**:
  - 目前 `ChatPage` 使用 `typingQueueRef` 和 `setTimeout` 实现打字机效果。这种模式在页面卸载时会被销毁。
  - 方案一：在 Store 中为每条消息维护一个 `displayedContent`，并由 Store 驱动增量更新。
  - 方案二（推荐）：Store 只负责维护 `fullContent`（实际收到的完整文本）。`ChatBubble` 或 `ChatInterface` 组件内部维护一个本地的 `displayedLength`，并使用 `useEffect` 监听 `fullContent` 的变化，驱动打字动画。
- **追赶机制 (Catch-up Mechanism)**: 当用户从其他页面返回 `ChatPage` 时：
  - 如果该消息还在 `isStreaming` 状态，组件的打字机逻辑会发现 `displayedLength < fullContent.length`，从而自动开始快速打字，直到追平最新进度。
- **SSE/Stream 处理**: 确保 `lib/n8nDualChannel.ts` 的解析器能被 Store action 正确调用，并能处理跨 chunk 的 JSON 碎片。

## References

- [Source: docs/sprint-artifacts/stories.md#Story 2.6]
- [Source: moon-agent/lib/store.ts]
- [Source: moon-agent/app/chat/page.tsx]
- [Source: moon-agent/lib/n8nDualChannel.ts]
- [Source: moon-agent/lib/sse.ts]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gemini-3-flash-preview

### Debug Log References

### Completion Notes List

### Change Log

- 2025-12-26: Initial story creation based on `stories.md`.
