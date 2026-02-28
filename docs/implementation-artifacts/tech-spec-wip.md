---
title: 'Moon Next.js → Taro 微信小程序迁移（Chat 对齐优先）'
slug: 'moon-taro-weapp-migration'
created: '2026-01-31T17:01:09+08:00'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
tech_stack:
  - 'moon-agent：Next.js + React + TypeScript（Web）'
  - 'moon_agent_taro：Taro 4.1.9 + React + TypeScript（优先微信小程序 weapp）'
  - Zustand（web: v4，taro: v5）
  - Zod
  - Tailwind CSS（web: v3，taro: v4 + weapp-tailwindcss v4）
  - react-markdown（web）/ MarkdownText 封装（taro）
  - framer-motion（web）/ CSS 动画类（taro）
  - vitest + @testing-library/react（web）
  - NutUI React Taro + taro-icons + @taroify/icons（taro）
files_to_modify:
  - moon_agent_taro/src/pages/chat/index.tsx
  - moon_agent_taro/src/pages/cart/index.tsx
  - moon_agent_taro/src/app.config.ts
  - moon_agent_taro/project.config.json
  - moon_agent_taro/src/pages/welcome/index.tsx
  - moon_agent_taro/src/pages/login/index.tsx
  - moon_agent_taro/src/core/auth/authService.ts
  - moon_agent_taro/src/core/auth/types.ts
  - moon_agent_taro/src/core/stores/index.ts
  - moon_agent_taro/src/core/components/chat/ChatInput.tsx
  - moon_agent_taro/src/core/components/chat/NewMessageHint.tsx
  - moon_agent_taro/src/core/components/chat/MessageBubble.tsx
  - moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx
  - moon_agent_taro/src/core/chat/weappChunkedClient.ts
  - moon_agent_taro/src/core/chat/h5StreamClient.ts

files_to_reference:
  - moon-agent/app/chat/page.tsx
  - moon-agent/components/chat/ChatInterface.tsx
  - moon-agent/lib/core/store.ts
  - moon_agent_taro/Swagger UI.html
  - Payment_Interface/yudao-module-member/src/main/java/cn/iocoder/yudao/module/member/controller/app/auth/AppAuthController.http
  - moon-agent/app/cart/page.tsx
  - moon-agent/lib/cart/cartApi.ts
  - moon-agent/lib/cart/useCart.ts
  - moon-agent/app/checkout/page.tsx
  - moon-agent/lib/payment/payApi.ts
  - moon-agent/app/pay/submit/page.tsx
  - moon-agent/app/pay/result/page.tsx
  - moon-agent/app/profile/addresses/page.tsx
  - moon-agent/lib/address/addressApi.ts
  - moon-agent/app/profile/orders/page.tsx
  - moon-agent/lib/order/orderApi.ts
  - moon-agent/app/profile/settings/page.tsx
  - moon-agent/lib/profile/userApi.ts
code_patterns:
  - 使用 Zustand 的全局 store 管理 chat 状态与 streaming flags
  - 流式消息使用 `fullContent` + `streamingMessageId` 做增量渲染/打字机
  - 自动滚动采用“多次延迟重试”以适配动态布局/图片加载
  - weapp 的 ScrollView 使用 `scrollIntoView` + `scrollTop` 兜底确保可靠滚到底部
test_patterns:
  - 'web：vitest + React Testing Library（单元/组件测试，常用“模块 mock”）'
  - 'taro：__tests__ 里是占位/spec 风格（console.assert/type-level），目前不会实际执行'
---

# 技术规格：Moon Next.js → Taro 微信小程序迁移（Chat 对齐优先）

**创建时间：** 2026-01-31T17:01:09+08:00

## 概述

### 问题陈述

