# Story 4.3: 购物车管理与页面开发 (Cart Management & Page Development)

Status: Ready for Review

## Story

作为一名 **用户**，
我想要 **将心仪的内衣加入购物车，并统一管理**，
以便 **我可以批量结算我选择的商品**。

## 验收标准 (Acceptance Criteria)

1. **页面布局与导航**:

   - **Given** 用户进入购物车页面。
   - **Then** 顶部显示“购物车”标题及商品总数，背景为品牌粉紫渐变。
   - **And** 显示 **配送地址栏**: "配送至: [当前默认地址]"，样式参考 Figma 151:212。
   - **And** 底部导航栏保持购物车入口选中状态。

2. **商品列表展示**:

   - **Given** 后端返回购物车数据。
   - **Then** 分别展示 **有效商品列表 (`validList`)** 和 **失效商品列表 (`invalidList`)**。
   - **And** 每个有效商品项包含：
     - 左侧 **选择框**: 绑定 `selected` 字段，支持单选/取消。
     - 商品图片: 优先使用 `sku.picUrl`，若不存在则使用 `spu.picUrl`。
     - 商品名称: 展示 `spu.name`。
     - 规格展示: 遍历 `sku.properties` 数组，将 `propertyName` 与 `valueName` 拼接（如：“尺码: 75D; 颜色: 黑色”）。
     - 价格显示: 使用 `sku.price` (粉色 `#EC4899`)。
     - **数量加减组件**: 绑定 `count` 字段，支持实时修改。
   - **And** 失效商品项（`invalidList`）：样式置灰，不可勾选，明确标注“已失效”或相关原因。

3. **底部操作栏**:

   - **Given** 用户在购物车页面。
   - **Then** 左侧显示 "全选" 复选框。
   - **And** 中间显示 "合计: ¥[总金额]" (金额使用 `#EC4899` 粗体)。
   - **And** 右侧 **“结算”按钮**: 使用品牌红粉渐变 (`linear-gradient(105deg, #DA3568, #FB7185)`)，圆角设计。

4. **交互逻辑**:
   - **When** 用户修改商品数量或勾选状态。
   - **Then** 前端即时响应并调用后端同步接口，确保数据持久化。
   - **When** 用户点击“结算”。
   - **Then** 校验是否选中有效商品，若选中则跳转至确认订单页。

## 任务拆解 (Tasks)

### Task 1: 基础结构与 UI 壳层搭建 (UI Shell)

- [x] 实现 `app/cart/page.tsx` 页面基础布局。
- [x] 开发 `CartHeader` 组件，显示动态商品总数。
- [x] 实现 `AddressBar` 配送地址展示组件。

### Task 2: API 集成与数据流管理 (Data Fetching)

- [x] 在 `lib/cartApi.ts` 中封装购物车相关 CRUD 接口。
- [x] 使用 `React Query` 的 `useQuery` 实现 `cartList` 数据获取。
- [x] 定义并实现 `AppCartListRespVO` 到前端组件的数据映射逻辑。

### Task 3: 核心列表与商品组件 (Components)

- [x] 开发 `CartStoreSection` 店铺分组组件。
- [x] 开发 `CartProductItem` 有效商品项组件（含 Checkbox、规格、数量加减）。
- [x] 实现 `InvalidProductItem` 失效商品展示样式。

### Task 4: 操作逻辑与同步 (Operations)

- [x] 封装数量更新 mutation (`PUT /trade/cart/update-count`)。
- [x] 封装选中状态切换 mutation (`PUT /trade/cart/update-selected`)。
- [x] 实现商品删除/批量删除逻辑 (`DELETE /trade/cart/delete`)。

### Task 5: 全选结算与金额计算 (Checkout Logic)

- [x] 实现前端全选/反选逻辑。
- [x] 实现基于勾选状态的实时金额计算引擎（分转元处理）。
- [x] 实现"结算"按钮跳转及前置条件校验。

## 技术注意事项 (Technical Notes)

- **接口路径**:
  - 查询列表: `GET /app-api/trade/cart/list`
  - 更新数量: `PUT /app-api/trade/cart/update-count`
  - 选中状态: `PUT /app-api/trade/cart/update-selected`
  - 删除商品: `DELETE /app-api/trade/cart/delete`
- **样式指南**: 严格遵守 UX.md 定义的颜色变量，特别是品牌粉色 `#EC4899` 和紫色按钮渐变。
- **状态同步**: 确保操作后的缓存更新 (`invalidateQueries`)，维持全局一致性。

## 引用资源

- [Figma Node: 151:173 (Cart Page)](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=151-173)
- [stories.md: Story 4.3 原始定义]

## Dev Agent Record

### Implementation Notes (2025-12-28)

**Completed Components:**

- `components/cart/CartHeader.tsx` - Page header with dynamic item count
- `components/cart/AddressBar.tsx` - Delivery address display with navigation
- `components/cart/CartFooter.tsx` - Bottom action bar with select-all, total, checkout
- `components/cart/QuantitySelector.tsx` - Quantity increment/decrement control
- `components/cart/CartProductItem.tsx` - Valid product item with checkbox, image, details
- `components/cart/CartStoreSection.tsx` - Store grouping container
- `components/cart/InvalidProductItem.tsx` - Invalid/expired item display

**API & Data Layer:**

- `lib/cartApi.ts` - Type definitions (CartItem, CartSku, CartSpu, etc.) and API functions
- `lib/useCart.ts` - React Query hooks with optimistic updates and caching

**Technical Decisions:**

1. Used optimistic updates for all mutations (count, selection, delete) for instant UI feedback
2. Implemented `groupCartItemsByStore` utility for future multi-store support
3. Price handling: All prices stored in cents (分), converted to yuan for display
4. Used Radix UI Checkbox for accessible, customizable checkbox components
5. Followed existing project patterns for styling (Tailwind + CSS variables)

### Test Coverage

- 63 tests passing (7 test files)
- Unit tests for all utility functions in cartApi.ts
- Component tests for all cart components
- Integration tests for React Query hooks

### File List

**New Files:**

- `components/cart/CartHeader.tsx`
- `components/cart/CartHeader.test.tsx`
- `components/cart/AddressBar.tsx`
- `components/cart/AddressBar.test.tsx`
- `components/cart/CartFooter.tsx`
- `components/cart/CartFooter.test.tsx`
- `components/cart/QuantitySelector.tsx`
- `components/cart/QuantitySelector.test.tsx`
- `components/cart/CartProductItem.tsx`
- `components/cart/CartStoreSection.tsx`
- `components/cart/CartStoreSection.test.tsx`
- `components/cart/InvalidProductItem.tsx`
- `components/cart/index.ts`
- `lib/cartApi.ts`
- `lib/cartApi.test.ts`
- `lib/useCart.ts`
- `lib/useCart.test.ts`

**Modified Files:**

- `app/cart/page.tsx` - Complete rewrite with full cart functionality

### Change Log

- 2025-12-28: Story 4.3 implementation completed with all tasks and tests passing
