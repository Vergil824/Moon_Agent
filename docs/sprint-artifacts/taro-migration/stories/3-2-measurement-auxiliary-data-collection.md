# Story 3.2: 量体与辅助数据采集（Measurement & Auxiliary Data Collection）

Status: review

## Story

As a shopper,  
I want to input measurements and basic body data,  
so that 诊断与推荐更准确，并且跨端表现一致。

## Acceptance Criteria

1. **胸围输入校验（必填 + 合理区间）**  
   **Given** 当前步骤为 `size_input`，用户需要填写下胸围/上胸围  
   **When** 数值为空、非数字、或超出合理区间  
   **Then** 显示明确的校验提示，并禁用“确认数据”提交按钮  
   - 合理区间（与现有实现对齐）：  
     - 下胸围 \(lowerBust\): 50–120 cm  
     - 上胸围 \(upperBust\): 50–140 cm  
   - 额外一致性校验：`upperBust >= lowerBust`（否则提示“上胸围应不小于下胸围”并禁止提交）

2. **胸围差实时计算与展示**  
   **Given** 用户调整下胸围/上胸围  
   **When** 任一值变化  
   **Then** UI 实时展示胸围差 \(bustDifference = upperBust - lowerBust\)，并与提交入参一致。

3. **辅助数据采集（滑块/输入一致 + 合理区间）**  
   **Given** 当前步骤为 `body_info`，用户填写身高/体重/腰围  
   **When** 拖动滑块或输入数值  
   **Then** UI 数值展示与内部状态一致，且执行范围校验；无效时禁用提交并提示  
   - 合理区间（与现有实现对齐）：  
     - 身高: 140–200 cm  
     - 体重: 30–100 kg  
     - 腰围: 50–120 cm

4. **写入 Store（跨端一致）**  
   **Given** 用户点击“确认数据”  
   **When** 校验通过  
   **Then** 必须将数据写入全局 store，后续步骤/页面/回到聊天时仍可读取并保持一致：  
   - `useChatStore.setMeasurementData({ lowerBust, upperBust, bustDifference })`  
   - `useChatStore.setAuxiliaryData({ height, weight, waist })`

5. **回显与一致性（避免默认值覆盖真实输入）**  
   **Given** store 中已存在 measurement/auxiliary 数据（例如用户返回上一步、重新进入该 state component）  
   **When** 渲染 `MeasureGuide` / `AuxiliaryInput`  
   **Then** 组件应以 store 值作为初始值进行回显；不得强制回到默认值（75/90/165/55/68）。

6. **交互与样式对齐（以 Figma 为准，允许平台实现差异但视觉与层级一致）**  
   **Given** 用户进入量体输入卡片与“测量演示”弹窗  
   **When** 渲染 UI  
   **Then** 在 H5/weapp/Taro RN 上保持一致的布局层级、按钮文案与关键样式（圆角、渐变、阴影、间距），允许因组件库差异产生轻微像素级偏差。

## Tasks / Subtasks

- [x] **完成 MeasureGuide 的 store 写入与校验** (AC: 1, 2, 4, 5, 6)
  - [x] 在 `moon_agent_taro/src/core/components/chat/MeasureGuide.tsx` 接入 `useChatStore`，实现 `setMeasurementData` 写入。
  - [x] 为 `Range` / `InputNumber` 的变更统一做数值归一化（string/number → number），处理空值/非法值。
  - [x] 增加校验提示与禁用态（按钮/输入框），并确保 `upperBust >= lowerBust`。
  - [x] 从 store 回显已有值（首次进入可用默认值）。

- [x] **完成 AuxiliaryInput 的 store 写入与校验** (AC: 3, 4, 5, 6)
  - [x] 在 `moon_agent_taro/src/core/components/chat/AuxiliaryInput.tsx` 接入 `useChatStore`，实现 `setAuxiliaryData` 写入。
  - [x] 增加范围校验与禁用提交，并提供清晰错误提示（例如“请输入 140–200cm 的身高”）。
  - [x] 从 store 回显已有值（首次进入可用默认值）。

- [x] **保证 state 驱动路径正确（size_input → body_info）** (AC: 4, 5)
  - [x] 确认 `moon_agent_taro/src/core/components/chat/StateComponents.tsx` 中 step 映射与服务端 `<STATE>` 协议一致（已存在 `size_input`、`body_info` 映射）。
  - [x] 确认 `onSelect` 的消息文本格式稳定（用于后端/LLM理解），并与 store 写入同步发生。

- [x] **测量演示弹窗对齐 Figma（两步：下胸围/上胸围）** (AC: 6)
  - [x] 弹窗需支持：顶部渐变 header、关闭按钮、步骤标题/副标题、示意图区域、tips 列表、底部 stepper（上一步/下一步 + 两个进度点）。
  - [x] weapp/RN 如 SVG 动画不支持，可替换为静态图片/简化动效，但布局与信息结构必须一致。

## Dev Notes

- **你问的“复用……逻辑具体指哪儿”**：epics 中这句  
  “复用 `components/chat/MeasureGuide.tsx`, `AuxiliaryInput.tsx`, `StateComponents.tsx`, `WelcomeOptions.tsx` 的交互与校验逻辑”  
  **指的是 `moon-agent`（Next.js）里的实现**，也就是：  
  - `moon-agent/components/chat/MeasureGuide.tsx`（range+number input、demo modal、确认写 store、bustDifference）  
  - `moon-agent/components/chat/AuxiliaryInput.tsx`（三段 slider、确认写 store）  
  - `moon-agent/components/chat/StateComponents.tsx`（`size_input`/`body_info` 等 step→component 映射）  
  - `moon-agent/components/chat/WelcomeOptions.tsx`（welcome pills 样式/交互参考）

