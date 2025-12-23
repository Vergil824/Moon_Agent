# Story 4.2: 推荐卡片与“推荐理由”动态展示 (Recommendation Card & Dynamic Reasons)

Status: Ready for Review

## Story

作为一名 **用户**，
我想要 **在完成诊断后看到针对我身体特征的个性化推品及“推荐理由”**，
以便 **我能理解为什么这些内衣适合我，从而建立信任感并完成选购**。

## 验收标准 (Acceptance Criteria)

1. **协议解析 (Protocol Parsing)**:

   - **Given** n8n 通过 `<STATE>` 标签返回推品数据。
   - **Protocol Example**:

     <STATE>
     {
       "step": "recommendations",
       "products": [
         {
           "product_name": "连翘杯",
           "price": 35,
           "size": "75C",
           "matching": 5,
           "image_url": "...",
           "style": "欧美",
           "description": "圆盘型底盘大，宽底围分散重量，全包围防止外扩",
           "features": ["宽底围设计", "全包围侧翼"]
         }
       ]
     }
     </STATE>

   - **Then** 前端必须正确解析 `products` 数组并存入 `useChatStore` 的 `recommendedProducts` 状态中。

2. **引导卡片 (Recommendation Guide - Figma 14:3512)**:

   - **When** 收到 `step: "recommendations"`。
   - **Then** 在聊天流中渲染一个静态引导卡片（非弹窗）。
   - **UI 细节**:
     - 左侧图标：粉红色渐变背景下的购物袋图标。
     - 标题：“商品推荐”。
     - 描述：“查看适合你的内衣推荐”。
     - 右侧：紫色前进箭头。

3. **推荐详情列表 (Full-Screen Overlay - Figma 14:4560)**:

   - **When** 用户点击“引导卡片”。
   - **Then** 弹出全屏毛玻璃背景 (`backdrop-blur-md`) 的推荐列表页。
   - **Header**: 显示“为您精选了 X 款”及关闭按钮。
   - **Layout**: 采用纵向滚动列表展示所有推品卡片。

4. **推品卡片详情 (Product Card Details)**:
   - **图片区域**:
     - 顶部：渲染商品图片。
     - 右上角：显示价格气泡 (`¥35`)。
     - 左下角：显示风格标签（如 `欧美`），黑色半透明背景。
   - **信息区域**:
     - **匹配得分**: 显示 `matching/5` 评分及星星图标。
     - **标题**: 商品名称（加粗）。
     - **动态理由**: 显示 `description` 字段中的详细推荐文案。
     - **功能标签**: 渲染 `features` 数组中的药丸型标签（浅紫背景）。
     - **尺码**: 显示商品尺码（如 `75C`）。
   - **行动按钮**:
     - 这里可以使用 `shadcn/ui` 的 `Sonner` 组件，使用 `ShoppingCart` 图标 以至于用户可以一键撤回操作
     - 隐喻： 购物车图标
     - 文本：“加入购物车”
     - 颜色：必须使用项目全局定义的品牌紫 (`#8B5CF6`)。
   - **交互增强**:
     - 卡片本身是可以点击的，点击进入商品详情页（包含关于该商品的软文/详情，目前使用 Placeholder 替代）。

## 任务拆解 (Tasks)

### Task 1: 数据模型与存储更新 (Data Model & Store)

- [x] 更新 `lib/store.ts` 中的 `Product` 类型，新增 `size` 字段。
- [x] 增强 `chatProtocol.ts` 及其解析逻辑，确保完整提取 `products` 中的 `size` 字段。
- [x] 确保 `useChatStore` 的 `setCurrentState` 能同步持久化包含尺码信息的推品数据。

### Task 2: UI 与组件增强 (UI & Component Enhancement)

- [x] 实现 `RecommendationGuide` 组件（参考 Figma 14:3512）。
- [x] 重新设计并实现 `RecommendationCard`（参考 Figma 14:4560）：
  - [x] 在信息区域新增 **尺码 (Size)** 展示。
  - [x] 实现 **“加入购物车”** 按钮，集成 `ShoppingCart` 图标。
- [x] 创建 **商品详情软文页 (Placeholder)**，支持基本的返回导航。
- [x] 适配移动端视口，确保全屏列表滚动流畅且无布局偏移。

### Task 3: 交互逻辑与反馈系统 (Interaction & Feedback)

- [x] 在 `ProductRecommendation.tsx` 中集成引导页与推荐列表的切换逻辑。
- [x] 实现卡片整体点击跳转至商品详情软文页的导航逻辑。
- [x] 集成 `shadcn/ui` 的 **Sonner** 组件：
  - [x] 用户点击“加入购物车”时触发 Toast 提示。
  - [x] 实现 **“一键撤回 (Undo)”** 功能，逻辑上模拟从购物车移除（State 更新）。
- [x] 确保所有交互按钮颜色严格遵循品牌紫 (`#8B5CF6`)。

## 开发注意事项 (Technical Notes)

- **反馈机制**: 使用 `Sonner` 提供即时反馈，提升用户的控制感（可撤回）。
- **导航体验**: 商品详情页目前为 Placeholder，但需保证导航路径清晰。
- **性能**: `image_url` 需配置 `unoptimized: true`。
- **品牌色彩**: 严格遵守 `#8B5CF6` (Primary) 和 `#EC4899` (Pink)。

## 引用资源

- [Figma Node: 14:3512 (Guide Card)](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=14-3512)
- [Figma Node: 14:4560 (Recommendation Overlay)](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=14-4560)
- [PRD.md 节点七: 精准推荐]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

GPT-5.1

### Implementation Notes

- `Product` 类型新增 `size`；`setCurrentState` 正常化 `products` 并持久化 `recommendedProducts`（含尺码）。
- `ProductRecommendation` 按 Figma 14:3512/14:4560 重构：引导卡 + 全屏毛玻璃列表、尺码胶囊、品牌紫 `加入购物车`（卡片整体可点击进入详情占位页），图片 `unoptimized`。
- 集成 Sonner：全局 `Toaster`，加入购物车 Toast 使用品牌紫并支持撤回（移除本地加购状态，同时触发撤回 onSelect）。
- 新增/更新测试：`ProductRecommendation.test.tsx`、`store.test.ts`、`StateComponents.test.tsx`；全量 Vitest 通过。

## File List

- `docs/sprint-artifacts/sprint-status.yaml` (updated)
- `docs/sprint-artifacts/SM_Stories/4-2-recommendation-card-dynamic-reason.md` (updated)
- `moon-agent/lib/store.ts` (updated)
- `moon-agent/lib/store.test.ts` (updated)
- `moon-agent/components/chat/ProductRecommendation.tsx` (updated)
- `moon-agent/components/chat/ProductRecommendation.test.tsx` (new)
- `moon-agent/components/chat/StateComponents.test.tsx` (updated)
- `moon-agent/components/providers.tsx` (updated)

## Change Log

- 2025-12-20: 完成推荐卡与动态理由 UI/交互（尺码、加入购物车 + 撤回）、详情占位页、Sonner 提示及数据存储更新；全量测试通过。