现有 `moon-agent`（Next.js web）已经实现完整业务能力（chat/cart/checkout/pay/profile 等）。现在需要将其重构并移植到 `moon_agent_taro`（Taro 驱动的微信小程序），做到**功能与状态机行为与 web 对齐**，同时允许视觉层面存在小差异。当前 `moon_agent_taro` 已基本移植 chat 页，但仍需把 chat 的关键交互行为与 web 对齐，并继续完成购物车、结算、支付、地址、订单、设置等模块移植。

### 方案概览

以 `moon_agent_taro/src/core/*` 的现有分层为准进行归并重构：从 `moon-agent` 中迁移等价能力（协议/状态管理/页面与组件），并针对微信小程序平台差异做最小必要适配（例如：聊天流式在 weapp 侧使用 WebSocket/分片兜底；路由为 tabBar + 非 tab 页组合）。

### Scope

**In Scope:**
- Chat 与 web 对齐（重点：滚动(如agent在打印自带scroll到正在打印的地方) / 新消息提示 ）
- 模块迁移顺序：`cart → checkout → pay → address → orders → settings`
- 路由结构：`chat/cart/profile` 为 tabBar；其余页面为非 tab 页
- 鉴权策略：access token 存内存；refresh token 存微信 localStorage（以现有实现为准）

**Out of Scope:**
- 像素级对齐 Figma（允许视觉小差异）
- 改造成 monorepo/抽 `packages/core` 供两端共享（明确不做，采用方案 A：维持现有独立 app 结构）
- RN 端支持

## 开发上下文

### Codebase Patterns

- **基准实现（web）**: `moon-agent/*`（Next.js）
  - Chat page is `moon-agent/app/chat/page.tsx` and relies on a global Zustand store `moon-agent/lib/core/store.ts`
  - Message rendering, typewriter effect, and auto-scroll are primarily in `moon-agent/components/chat/ChatInterface.tsx`
  - **Scroll behavior (web)**: always auto-scrolls using `bottomAnchorRef.scrollIntoView()` with multi-attempt timers; no “pause follow + new message hint” state detected in codebase scan
  - **Send gating (web)**: `ChatInput` supports `disabled` prop but page currently does not pass a disabled flag during streaming/typing; tests also appear to expect input disabling in some states that are not wired

- **目标实现（weapp）**: `moon_agent_taro/*`（Taro + React）
  - Chat page is `moon_agent_taro/src/pages/chat/index.tsx` and uses `moon_agent_taro/src/core/stores/index.ts`
  - **Send gating (taro)**: `ChatInput` is explicitly `disabled={isTyping || isStreaming}` and also supports a Stop button while replying
  - **Scroll behavior (taro)**: introduces `isFollowingBottom` + `hasUnreadMessages` with threshold-based scroll detection and a `NewMessageHint` floating button
  - **Typewriter (taro)**: implemented in `MessageBubble` with a “restored vs new message” heuristic so restored messages don’t re-typewrite

- **关键状态标志（chat）**:
  - `isTyping` (waiting for first token / typing indicator)
  - `isStreaming` (receiving partials)
  - `streamingMessageId` (tracks current streaming message)
  - `isFollowingBottom` + `hasUnreadMessages` (taro scroll-follow and hint)

### 参考文件（锚点）

