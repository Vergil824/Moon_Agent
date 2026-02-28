# Taro 微信小程序对齐差异清单

**创建时间:** 2026-02-03
**状态:** WIP

本文档记录 `moon_agent_taro`（Taro 微信小程序）与 `moon-agent`（Next.js Web）的对齐状态，重点关注功能行为对齐（视觉允许小差异）。

---

## 1. Chat 模块对齐

### 1.1 发送门禁（Send Gating）

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| typing 阶段禁止发送 | `isTyping` 控制 | `isReplying = isTyping \|\| isStreaming \|\| isTypewriterActive` | ✅ 对齐 |
| streaming 阶段禁止发送 | `isStreaming` 控制 | 同上 | ✅ 对齐 |
| 打字机阶段禁止发送 | `isTypewriterActive` 控制 | 已实现 `isTypewriterActive` 信号 | ✅ 对齐 |
| Stop 按钮清除门禁 | 点击后立即可发送 | `setIsTypewriterActive(false)` + `finalizeStreaming()` | ✅ 对齐 |

### 1.2 自动滚动（Auto Scroll）

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 新消息自动滚动 | `scrollIntoView` 多次尝试 | `scrollIntoView` + `scrollTop` 兜底 | ✅ 对齐 |
| streaming 内容增长滚动 | `lastMessageContent` 依赖 | 依赖 `lastMessageContent` | ✅ 对齐 |
| 用户上滑暂停滚动 | `isFollowingBottom` 检测 | `SCROLL_BOTTOM_THRESHOLD` 检测 | ✅ 对齐 |
| 新消息提示 | 无此功能 | `NewMessageHint` 组件 | ✅ Taro 增强 |

### 1.3 流式/打字机

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| H5 流式 | SSE ReadableStream | `h5StreamClient` | ✅ 对齐 |
| WeApp 流式 | N/A | `weappChunkedClient` | ✅ Taro 专有 |
| 打字机效果 | `MessageBubble` 内部 | `MessageBubble` 内部 | ✅ 对齐 |
| 恢复消息不重复打字 | 历史消息标记 | `hasStartedRef` 启发式 | ✅ 对齐 |

### 1.4 状态面板（State Panel）

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| WelcomeOptions | 欢迎选项 | ✅ 已实现 | ✅ 对齐 |
| ShapeSelection | 胸型选择 | ✅ 已实现 | ✅ 对齐 |
| PainPointGrid | 痛点多选 | ✅ 已实现 | ✅ 对齐 |
| MeasureGuide | 测量引导 | ✅ 已实现 | ✅ 对齐 |
| AuxiliaryInput | 辅助数据 | ✅ 已实现 | ✅ 对齐 |
| LoadingAnalysis | 分析加载 | ✅ 已实现 | ✅ 对齐 |
| ProductRecommendation | 商品推荐 | ✅ 已实现 | ✅ 对齐 |

---

## 2. Cart 购物车模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 购物车列表 | 店铺分组展示 | `CartStoreSection` 组件 | ✅ 对齐 |
| 商品数量修改 | +/- 控件 | `QuantitySelector` 组件 | ✅ 对齐 |
| 商品删除 | 滑动/点击删除 | 长按删除 | ⚠️ 交互差异 |
| 失效商品 | 独立展示 | `InvalidProductItem` 组件 | ✅ 对齐 |
| 底部结算栏 | 全选/价格/结算 | `CartFooter` 组件 | ✅ 对齐 |
| 地址栏 | 选择地址入口 | `AddressBar` 组件 | ✅ 对齐 |
| 骨架屏 | 加载占位 | `CartSkeleton` 组件 | ✅ 对齐 |
| 空态 | 空购物车提示 | 已实现 | ✅ 对齐 |

---

## 3. Checkout 结算模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 地址选择 | 地址卡片 | `AddressCard` 组件 | ✅ 对齐 |
| 商品清单 | 商品列表 | `ProductList` + `CheckoutProductItem` | ✅ 对齐 |
| 支付方式 | 支付宝/微信 | `PaymentMethodSelector`（微信优先） | ✅ 对齐 |
| 订单备注 | 输入框 | `OrderRemark` 组件 | ✅ 对齐 |
| 价格汇总 | 明细展示 | `PriceSummary` 组件 | ✅ 对齐 |
| 提交订单 | 底部按钮 | `CheckoutFooter` 组件 | ✅ 对齐 |

---

## 4. Pay 支付模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 支付提交 | H5 跳转支付 | `Taro.requestPayment` | ✅ 平台适配 |
| 支付渠道 | wx_pub / alipay_wap | wx_lite（小程序专用） | ✅ 平台适配 |
| 支付结果轮询 | 轮询订单状态 | `payApi.getPayResult` | ✅ 对齐 |
| 成功/失败页 | 结果展示 | `pay/result/index.tsx` | ✅ 对齐 |

---

