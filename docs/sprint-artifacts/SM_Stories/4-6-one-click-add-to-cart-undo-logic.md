# Story 4.6: 推荐卡片一键加购与“后悔药”撤回机制 (One-click Add to Cart & Undo Logic)

## 1. 任务概述

作为一名 **用户**，我想要在看到心仪的内衣推荐时，能够一键将其加入购物车，并在发现加错或想改变主意时，能通过弹出的提示框一键撤回加购操作，以便享受丝滑的购物体验，减少繁琐的跳转和管理成本。

## 2. 验收标准 (Acceptance Criteria)

- **Given** 用户正在查看“满月”提供的商品推荐卡片。
- **When** 用户点击卡片上的“加入购物车”按钮。
- **Then** 前端应提取该商品的 `sku_id`。
- **And** 调用后端接口 `POST /app-api/trade/cart/add`，参数包含 `skuId` 和 `count: 1`。
- **And** 请求成功后，界面显示包含“撤回”按钮的 Toast 提示。
- **And** 推荐卡片的按钮状态变为“已加购”（置灰或禁用）。
- **When** 用户点击 Toast 上的“撤回”按钮。
- **Then** 前端应立即调用后端删除接口 `DELETE /app-api/trade/cart/delete?ids={cartId}`。
- **And** 撤回成功后，Toast 提示变为“已撤回”，且推荐卡片的按钮恢复为“加入购物车”状态。

## 3. 技术实现建议 (Technical Notes)

- **接口对接 (Native Fetch)**:
  - 必须通过基于原生 `fetch` 封装的 `lib/api.ts` 进行调用，不再使用 Axios。
  - **添加购物车**: `POST /app-api/trade/cart/add`，Body: `{ skuId: number, count: number }`。
  - **删除/撤回购物车**: `DELETE /app-api/trade/cart/delete`，Query: `ids` (逗号分隔的购物车项 ID)。
- **认证状态集成 (NextAuth)**:
  - 在组件层或 Hook 中，通过 `useSession()` 钩子获取最新的 `accessToken`。
  - 确保请求 Header 中包含 `Authorization: Bearer [token]`，该逻辑应由 `lib/api.ts` 的 `clientFetch` 统一处理。
- **数据流管理 (React Query)**:
  - 使用 `useMutation` 钩子封装加购和删除操作。
  - **关键同步**: 在 `useMutation` 的 `onSuccess` 回调中，必须调用 `queryClient.invalidateQueries({ queryKey: ['cartList'] })`，以确保购物车全局状态同步更新。
- **撤回逻辑实现**:
  - `POST /trade/cart/add` 接口成功后会返回创建的购物车项 ID (`cartId`)。
  - 前端需暂存此 `cartId` 到 Toast 的上下文或闭包中。
  - 当用户触发“撤回”时，使用该 `cartId` 调用删除接口，模拟撤回效果。
- **UI 组件**: 使用 `sonner` 的 `toast.custom` 自定义样式，保持设计稿的圆润紫色风格。
- **数据流**: `isAdded` 状态应在组件层维护。为了支持“撤回”后的即时恢复，`setAddedProducts` 应在撤回接口成功后执行删除操作。

## 4. 任务拆解 (Tasks)

### Task 1: API 适配与封装

- [x] 在 `lib/cartApi.ts` (或其他对应位置) 中，将购物车添加/删除接口迁移至原生 `fetch` 实现。
- [x] 确保接口能够正确处理 `cartId` 的返回，以便后续撤回操作使用。

### Task 2: 加购交互逻辑实现

- [x] 在 `ProductRecommendation` 组件中集成 `useMutation`。
- [x] 实现点击“加入购物车”后的状态变更（按钮禁用、Loading）。
- [x] 集成 `sonner` Toast，展示带“撤回”按钮的自定义提示。

### Task 3: “后悔药”撤回机制实现

- [x] 实现点击 Toast 撤回按钮后的删除请求逻辑。
- [x] 实现撤回成功后的状态恢复（按钮恢复可用、Toast 更新）。
- [x] 处理撤回过程中的异常情况（如网络错误时的提示）。

### Task 4: 状态同步与清理

- [x] 确保加购/撤回操作后，购物车全局计数的准确同步。
- [x] 优化缓存管理，避免重复请求。

## 5. 引用资源

- **Figma**: 涉及推荐卡片 (`14:4560`) 及 Toast 样式。
- **PRD**: 节点四：商场与支付。