| 文件 | 用途 |
| ---- | ------- |
| `moon-agent/app/chat/page.tsx` | web chat（发送入口、state panel gating） |
| `moon-agent/components/chat/ChatInterface.tsx` | web chat（typewriter + auto-scroll） |
| `moon-agent/lib/core/store.ts` | web chat store（streaming action, flags） |
| `moon-agent/app/chat/page.test.tsx` | web chat page tests（存在与实现不一致的断言） |
| `moon-agent/components/chat/ChatInterface.test.tsx` | web chat interface tests（typewriter timing & rendering） |
| `moon-agent/app/cart/page.tsx` | web cart 参考 |
| `moon-agent/app/checkout/page.tsx` | web checkout 参考 |
| `moon-agent/app/pay/submit/page.tsx` | web pay submit 参考 |
| `moon-agent/app/profile/addresses/*` | web 地址管理参考 |
| `moon_agent_taro/src/pages/chat/index.tsx` | taro chat（scroll follow + hint + send gating） |
| `moon_agent_taro/src/core/stores/index.ts` | taro chat store（scroll state + streaming state） |
| `moon_agent_taro/src/core/components/chat/ChatInput.tsx` | taro input（disabled/isReplying/stop） |
| `moon_agent_taro/src/core/components/chat/NewMessageHint.tsx` | taro “新消息”提示 |
| `moon_agent_taro/src/core/components/chat/MessageBubble.tsx` | taro bubble + typewriter（restored message heuristic） |
| `moon_agent_taro/src/pages/chat/__tests__/chatPage.test.ts` | taro chat acceptance spec（当前为 console.assert 形式，可能滞后于实现） |
| `moon_agent_taro/src/core/stores/__tests__/chatStore.test.ts` | taro store spec（console.assert/type-level） |
| `moon_agent_taro/src/core/chat/h5StreamClient.ts` | taro H5 stream client（ReadableStream） |
| `moon_agent_taro/src/core/chat/weappChunkedClient.ts` | taro weapp chunked client（onChunkReceived） |
| `docs/sprint-artifacts/SM_Stories/*` | web 版需求/验收基线 |
| `docs/sprint-artifacts/taro-migration/*` | 迁移参考（非最终基线） |

### 技术决策

- **优先平台**：微信小程序（weapp）
- **对齐目标**：行为/状态机与 web 对齐（视觉允许小差异）
- **路由结构**：chat/cart/profile 固化为 tabBar，其它为非 tab 页
- **鉴权策略**：access token 存内存；refresh token 存 weapp localStorage（按现状）
- **Chat 发送门禁要求**：不要求复杂的 loading/disabled 视觉，但必须确保任意时刻只能发送一条“在飞”的用户消息（后端处理中/打字机输出中都不能再发第二条）
- **测试与实现可能不一致的点**：
  - web `ChatPage` tests 期望 “size_input disables input”，但当前 `ChatPage` 没有把 `disabled` 传给 `ChatInput`
  - taro 的 spec 文件曾假设 `finalizeStreaming()` 会清理 `fullContent`，但当前 store 实现刻意保留 `fullContent` 以保证打字机连续性

## 实施计划

### 任务拆解

- [x] 任务 1：明确 Chat “只允许一条在飞消息”门禁规则（含打字机阶段）
  - 文件：`moon_agent_taro/src/pages/chat/index.tsx`
  - 动作：以 “isTyping / isStreaming / 打字机正在播放” 三阶段为准，定义页面层统一的 `isReplying`（用于 `ChatInput` 的 disabled/stop 逻辑），确保在后端处理中与打字机输出中都不能发送第二条消息
  - 备注：当前 taro 仅用 `isTyping || isStreaming` 控制输入；但打字机动画可能在 `isStreaming=false` 后继续，此时需要额外门禁信号

- [x] 任务 2：为 taro 增加/暴露打字机 active 信号（用于发送门禁）
  - 文件：`moon_agent_taro/src/core/stores/index.ts`
  - 动作：增加与 web 类似的“打字机 active”状态（例如 `isTypewriterActive`）及 setter；并在合适时机复位
  - 备注：现有 `MessageBubble` 的打字机为组件内状态，页面无法感知；需要建立跨组件的同步点

- [x] 任务 3：将打字机 active 与消息渲染绑定（让 store 可感知动画生命周期）
  - 文件：`moon_agent_taro/src/core/components/chat/MessageBubble.tsx`
  - 动作：在打字机开始/结束时更新 store 的打字机 active（或通过回调/事件桥接），并确保“恢复的历史消息不重新打字”的 heuristic 不被破坏
  - 备注：当前实现区分 restored vs new message（`hasStartedRef`/`initialFullContentLengthRef`）