## 5. Address 地址模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 地址列表 | 列表展示 | `AddressListItem` 组件 | ✅ 对齐 |
| 新增地址 | 表单页 | `addresses/edit/index.tsx` | ✅ 对齐 |
| 编辑地址 | 同上 | 复用 edit 页面 | ✅ 对齐 |
| 删除地址 | 确认弹窗 | `Taro.showModal` | ✅ 对齐 |
| 设为默认 | 单选 | 已实现 | ✅ 对齐 |
| 空态 | 空地址提示 | `AddressEmptyState` | ✅ 对齐 |
| 选择模式 | Checkout 跳转 | `mode=select` 参数 | ✅ 对齐 |

---

## 6. Orders 订单模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 订单列表 | 分页展示 | `useOrderList` hook | ✅ 对齐 |
| 订单项 | 商品/状态/价格 | `OrderListItem` 组件 | ✅ 对齐 |
| 分页控件 | 页码导航 | 分页组件 | ✅ 对齐 |
| 下拉刷新 | N/A | `usePullDownRefresh` | ✅ Taro 增强 |
| 空态 | 空订单提示 | `OrderEmptyState` | ✅ 对齐 |
| 骨架屏 | 加载占位 | `OrderListSkeleton` | ✅ 对齐 |

---

## 7. Settings 设置模块对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| 设置主页 | 菜单入口 | 修改密码/修改资料/退出登录 | ✅ 对齐 |
| 修改密码 | 表单验证 | Zod schema + 密码显隐 | ✅ 对齐 |
| 修改资料 | 昵称/头像 | 表单验证 | ✅ 对齐 |
| 退出登录 | 清除 token | `authClient.clearTokens()` | ✅ 对齐 |

---

## 8. 鉴权策略对齐

| 功能点 | Web 行为 | Taro 行为 | 状态 |
|--------|----------|-----------|------|
| Access Token 存储 | Cookie/Session | 内存 + Storage | ✅ 平台适配 |
| Refresh Token 存储 | HttpOnly Cookie | Storage（weapp） | ✅ 平台适配 |
| Token 刷新 | 自动刷新 | `authClient.refreshAccessToken()` | ✅ 对齐 |
| 401 处理 | 跳转登录 | 事件触发 + 跳转 | ✅ 对齐 |

---

## 9. 已知差异/待优化

### 9.1 视觉差异（允许）

- 动画效果：Web 使用 `framer-motion`，Taro 使用 CSS 动画
- 图标库：Web 使用 `lucide-react`，Taro 使用 `taro-icons` + `@taroify/icons`
- 滚动条：Web 显示滚动条，Taro 隐藏滚动条

### 9.2 功能差异

- **购物车删除交互**: Web 滑动删除，Taro 长按删除（待确认）
- **微信登录**: 待实现（任务 16-19）
- **Tab 切换流式保持**: 待验证（任务 20）
- **推荐组件持久显示**: 待实现（任务 21）

---

## 10. 验收标准对照

| AC | 描述 | 状态 |
|----|------|------|
| AC 1 | 发送消息触发回复 | ⏳ 待手工验证 |
| AC 2 | typing/streaming 禁止重复发送 | ✅ 代码对齐 |
| AC 3 | 打字机阶段禁止发送 | ✅ 代码对齐 |
| AC 4 | following bottom 自动滚动 | ✅ 代码对齐 |
| AC 5 | 上滑暂停滚动 + 新消息提示 | ✅ 代码对齐 |
| AC 6 | 点击新消息提示滚动到底 | ✅ 代码对齐 |
| AC 7 | Stop 按钮中止并可重新发送 | ✅ 代码对齐 |
| AC 8 | 购物车操作 | ⏳ 待手工验证 |
| AC 9 | Checkout 流程 | ⏳ 待手工验证 |
| AC 10 | 支付结果页 | ⏳ 待手工验证 |
| AC 11 | 地址管理 CRUD | ⏳ 待手工验证 |
| AC 12 | 订单列表展示 | ⏳ 待手工验证 |
| AC 13 | 微信一键登录 | ❌ 待实现（任务 16-19） |
| AC 14 | Tab 切换不中断流式 | ❌ 待验证（任务 20） |
| AC 15 | 推荐组件持久显示 | ❌ 待实现（任务 21） |

---

## 11. 测试建议

### 11.1 手工测试清单

**Chat 模块:**
- [ ] 发送消息触发回复
- [ ] typing/streaming/typewriter 阶段尝试发送
- [ ] Stop 按钮功能
- [ ] 上滑暂停 + 新消息提示
- [ ] 点击新消息提示滚动

**购物车/结算/支付:**
- [ ] 添加商品到购物车
- [ ] 修改数量/删除商品
- [ ] 结算流程
- [ ] 支付流程（需要真实支付环境）

**地址/订单/设置:**
- [ ] 地址 CRUD
- [ ] 订单列表分页
- [ ] 修改密码/资料
- [ ] 退出登录

### 11.2 自动化测试

- Taro 侧暂为占位 spec 文件
- 可考虑补充可执行的单元测试（非本次范围）