- **Taro 端当前差距（需要补齐以满足“复用交互与校验逻辑”）**：
  - `moon_agent_taro/src/core/components/chat/MeasureGuide.tsx` 与 `AuxiliaryInput.tsx` 目前均标记了 `// TODO: Save to store when implemented`，需要完成 store 写入与回显（AC: 4, 5）。
  - Taro 端 `MeasureDemoModal` 目前示意图为占位（emoji），应按 Figma 结构与信息层级对齐（可先静态图，后续再补动效）。

- **输入事件兼容（Taro / NutUI）**：
  - `Range`/`InputNumber` 的 `onChange` 回调可能返回 `string | number | undefined`（取决于组件与端），务必统一归一化并处理空值。
  - 若需要补齐“错误提示/禁用态/弹窗”等 UI 组件能力，优先使用现有技术栈中的 NutUI（`@nutui/nutui-react-taro`）组件（例如 `Button`/`Popup`/`Toast`/`InputNumber`/`Range`），避免引入新 UI 依赖。

### Project Structure Notes

- 主要文件（Taro）：
  - `moon_agent_taro/src/core/components/chat/MeasureGuide.tsx`
  - `moon_agent_taro/src/core/components/chat/AuxiliaryInput.tsx`
  - `moon_agent_taro/src/core/stores/index.ts`（已包含 `setMeasurementData` / `setAuxiliaryData`）
  - `moon_agent_taro/src/core/components/chat/StateComponents.tsx`

- 对齐参考（Next.js / moon-agent）：
  - `moon-agent/components/chat/MeasureGuide.tsx`
  - `moon-agent/components/chat/AuxiliaryInput.tsx`
  - `moon-agent/components/chat/StateComponents.tsx`
  - `moon-agent/lib/core/store.ts`

### Figma References

- `MeasureGuide` measurement sliders（你给的链接）：`https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-678&m=dev`（node `10:678`）
- `AuxiliaryInput`（来自 moon-agent 注释引用的 Figma node）：node `10:1280`
- `MeasureGuide` demo step 1：`https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-941&m=dev`（node `10:941`）
- `MeasureGuide` demo step 2：`https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-997&m=dev`（node `10:997`）

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 3.2]
- [Source: docs/sprint-artifacts/taro-migration/README.md#跨端一致性策略与检查清单]
- [Source: docs/sprint-artifacts/taro-migration/sprint-status.yaml#development_status]
- [Source: moon-agent/components/chat/MeasureGuide.tsx]
- [Source: moon-agent/components/chat/AuxiliaryInput.tsx]
- [Source: moon-agent/lib/core/store.ts]

## Dev Agent Record

### Agent Model Used

GPT-5.2

### Completion Notes List

1. Aligned Story 3.2 with `docs/sprint-artifacts/taro-migration/epics.md` acceptance criteria and the existing `moon_agent_taro` component structure.
2. Clarified that “reuse logic” refers to `moon-agent` (Next.js) components and mapped to Taro counterparts.
3. Incorporated Figma nodes `10:678`, `10:941`, `10:997`, `10:1280` into UI alignment requirements.
4. **MeasureGuide Implementation** (2026-01-26):
   - Integrated `useChatStore` with `setMeasurementData` for store persistence (AC: 4)
   - Added `normalizeValue()` helper for handling string/number/undefined from NutUI components
   - Implemented validation: lowerBust (50-120cm), upperBust (50-140cm), upperBust >= lowerBust (AC: 1)
   - Real-time bustDifference calculation using `useMemo` (AC: 2)
   - Store value restoration on component mount via `useEffect` (AC: 5)
   - Added error messages and disabled button state when validation fails
   - Created static SVG illustrations (LowerBustIllustration, UpperBustIllustration) for MeasureDemoModal (AC: 6)
5. **AuxiliaryInput Implementation** (2026-01-26):
   - Integrated `useChatStore` with `setAuxiliaryData` for store persistence (AC: 4)
   - Added range validation with error messages: height (140-200cm), weight (30-100kg), waist (50-120cm) (AC: 3)
   - Store value restoration on component mount via `useEffect` (AC: 5)
   - Button disabled state when validation fails or submitting
6. **State-driven components verified**: `StateComponents.tsx` mappings (`size_input` → MeasureGuide, `body_info` → AuxiliaryInput) align with Next.js implementation and server protocol.

### File List

- `docs/sprint-artifacts/taro-migration/stories/3-2-measurement-auxiliary-data-collection.md` (updated)
- `docs/sprint-artifacts/taro-migration/sprint-status.yaml` (updated: status in-progress → review)
- `moon_agent_taro/src/core/components/chat/MeasureGuide.tsx` (modified: store integration, validation, SVG illustrations)
- `moon_agent_taro/src/core/components/chat/AuxiliaryInput.tsx` (modified: store integration, validation)

### Change Log

- 2026-01-26: Implemented Story 3.2 - MeasureGuide and AuxiliaryInput store integration with validation (AC: 1-6)