- [x] 任务 4：对齐 “agent 打字时自动滚动到正在打印的位置”
  - 文件：`moon_agent_taro/src/pages/chat/index.tsx`
  - 动作：让 auto-scroll 的触发依赖包含“最后一条消息的内容变化”（例如 `lastMessage.fullContent` 长度变化），而不只依赖 `messages.length/isTyping/currentState`
  - 备注：web 端 `ChatInterface` 使用 `lastMessageContent`（fullContent/content）作为依赖，能在 streaming/打字机过程中持续滚动

- [x] 任务 5：校验并对齐 “新消息提示”触发逻辑（仅在用户上滑后出现）
  - 文件：`moon_agent_taro/src/core/stores/index.ts`
  - 动作：复核 `hasUnreadMessages` 的置位/清除时机（`addMessage`、`appendStreamingContent`、`setFollowingBottom(true)`、`scrollToBottomAndRead`），确保不会在 followingBottom=true 时误提示
  - 备注：该能力是 taro 侧额外特性；需要与“默认跟随底部”不冲突

- [x] 任务 6：对齐 web vs taro 的 streaming flag 语义（typing → streaming → finalize）
  - 文件：`moon_agent_taro/src/core/stores/index.ts`
  - 动作：复核 `startStreaming()` / `appendStreamingContent()` / `finalizeStreaming()` 的 flag 切换与 `streamingMessageId` 生命周期，保证 UI 状态机一致
  - 备注：taro 的 spec 文件与当前实现存在不一致（spec 认为 finalize 会清 fullContent；实现刻意保留用于打字机）

- [x] 任务 7：校准 taro 侧 ChatInput 的 Stop 行为与门禁行为一致
  - 文件：`moon_agent_taro/src/core/components/chat/ChatInput.tsx`
  - 动作：Stop 出现条件与点击逻辑与新的 `isReplying`/disabled 门禁对齐；确保 stop 后可恢复发送、且不会残留“在飞”状态
  - 备注：当前 Stop 由 `isReplying` 控制、disabled 由 page 传入

- [x] 任务 8：Cart 迁移（从 placeholder 到可用购物车）
  - 文件：`moon_agent_taro/src/pages/cart/index.tsx`
  - 动作：参考 web 的购物车页面与组件，迁移购物车列表、数量选择、失效商品、底部结算栏、地址栏等核心 UI 与交互
  - 备注：web 参考：`moon-agent/app/cart/page.tsx` + `moon-agent/components/cart/*`；数据层参考：`moon-agent/lib/cart/*`
  - 完成：创建了 `@core/cart` 模块（cartApi.ts + useCart.ts）和 `@core/components/cart` 组件（CartHeader/AddressBar/CartFooter/CartProductItem/QuantitySelector/CartStoreSection/InvalidProductItem/CartSkeleton）

- [x] 任务 9：为 taro 新增 checkout 非 tab 页面并接入导航
  - 文件：`moon_agent_taro/src/app.config.ts`
  - 动作：增加 `pages/checkout/index`（以及后续 pay/address/orders/settings 页面）的注册（非 tabBar）
  - 备注：页面结构遵循现有模式：`src/pages/<name>/index.tsx` + `index.config.ts`
  - 完成：已在 app.config.ts 中注册所有后续页面路由（checkout/pay/address/orders/settings）

- [x] 任务 10：Checkout 页面迁移（地址选择、商品清单、支付方式、备注、价格汇总）
  - 文件：`moon_agent_taro/src/pages/checkout/index.tsx`
  - 动作：以 web checkout 为基线迁移；抽取/复用 taro `src/core/components/*` 组件风格与布局
  - 备注：web 参考：`moon-agent/app/checkout/page.tsx` + `moon-agent/components/checkout/*`
  - 完成：创建了 `@core/order` 模块（orderApi.ts + useCheckout.ts）和 `@core/components/checkout` 组件（9个组件）

