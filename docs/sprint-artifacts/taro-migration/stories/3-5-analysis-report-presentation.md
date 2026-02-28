# Story 3.5: 分析与报告呈现

Status: done

## Story

作为一名**用户**，
我希望在进入分析阶段时能看到清晰的分析进度，并在结果出来后看到诊断摘要与推荐入口，
从而理解诊断依据与下一步行动。

## Acceptance Criteria

### 1) 分析阶段（加载/进度）

- **Given** 进入分析阶段  
  **When** 后端处理未完成  
  **Then** 显示进度/加载提示，且**不阻塞**后续 `partial` 渲染（流式内容仍可继续追加到消息列表）。  
  [Source: `docs/sprint-artifacts/taro-migration/epics.md`#Story 3.5]

### 2) 报告 + 推荐呈现

- **Given** 收到诊断与推荐摘要（通过 `state` 或 payload 注入）  
  **When** 渲染结果卡片  
  **Then** 展示**胸型/尺码/痛点**摘要与下一步 CTA，并引用 store 中的用户输入数据（不要重复维护第二份"用户输入"状态）。  
  **And** 结果相关 UI（加载卡片/推荐入口/推荐列表浮层）的**颜色、图标语义、圆角、阴影、字号与间距**需与 `moon-agent` 对应组件保持一致（以 `moon-agent` 为视觉与交互真值）。  
  [Source: `docs/sprint-artifacts/taro-migration/epics.md`#Story 3.5]

## Tasks / Subtasks

- [x] **任务 1：确保 `summary` 步骤可立即渲染（对应 AC 1）**

  - [x] 确认聊天页在 streaming 过程中也会展示 `LoadingAnalysis`（不要等 `end`）。
  - [x] 确认加载 UI 不会暂停/阻塞 `partial` 消息的继续渲染与追加。

- [x] **任务 2：对齐 Taro 侧 `LoadingAnalysis` 到 `moon-agent`（对应 AC 1/2）**

  - [x] 复用 `moon_agent_taro/src/core/components/chat/LoadingAnalysis.tsx`（不要新建重复组件）。
  - [x] 对齐 `moon-agent/components/chat/LoadingAnalysis.tsx` 的关键视觉要素（示例但不限于）：
    - 渐变边框（紫→粉）、内层浅底渐变（淡紫→淡粉）
    - 中心球体紫粉渐变 + 动效（旋转环/脉冲）
    - 进度条（indeterminate）与计时器排布、字色层级

- [x] **任务 3：对齐推荐入口/浮层到 `moon-agent`（对应 AC 2）**

  - [x] 复用 `moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx` 完成推荐呈现（引导卡 + 全屏浮层）。
  - [x] 对齐 `moon-agent/components/chat/ProductRecommendation.tsx` 的关键视觉与图标语义（示例但不限于）：
    - 主色 `#8B5CF6`、辅色 `#EC4899`；商品图区域浅紫→浅粉底（如 `#F3E8FF`→`#FCE7F3`）
    - 引导卡的渐变图标底、右侧 chevron 的紫色语义
    - 浮层的遮罩与卡片层级、圆角（如 24/20/14 层级）与阴影强度
  - [x] 确保摘要卡片读取 store + payload 的数据口径一致（字段命名、缺省值、空态策略统一）。
  - [x] 确保 CTA 交互不破坏聊天滚动体验（`ScrollView` 的自动滚动/"有新消息"提示逻辑保持正常）。

- [x] **任务 4：状态映射与 payload 约定（对应 AC 1, 2）**

  - [x] 保持 `moon_agent_taro/src/core/components/chat/StateComponents.tsx` 的 step 映射：
    - `summary` → `LoadingAnalysis`
    - `recommendation` / `recommendations` / `ProductRecommendation` → `ProductRecommendation`
  - [x] 确认 `<STATE>...</STATE>` 的解析会产出 `state`，且**不会**把 tag 内容泄漏到可见文本中。

- [x] **任务 5：测试/冒烟验证（建议）**
  - [x] 新增/扩展一个 UI 冒烟页或最小测试入口，验证：
    - `summary` 状态面板可见时，`partial` 仍持续渲染
    - 收到推荐 payload 后，推荐 UI 可正确展示（含空态/错误态）

## Dev Notes

### Taro 迁移约束（必须遵守）

- **平台**：优先 H5 + 微信小程序；Taro RN 为后续目标。
- **流式**：
  - H5 保持流式能力（SSE-like）。
  - 小程序不支持 SSE；使用 chunked / WS fallback（见 Epic 3 的 Story 3.1/3.4）。
- **UI**：
  - 使用 Taro 基础组件（`View`, `Text`, `ScrollView`, `Image`）与多端兼容 UI 库。
  - 避免 Next.js / DOM-only API；避免会导致 WeApp 崩溃的 React/CSS 用法。

### 现有实现（必须复用，禁止重复造轮子）

- `moon_agent_taro/src/core/components/chat/LoadingAnalysis.tsx`
  - 已提供分阶段文案 + 环形动画 + 进度条（indeterminate）+ 计时。
- `moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx`
  - 已提供引导卡 + 全屏浮层 + 加购 Toast（目前为 UI 模拟）。
- `moon_agent_taro/src/core/components/chat/StateComponents.tsx`
  - 已完成 `summary`、`recommendation(s)` 到组件的映射。
- `moon_agent_taro/src/pages/chat/index.tsx`
  - 已包含在 streaming 过程中展示 `summary` / `recommendation(s)` 状态面板的特殊处理逻辑。
- `moon_agent_taro/src/core/chat/protocol.ts`
  - 定义了跨端事件协议，以及 `<STATE>` 解析与流式解析器。

### 关键护栏（避免实现灾难）

- **不要阻塞 streaming**：`LoadingAnalysis` 作为状态面板出现时，`partial` 必须仍能继续追加到消息列表。
- **不要引入第二套状态系统**：保持使用 `<STATE>{"step":"..."}</STATE>` + `StateComponents` 映射，不要再做一套"自定义 step"协议。
- **不要破坏滚动行为**：`ScrollView` 的"跟随底部 / 有新消息提示"必须保持稳定。
- **跨端样式注意**（WeApp 尤其重要）：避免依赖以下能力作为唯一实现：
  - `backdrop-filter`
  - 复杂渐变/动画但无降级
  - 小程序不支持的 utility class 或 CSS 语法

### 本 Story 的核心目标（对齐 moon-agent 视觉与交互）

- **重要澄清（关于"复用"）**：`epics.md` 里写的"复用 `components/chat/...`"指的是**复用/对齐 `moon-agent` 中的组件设计与交互范式**；当前 `moon_agent_taro` 已基本实现了本 Story 涉及组件，因此本 Story 主要工作是把 Taro 端组件与 `moon-agent` 对齐（而不是再造轮子）。
- **视觉对齐（以 `moon-agent` 为真值）**：将 `moon_agent_taro` 中本 Story 涉及的组件样式对齐 `moon-agent`：
  - **颜色/渐变**：主色 `#8B5CF6`、辅色 `#EC4899`，以及与 `moon-agent` 一致的渐变方向、背景灰度与边框表现。
  - **图标语义**：对齐 `moon-agent` 中对应入口/按钮的语义与视觉（例如推荐入口、关闭按钮、返回按钮、加购/撤回等）。
  - **圆角/阴影/字号**：卡片圆角（24px/20px/14px 层级）、阴影强度、标题/副标题字号与间距尽量一致。
- **状态渲染对齐**：确保当 `state.step` 为以下值时，必须渲染正确组件（即使在 streaming 过程中）：
  - `summary` → `LoadingAnalysis`
  - `recommendation` / `recommendations` / `ProductRecommendation` → `ProductRecommendation`

## References

- `docs/sprint-artifacts/taro-migration/epics.md` (Epic 3 → Story 3.5)
- `docs/sprint-artifacts/taro-migration/sprint-status.yaml` (tracking key: `3-5-analysis-report-presentation`)
- 代码参考（Taro）：
  - `moon_agent_taro/src/core/components/chat/LoadingAnalysis.tsx`
  - `moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx`
  - `moon_agent_taro/src/core/components/chat/StateComponents.tsx`
  - `moon_agent_taro/src/pages/chat/index.tsx`
  - `moon_agent_taro/src/core/chat/protocol.ts`
- 代码参考（moon-agent / 视觉与交互真值）：
  - `moon-agent/components/chat/LoadingAnalysis.tsx`
  - `moon-agent/components/chat/ProductRecommendation.tsx`
  - `moon-agent/components/chat/StateComponents.tsx`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Completion Notes List

- Story drafted from taro-migration epic definitions and aligned with existing `moon_agent_taro` implementation entry points.
- **任务 1**：验证 `chat/index.tsx` 第 508-530 行已实现 streaming 过程中展示 `summary`/`recommendation` 状态面板的逻辑。
- **任务 2**：为 `LoadingAnalysis.tsx` 添加 `max-w-[330px] mx-auto` 使其与 moon-agent 对齐居中约束。
- **任务 3**：
  - 为 `chatStore` 添加 `hasAutoOpenedCurrentState` 字段和 `setHasAutoOpenedCurrentState` action。
  - 为 `ProductRecommendation.tsx` 添加 auto-open 功能：streaming 结束后自动打开推荐浮层（与 moon-agent 行为对齐）。
  - 组件已从 store 读取 `recommendedProducts`，并支持 payload 优先。
- **任务 4**：验证 `StateComponents.tsx` 已包含正确的 step 映射，包括 `ProductRecommendation` 防御性别名。
- **任务 5**：现有 `ui-smoke` 页面已包含 LoadingAnalysis 和 ProductRecommendation 的测试入口。

### File List

- `moon_agent_taro/src/core/components/chat/LoadingAnalysis.tsx` - 添加 max-w-[330px] mx-auto
- `moon_agent_taro/src/core/components/chat/ProductRecommendation.tsx` - 添加 auto-open 功能
- `moon_agent_taro/src/core/stores/index.ts` - 添加 hasAutoOpenedCurrentState 字段和 action
