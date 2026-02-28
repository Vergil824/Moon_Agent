# Story 2.5: Zustand 状态持久化 (会话记录跨页面保持)

Status: Ready for Review

## Story

作为一名 **用户**，
我想要 **在切换到购物车或个人中心后返回聊天界面时，看到之前的对话记录**，
以便 **我不需要重新开始对话，保持流畅的购物体验**。

## Acceptance Criteria

1. **Given** 用户已经与“满月”进行了部分对话。 (AC: 1)
2. **When** 用户点击底部导航栏跳转到“购物车”或“我的”页面，然后再次点击“聊天”返回。 (AC: 2)
3. **Then** 聊天气泡列表应完整保留，无需重新加载。 (AC: 3)
4. **And** 即使刷新浏览器页面，会话记录在当前 Session 内依然存在（使用 sessionStorage 持久化）。 (AC: 4)
5. **And** 持久化内容应包括：消息列表 (`messages`)、当前诊断状态 (`currentState`)、身体测量数据 (`measurementData`, `auxiliaryData`)、胸型 (`chestType`)、痛点 (`painPoints`)，以及原本独立存储的 **会话 ID (`sessionId`)**。 (AC: 5)
6. **And** UI 临时状态（如 `isTyping`, `isStreaming`）**不应** 被持久化，刷新后应重置为初始值。 (AC: 6)
7. **And** 清理 `ChatPage` 中冗余的 `welcomeShown` 相关逻辑（`hasShownWelcome`, `markShownWelcome` 及对应的 sessionStorage/localStorage 操作），因为该标记目前无实际用途且可由 `messages` 长度替代。 (AC: 7)
8. **And** 必须处理 Next.js 环境下的 Hydration 兼容性问题，避免服务器渲染与 sessionStorage 恢复后的客户端状态不一致导致错误。 (AC: 8)

## Tasks / Subtasks

- [x] **Task 1: 为 `useChatStore` 配置 Zustand 持久化中间件 (AC: 4, 5, 6)**
  - [x] 扩展 `ChatState` 类型，增加 `sessionId: string | null`。
  - [x] 导入 `persist` 和 `createJSONStorage` 中间件。
  - [x] 在 `useChatStore` 中启用 `persist`，配置 `name: "moon-chat-storage"` 并指定使用 `sessionStorage`。
  - [x] 实现 `partialize` 函数，明确指定需要持久化的字段（包括 `messages`, `currentState`, `measurementData`, `auxiliaryData`, `chestType`, `painPoints`, `sessionId`；排除 `isTyping`, `isStreaming`）。
- [x] **Task 2: 清理并重构 `ChatPage` 逻辑 (AC: 7)**
  - [x] 删除 `ChatPage.tsx` 中的 `WELCOME_SHOWN_KEY_PREFIX`、`hasShownWelcome` 和 `markShownWelcome` 函数。
  - [x] 移除 `streamAssistantReply` 中对上述函数的调用。
  - [x] 将 `sessionId` 的管理从组件内存储迁移到 `useChatStore` 中。
- [x] **Task 3: 实现 Hydration 安全加载逻辑 (AC: 8)**
  - [x] 在 `ChatInterface` 或相关组件中使用 `useHasHydrated` 模式，确保持久化状态同步完成后再进行渲染。
- [x] **Task 4: 验证持久化效果与 UI 同步 (AC: 1, 2, 3)**
  - [x] 验证跨路由切换和 F5 刷新后，对话记录和 Session ID 正确恢复，且无 Hydration 错误。

## Dev Notes

- **Zustand 版本**: 项目使用 `zustand@^4.5.4`，需确保使用该版本的持久化 API。
- **存储路径**: `lib/store.ts` 是核心修改位置。
- **Next.js 适配**: 考虑到 Next.js 的 SSR 机制，推荐在组件层使用 `useHasHydrated` 自定义 hook 或在 `useEffect` 中设置加载标志。
- **排除字段**: 必须确保 `isTyping` 和 `isStreaming` 在 `partialize` 中被过滤，防止刷新后处于“永久输入中”的状态。
- **存储选择**: 本 Story 明确要求使用 `sessionStorage` 仅在当前会话窗口保持状态。

### Project Structure Notes

- **Store**: `lib/store.ts` 已经定义了 `useChatStore` 及其类型，本次任务主要是对其进行增强。
- **Navigation**: 底部导航使用 `useNavigationStore`，其状态通常不需要持久化（或根据需求决定，本项目暂不要求导航位置持久化）。

### References

- [Source: docs/sprint-artifacts/stories.md#Story 2.5]
- [Source: docs/sprint-artifacts/architecture.md#2.1 全栈框架]
- [Source: docs/sprint-artifacts/UX.md#1. 设计哲学]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gemini-3-flash-preview

### Debug Log References

### Completion Notes List

- **Task 1**: Switched persistence from `localStorage` to `sessionStorage` to limit state to the current session.
- **Task 2**: Cleaned up component-level storage logic in `ChatPage`.
- **Task 3**: Ensured hydration safety for `sessionStorage`.

### Change Log

- 2025-12-26: Story 2.5 requirements updated: changed storage from localStorage to sessionStorage. Status reset to in-progress.
- 2025-12-26: Implementation updated to use sessionStorage. Status set back to Ready for Review.

### File List

- moon-agent/lib/store.ts
- moon-agent/lib/store.test.ts
- moon-agent/vitest.setup.ts
- moon-agent/app/chat/page.tsx
