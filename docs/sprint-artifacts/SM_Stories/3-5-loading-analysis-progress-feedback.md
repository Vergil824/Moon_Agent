# Story 3.5: 分析加载与进度反馈界面 (Loading Analysis & Progress Feedback)

Status: Ready for Review

## Story

As a **User**,
I want **to see a clear progress indication and encouraging feedback after I finish providing all my data**,
so that **I know the analysis has started and I feel reassured while waiting for the results**.

## Acceptance Criteria

1. **Given** User has completed all inputs (Measurements, Shape Selection, Pain Points). [Source: PRD.md#节点六]
2. **When** The application state transitions to `summary` (triggered by n8n response `<STATE>{"step":"summary"}</STATE>`). [Source: stories.md#Story 1.3]
3. **Then** The UI displays the `LoadingAnalysis` component (reference Figma 14:3041). [Source: UX.md#节点 3]
4. **And** The component must feature a **Violet Gradient** border (#8B5CF6) and background. [Source: UX.md#2.1]
5. **And** A **Progress Bar** must be visible, initialized at **33%**, with a smooth filling animation using Framer Motion. [Source: Figma Context]
6. **And** The text "Get！数据齐全。你的胸型非常典型，我知道你之前的内衣为什么钢圈总戳腋下了。" must be displayed clearly. [Source: PRD.md#节点六]
7. **And** A pulsing sphere icon (Violet to Pink gradient) must be shown as an activity indicator. [Source: Figma Context]
8. **And** Secondary text "分析中... 33%" must be visible below the progress bar. [Source: Figma Context]

## Tasks / Subtasks

- [x] **Task 1: Create LoadingAnalysis Component (AC: 3, 4, 7)**
  - [x] Implement `LoadingAnalysis` in `components/chat/LoadingAnalysis.tsx`.
  - [x] Use Tailwind for the gradient background and the pulsing sphere icon.
  - [x] Apply the `Violet Gradient` border and rounded corners (24px).
- [x] **Task 2: Implement Progress Bar Animation (AC: 5, 8)**
  - [x] Use `framer-motion` to animate the progress bar width transition.
  - [x] Sync the percentage text with the progress bar state.
- [x] **Task 3: Integrate with ChatProtocol and Store (AC: 2)**
  - [x] Update `components/chat/ChatInterface.tsx` to recognize the `summary` step.
  - [x] Render `LoadingAnalysis` within the message stream or as an overlay when active.
  - [x] Ensure the component appears immediately upon receiving the `summary` state tag.
- [x] **Task 4: Visual Polish & Responsiveness (AC: 6)**
  - [x] Ensure font sizes (16px for main, 12px for secondary) match UX requirements.
  - [x] Verify mobile layout prevents horizontal scrolling and fits within the chat viewport.

## Dev Notes

### Technical Requirements

- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS.
- **Animation**: `framer-motion` for the progress bar `layout` or `animate` properties.
- **Protocol**: Recognition logic is in `lib/chatProtocol.ts`.
- **Assets**: Pulsing sphere is a CSS-only gradient component.

### Architecture Compliance

- Component must reside in `components/chat/`.
- Must follow the established pattern of "State-driven UI" used in `ShapeSelection` and `PainPointGrid`.
- Colors must use variables from `globals.css` where possible:
  - `primary`: `#8B5CF6` (Violet)
  - `secondary`: `#EC4899` (Pink)

### Testing Requirements

- **Unit Test**: Verify `LoadingAnalysis` renders correctly with the provided text and initial percentage.
- **Integration Test**: Mock a chat response with `<STATE>{"step":"summary"}</STATE>` and verify the component appears in `ChatInterface`.

## References

- [PRD.md#节点六: 报告生成与收束]
- [UX.md#2.1 配色方案]
- [UX.md#节点 3: 分析与揭晓]
- [Architecture.md#2.1 全栈框架]
- [Figma Node: 14:3041]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

GPT-5.2

### Debug Log References

- Ultimate context engine analysis completed - comprehensive developer guide created.

### Implementation Notes

- Implemented `LoadingAnalysis` (gradient border/background, pulsing sphere, progress bar 33% with Framer Motion, required texts).
- Integrated `summary` step via `components/chat/StateComponents.tsx`.
- Ensured `summary` UI appears immediately when `<STATE>{"step":"summary"}</STATE>` is received by updating `app/chat/page.tsx` rendering behavior.
- Added/updated unit + integration tests; full test suite passes.

## File List

- `moon-agent/components/chat/LoadingAnalysis.tsx` (new)
- `moon-agent/components/chat/LoadingAnalysis.test.tsx` (new)
- `moon-agent/components/chat/StateComponents.tsx` (updated)
- `moon-agent/components/chat/StateComponents.test.tsx` (updated)
- `moon-agent/app/chat/page.tsx` (updated)
- `moon-agent/app/chat/page.test.tsx` (updated)

## Change Log

- 2025-12-19: Added LoadingAnalysis progress feedback UI for `summary` step and integrated into state-driven chat flow; tests added/updated.