- [x] 任务 11：Pay 页面迁移（提交支付 + 支付结果页）
  - 文件：`moon_agent_taro/src/pages/pay/submit/index.tsx`
  - 动作：迁移支付提交流程（选择支付方式、生成订单/跳转支付），并实现支付结果页
  - 备注：web 参考：`moon-agent/app/pay/submit/page.tsx`、`moon-agent/app/pay/result/page.tsx`；数据层参考：`moon-agent/lib/payment/*`
  - 完成：创建了 `@core/payment` 模块（payApi.ts）支持微信小程序 wx_lite 渠道，实现了 pay/submit 页面（调用 Taro.requestPayment）和 pay/result 页面（支付结果轮询与状态展示）

- [x] 任务 12：Address 管理迁移（列表/新建/编辑）
  - 文件：`moon_agent_taro/src/pages/profile/addresses/index.tsx`
  - 动作：迁移地址列表与空态；实现新增/编辑页面（Taro 无动态路由时用 query 参数传 id）
  - 备注：web 参考：`moon-agent/app/profile/addresses/*`；数据层参考：`moon-agent/lib/address/*`
  - 完成：创建了 `@core/components/address` 组件（AddressListItem/EmptyState/Skeleton），实现了地址列表页（支持 manage/select 模式）和编辑/新建页（表单验证、删除确认）

- [x] 任务 13：Orders 列表迁移
  - 文件：`moon_agent_taro/src/pages/profile/orders/index.tsx`
  - 动作：迁移订单列表、空态、骨架屏、点击进入详情（若 web 有）
  - 备注：web 参考：`moon-agent/app/profile/orders/page.tsx`；数据层参考：`moon-agent/lib/order/*`
  - 完成：创建了 `@core/order/useOrders.ts` hook 和 `@core/components/order` 组件（OrderListItem/OrderEmptyState/OrderListSkeleton），实现了分页订单列表页面（支持下拉刷新、分页控件、空态、错误重试）

- [x] 任务 14：Settings/Profile 迁移（资料编辑、改密等）
  - 文件：`moon_agent_taro/src/pages/profile/settings/index.tsx`
  - 动作：迁移设置页入口与子页面（edit-profile/change-password），对齐 web 行为与校验
  - 备注：web 参考：`moon-agent/app/profile/settings/*`；数据层参考：`moon-agent/lib/profile/*`
  - 完成：创建了 `@core/user` 模块（userApi.ts + profileSchemas.ts + useUser.ts），实现了设置主页面（修改密码/修改个人信息/退出登录）、修改资料页面（昵称表单验证）和修改密码页面（密码表单验证、显示/隐藏密码）

- [x] 任务 15：全链路回归与差异清单（以 weapp 为准）
  - 文件：`docs/implementation-artifacts/tech-spec-wip.md`
  - 动作：建立“对齐差异清单”并逐项验收：Chat（门禁/滚动/提示）→ cart → checkout → pay → address → orders → settings
  - 备注：重点关注 weapp 的 ScrollView 行为、网络请求/流式策略、以及 token 持久化策略

- [x] 任务 16：接入微信一键登录（weapp）
  - 文件：`moon_agent_taro/src/pages/welcome/index.tsx`
  - 动作：将“微信一键登录”按钮从 toast 占位替换为真实登录流程：调用小程序登录拿 `loginCode`，再通过手机号授权拿 `phoneCode`，最后调用后端接口换取 `accessToken/refreshToken` 并落地（遵循现有 `authClient` 规则），成功后跳转到 chat tab
  - 备注：
    - 后端接口与 payload 参考：`Payment_Interface/.../AppAuthController.http` 的 `/member/auth/weixin-mini-app-login`
    - 更快查看接口：`moon_agent_taro/Swagger UI.html`

