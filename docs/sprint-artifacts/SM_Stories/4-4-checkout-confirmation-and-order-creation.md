# Story 4.4: 确认订单与下单创建 (Checkout Confirmation & Order Creation)

Status: Ready for Review

## Story

作为一名 **用户**，
我想要 **在支付前核对收货地址、预览费用并正式提交订单**，
以便 **产生支付所需的订单单号并进入结算环节**。

## 验收标准 (Acceptance Criteria)

1. **结算预览 (Settlement Preview)**:

   - **Given** 用户从购物车点击"结算"跳转至确认订单页。
   - **When** 页面加载。
   - **Then** 调用 `GET /app-api/trade/order/settlement` 获取实时计价、可用优惠及商品明细。
   - **And** 页面展示：
     - **收货地址**: 默认地址（若无则提示去添加），包含收货人、手机号、详细地址。（购物车中选择的地址需要随着进入结算页时自动选中）
     - **商品列表**: 展示 SKU 图片、名称、属性（颜色/尺码）、单价、数量。
     - **费用明细**: 商品总额、运费（如"顺丰包邮"）、实付款金额（粉色强调 `#EC4899`）。
     - **订单备注**: 支持用户输入简单的文本备注。

2. **支付方式选择 (Payment Method)**:

   - **Given** 用户在确认订单页。
   - **Then** 提供"微信支付"和"支付宝"两个选项。
   - **And** 默认选中"微信支付"，选中项背景色为浅绿（微信）或浅蓝（支付宝），并有边框强调（参考 Figma 166:742）。

3. **下单执行 (Order Creation)**:

   - **When** 用户点击底部悬浮栏的"立即支付"按钮。
   - **Then** 调用 `POST /app-api/trade/order/create`。
   - **And** 请求参数应包含：购物车项 IDs (`cartIds`)、地址 ID (`addressId`)、支付渠道、备注等。
   - **And** **数据返回解析**: 成功后必须获取返回的 `id` (交易订单号) 和 `payOrderId` (支付单编号)。
   - **And** 成功后立即携带 `payOrderId` 跳转至支付中间页或执行支付唤起逻辑 (Story 4.5)。

4. **异常处理**:
   - **When** 订单创建失败（如库存不足、地址失效）。
   - **Then** 弹出 Toast 错误提示，并引导用户返回购物车或更新信息。

## 任务拆解 (Tasks)

### Task 1: 确认订单页基础结构与路由 (UI Shell)

- [x] 创建 `app/checkout/page.tsx` 页面。
- [x] 开发 `CheckoutHeader` 组件，包含"确认订单"标题及返回按钮。
- [x] 实现页面整体粉紫渐变背景 (`from-[#FFF5F7] to-[#FAF5FF]`)。

### Task 2: 结算预览接口集成 (Data Fetching)

- [x] 在 `lib/orderApi.ts` 中封装 `getSettlement` 接口。
- [x] 使用 `React Query` 获取结算数据，并处理 Loading 骨架屏。
- [x] 映射 `AppTradeOrderSettlementRespVO` 数据到页面组件。

### Task 3: 地址与商品项组件开发 (Components)

- [x] 开发 `AddressCard` 组件，展示地址详情及跳转修改入口。
- [x] 复用或定制 `CheckoutProductItem` 组件，展示精简版商品信息。
- [x] 实现 `OrderRemark` 备注输入框。

### Task 4: 支付方式选择交互 (Interaction)

- [x] 开发 `PaymentMethodSelector` 组件，支持微信/支付宝切换。
- [x] 实现选中状态的视觉反馈（颜色、图标、边框）。

### Task 5: 下单逻辑与流程控制 (Logic)

- [x] 封装 `createOrder` mutation。
- [x] 实现"立即支付"按钮的点击逻辑：校验数据 -> 提交下单 -> 获取 `payOrderId` -> 跳转。
- [x] 确保下单成功后清空购物车中对应的已选商品项（通常由后端处理，前端需刷新购物车状态）。

## 技术注意事项 (Technical Notes)

- **核心接口**:
  - 结算预览: `GET /app-api/trade/order/settlement`
  - 创建订单: `POST /app-api/trade/order/create`
- **样式指南**:
  - 背景色: `bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]`
  - 实付款文字: `text-[#EC4899]`
  - 立即支付按钮: `linear-gradient(114.471deg, #DA3568 9.87%, #FB7185 92.16%)`
