# Story 2.2: 测量引导组件 (3D 动画集成)

Status: Ready for Review

## Story

作为一名 **不确定自己尺码的用户**，
我想要 **在“满月”说完引导语后，自动弹出测量工具**，
以便 **我可以一边看动画一边输入数据**。

## Acceptance Criteria

- **Given** 用户同意测量。
- **When** n8n 返回 `<STATE>{"step":"size_input"}</STATE>宝贝，撑撑姐教你先测量...`。
- **Then** 界面流式显示文字引导。
- **And** 检测到 `step: "size_input"` 时，**立即**在当前对话气泡下方渲染 **测量引导卡片 (MeasureGuide Card)**。
- **And** 卡片包含 3D 演示动画和数字输入框。
- **And** 在用户完成卡片操作（点击“确认”）之前，对话流暂停等待。
- **And** 胸围差使用 **亮粉色 `#EC4899`** 进行强调。

## Tasks / Subtasks

- [x] Implement `MeasureGuide` component structure (Modal/Overlay style based on Figma).
- [x] Implement "Lower Bust" measurement step (`10:826`):
  - [x] Show 3D illustration/animation for lower bust.
  - [x] Add measurement tips section (light purple background).
  - [x] Implement step navigation (Next button).
- [x] Implement "Upper Bust" measurement step (`10:997`):
  - [x] Show 3D illustration/animation for upper bust (90-degree bend).
  - [x] Add measurement tips.
  - [x] Implement step navigation (Prev/Next).
- [x] Implement "Data Entry" step (`10:627`):
  - [x] Show sliders for lower/upper bust.
  - [x] Display real-time "Bust Difference" calculation in pink `#EC4899`.
  - [x] Add "Confirm Data" button.
- [x] Integrate with `StateComponents` to render `MeasureGuide` when `step === "size_input"`.
- [x] Update `useChatStore` to handle measurement data submission.
- [x] Match visual styles from Figma (gradients, rounded corners, shadows).

## Dev Notes

### Technical Notes

- **Assets**: Use the provided SVG icons/illustrations from Figma export or suitable replacements.
- **State Management**:
  - Track current step (intro -> lower -> upper -> input).
  - Store temporary measurement values before submission.
- **Styling**:
  - Modal Background: `bg-[rgba(0,0,0,0.5)]` backdrop.
  - Card Background: White with rounded corners (`rounded-[32px]`).
  - Gradient Headers: `bg-gradient-to-b from-[#8b5cf6] to-[#ec4899]`.
  - Buttons: Pill-shaped, gradient or solid colors as per design.
- **Figma Reference**:
  - `10:627` (Data Entry / Slider View)
  - `10:826` (Lower Bust Guide)
  - `10:997` (Upper Bust Guide)

### Context Reference

- Figma Design: https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-627 (and related nodes)

## Dev Agent Record

### Agent Model Used

GPT-5.2

### Implementation Notes

- Implemented `MeasureGuide` as an in-chat card rendered under the assistant bubble for `step === \"size_input\"`.
- Added \"观看测量演示\" button to open a dedicated demo modal (Lower/Upper bust) instead of showing the modal immediately.
- Implemented Lower Bust step content (animated illustration + tips) and added navigation test coverage.
- Implemented Upper Bust step content (animated illustration + tips) and added coverage for prev/next navigation.
- Implemented Data Entry step UI (sliders + numeric inputs) with real-time bust difference highlight and confirm submission.
- Integrated `MeasureGuide` into `StateComponents` for `step === \"size_input\"` and added mapping tests.
- Added `measurementData` storage to `useChatStore` and persist measurement submission from `MeasureGuide`.
- Disabled chat input while `step === \"size_input\"` to pause the conversation until user confirms.
- Delayed rendering state-driven components until the typewriter queue completes, by buffering state during streaming and exposing it only after streaming finishes.
- Updated chat header title to match the existing test and Figma screens.

### File List

- `moon-agent/components/chat/MeasureGuide.tsx` (new)
- `moon-agent/components/chat/MeasureGuide.test.tsx` (new)
- `moon-agent/components/chat/StateComponents.tsx` (modified)
- `moon-agent/components/chat/StateComponents.test.tsx` (modified)
- `moon-agent/lib/store.ts` (modified)
- `moon-agent/lib/store.test.ts` (modified)
- `moon-agent/app/chat/page.tsx` (modified)
- `moon-agent/app/chat/page.test.tsx` (modified)

### Change Log

- 2025-12-14: Add `MeasureGuide` modal skeleton + tests; align chat header title with design/tests.
- 2025-12-14: Implement Lower Bust demo step UI + tips and expand `MeasureGuide` tests.
- 2025-12-14: Implement Upper Bust demo step UI + tips and expand `MeasureGuide` tests.
- 2025-12-14: Implement Data Entry step UI + confirm handler and expand `MeasureGuide` tests.
- 2025-12-14: Integrate `size_input` state rendering + lock chat input; add measurementData support in store.
- 2025-12-14: Buffer streamed state and render after typewriter finishes; change `size_input` to render in-chat card + on-demand demo modal.