- [x] 任务 17：新增 weapp 微信登录的 authClient 能力（请求封装 + token 落地）
  - 文件：`moon_agent_taro/src/core/auth/authService.ts`
  - 动作：新增 `loginWithWeixinMiniApp`（或等价命名）方法，封装 `/member/auth/weixin-mini-app-login` 请求、token 落地与错误处理；并对齐 `loginWithSms` 的持久化策略（accessToken 进内存+Storage；refreshToken 仅 weapp Storage）
  - 备注：需要同时更新 payload 类型定义

- [x] 任务 18：补齐微信登录相关类型定义
  - 文件：`moon_agent_taro/src/core/auth/types.ts`
  - 动作：新增微信小程序登录 payload 类型（包含 `phoneCode`、`loginCode`），并确保字段名与后端一致

- [x] 任务 19：校验微信小程序域名/合法域配置（登录 + 后续请求）
  - 文件：`moon_agent_taro/project.config.json`
  - 动作：检查并记录：请求域名/下载域名/WS 域名白名单是否满足登录接口调用与后续业务请求；必要时补充文档说明
  - 完成：更新了 `__DOMAIN_WHITELIST_NOTE__`，添加生产环境 API 域名 `www.moonagent.com.cn`，WebSocket 域名配置，以及详细的配置指南

- [x] 任务 20：对齐“tab 切换不中断流式与打字机输出”（taro vs web）
  - 文件：`moon_agent_taro/src/pages/chat/index.tsx`
  - 动作：验证并对齐 web 行为：在 assistant 流式/打字机输出过程中切换到 cart/profile 再切回，输出不应中断；切回后应继续增长并能 catch-up 到最新
  - 备注：
    - 当前 taro chat 页持有 `streamConnectionRef`，并在 `useEffect` cleanup（unmount）里会 `abort()`（见 `src/pages/chat/index.tsx`），需要确认 tabBar 切换是否会触发 unmount；若会，需要把 streaming connection 生命周期从页面搬到更“全局”的位置（例如 store 或 core/chat manager），参照 web 端 `moon-agent/lib/core/store.ts` 的“后台流式 action”模式

- [x] 任务 21：商品推荐组件“出现后持久显示，不被后续 state 覆盖”
  - 文件：`moon_agent_taro/src/pages/chat/index.tsx`
  - 动作：实现“推荐组件粘性展示”机制：一旦推荐（recommendation/recommendations）出现并展示，就算用户后续继续对话导致 `currentState` 被清空/更新，推荐组件仍应保留显示（直到用户显式关闭/完成某个动作）
  - 备注：
    - 当前实现中，`sendMessageToApi()` 会 `setCurrentState(null)`，会导致 state panel 消失；需要引入独立于 `currentState` 的“粘性面板状态”（例如 pinned/sticky panel），并让 `ProductRecommendation` 读取 store 的 `recommendedProducts` 持续渲染
    - 推荐组件本体参考：`moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx`（当前已有 auto-open 逻辑，但不保证“持久显示”）

### 验收标准（Acceptance Criteria）