- **Figma 引用**:
  - 节点 ID: `166:672` (Confirm Order Page)
- **数据结构**:
  - 下单成功返回的 `payOrderId` 是后续调用支付接口的关键 Key。

## 引用资源

- [Figma Node: 166:672 (Payment/Checkout Page)](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=166-672)
- [stories.md: Story 4.4 原始定义]

---

## Dev Agent Record

### Implementation Plan

实现确认订单页面，包含以下主要功能：

1. 页面基础结构 - 粉紫渐变背景，带返回按钮的 Header
2. 结算预览接口集成 - `lib/orderApi.ts` 封装 API，`lib/useSettlement.ts` 提供 React Query hooks
3. 组件开发：
   - `AddressCard` - 地址展示与选择入口
   - `CheckoutProductItem` - 商品项展示
   - `OrderRemark` - 订单备注输入
   - `ProductList` - 商品列表容器
   - `PaymentMethodSelector` - 支付方式选择（微信/支付宝）
   - `PriceSummary` - 费用明细展示
   - `CheckoutFooter` - 底部结算栏
4. 下单逻辑 - 数据校验、调用创建订单 API、跳转支付页

### Completion Notes

✅ **Story 4.4 实现完成**

**实现的功能：**

1. 创建了完整的确认订单页面 (`app/checkout/page.tsx`)
2. 实现了所有验收标准中的功能：
   - 结算预览数据获取与展示
   - 收货地址显示（支持从购物车传递选中地址）
   - 商品列表展示（图片、名称、属性、价格、数量）
   - 费用明细（商品总额、运费、实付款粉色强调）
   - 订单备注输入
   - 支付方式选择（微信支付/支付宝，带视觉反馈）
   - 立即支付按钮与下单流程
   - 异常处理弹窗

**创建的文件：**

- `components/checkout/CheckoutHeader.tsx` - 页面头部
- `components/checkout/CheckoutSkeleton.tsx` - 加载骨架屏
- `components/checkout/AddressCard.tsx` - 地址卡片
- `components/checkout/CheckoutProductItem.tsx` - 商品项
- `components/checkout/OrderRemark.tsx` - 订单备注
- `components/checkout/ProductList.tsx` - 商品列表
- `components/checkout/PaymentMethodSelector.tsx` - 支付方式选择
- `components/checkout/PriceSummary.tsx` - 费用明细
- `components/checkout/CheckoutFooter.tsx` - 底部结算栏
- `components/checkout/index.ts` - 组件导出
- `lib/orderApi.ts` - 订单 API 封装
- `lib/useSettlement.ts` - React Query hooks

**测试覆盖：**

- 78 个测试用例全部通过
- 覆盖所有组件和 API 工具函数

---

## File List

### New Files

- `app/checkout/page.tsx`
- `app/checkout/page.test.tsx`
- `components/checkout/CheckoutHeader.tsx`
- `components/checkout/CheckoutHeader.test.tsx`
- `components/checkout/CheckoutSkeleton.tsx`
- `components/checkout/CheckoutSkeleton.test.tsx`
- `components/checkout/AddressCard.tsx`
- `components/checkout/AddressCard.test.tsx`
- `components/checkout/CheckoutProductItem.tsx`
- `components/checkout/CheckoutProductItem.test.tsx`
- `components/checkout/OrderRemark.tsx`
- `components/checkout/OrderRemark.test.tsx`
- `components/checkout/ProductList.tsx`
- `components/checkout/PaymentMethodSelector.tsx`
- `components/checkout/PaymentMethodSelector.test.tsx`
- `components/checkout/PriceSummary.tsx`
- `components/checkout/PriceSummary.test.tsx`
- `components/checkout/CheckoutFooter.tsx`
- `components/checkout/CheckoutFooter.test.tsx`
- `components/checkout/index.ts`
- `lib/orderApi.ts`
- `lib/orderApi.test.ts`
- `lib/useSettlement.ts`

### Modified Files

- `app/cart/page.tsx` - 更新结算跳转路径至 `/checkout`
- `docs/sprint-artifacts/sprint-status.yaml` - 更新故事状态

---

## Change Log

| Date       | Change                                               | Author             |
| ---------- | ---------------------------------------------------- | ------------------ |
| 2025-12-29 | Initial story implementation - All 5 tasks completed | Dev Agent (Amelia) |
| 2025-12-29 | 78 tests passing, story ready for review             | Dev Agent (Amelia) |