- [ ] AC 1: 假设用户在 chat 页且没有在飞回复，当用户发送一条消息，则会追加一条用户消息并开始生成助手回复（typing/streaming 任一阶段）
- [x] AC 2: 假设助手正在后端处理（isTyping=true）或正在接收流式增量（isStreaming=true），当用户尝试再次发送消息，则发送会被阻止且不会新增第二条用户消息
- [x] AC 3: 假设助手回复正在打字机输出阶段（typewriter 未完成），当用户尝试再次发送消息，则发送会被阻止且不会新增第二条用户消息
- [x] AC 4: 假设用户停留在消息底部（following bottom），当助手的流式内容增长或打字机继续输出，则视图会持续自动滚动到正在输出的位置
- [x] AC 5: 假设用户上滑离开底部（following bottom=false），当新的助手内容到达（包含 streaming delta），则不会强制滚动且会展示“新消息”提示
- [x] AC 6: 假设“新消息”提示可见，当用户点击提示，则会滚动回底部并清除未读标记，恢复 following bottom=true
- [x] AC 7: 假设用户点击 Stop 按钮，当当前有在飞回复，则会中止当前流式连接并进入可再次发送的新状态（无残留 streaming/typing/typewriter 门禁）
- [ ] AC 8: 假设购物车里存在商品，当用户在 cart 页修改数量/删除/结算，则购物车状态与 UI 会同步更新且能进入 checkout
- [ ] AC 9: 假设用户在 checkout 页，当选择地址/配送/支付方式并提交，则会创建订单并进入支付提交流程
- [ ] AC 10: 假设支付提交完成（成功或失败），当跳转到支付结果页，则会展示对应结果并允许返回订单列表
- [ ] AC 11: 假设用户进入地址管理页，当新增/编辑/删除地址，则列表会正确更新且 checkout 可选择最新地址
- [ ] AC 12: 假设用户进入订单列表，当订单加载成功/为空/失败，则分别展示列表/空态/错误提示（含可重试）
- [ ] AC 13: 假设用户在 welcome 页点击“微信一键登录”，当授权流程成功完成，则会拿到后端签发的 token（accessToken/refreshToken）并跳转到 chat（后续请求携带鉴权信息）
- [x] AC 14: 假设 assistant 正在流式/打字机输出，当用户切换到 cart/profile 并在 3 秒内切回 chat，则输出不会中断，返回后会继续增长并最终与后端输出对齐
- [x] AC 15: 假设商品推荐组件已经出现并展示，当用户继续发送新消息导致 `currentState` 变化/清空，则商品推荐组件仍保持可见且不被其它 state panel 覆盖（除非用户显式关闭/完成关闭动作）

## 其他上下文

### 依赖

- **前端框架**：
  - `moon_agent_taro`: Taro 4.1.9 + React 18 + TypeScript
  - `moon-agent`: Next.js + React + TypeScript
- **状态管理/校验**：Zustand，Zod
- **UI**：
  - taro: `@nutui/nutui-react-taro`, `taro-icons`, `@taroify/icons`
  - web: `framer-motion`, `react-markdown`
- **后端/API 依赖**：
  - chat：需要 weapp 可用的流式通道（当前为 chunked client / 或 WS 方案），并且协议与 web 保持一致（state payload / text delta）
  - cart/checkout/pay/address/order/profile：依赖现有 `moon-agent/lib/*` 对应的 API 端点与数据结构

### 测试策略

- **单元测试（web 参考）**：
  - 参考 `moon-agent` 的 vitest/RTL 测试组织方式（module mock + store mock）
- **单元测试（taro）**：
  - 短期：保持现有 `__tests__` 的“spec 文档”角色，但需要同步修正与实现不一致之处
  - 中期：补齐可执行的测试栈（若纳入本次范围，可单独作为 task）
- **手工测试（weapp，必做）**：
  - chat：发送门禁（typing/streaming/typewriter）、Stop、上滑暂停滚动与新消息提示、回到底部
  - cart/checkout/pay：下单与支付结果链路
  - address/orders/settings：CRUD 与页面跳转

### 备注

- Figma 原型：`https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=0-1&t=DJfV9b7XttA42GTZ-1`
- **风险：打字机 vs 发送门禁**：taro 当前页面门禁仅基于 `isTyping/isStreaming`，需要补齐 typewriter 生命周期信号，否则会出现“打字机未结束但可再次发送”的并发问题
- **风险：weapp ScrollView**：streaming delta 不一定触发页面 effect（`messages.length` 不变），需要确保 scroll 依赖包含内容变化；同时 `scrollIntoView` 在 weapp 有相同值不触发的问题（已用 clear+set 规避）
- **风险：测试漂移**：taro 的 spec 文件与实现存在不一致；需要在迁移推进过程中持续校准，否则无法作为验收依据
