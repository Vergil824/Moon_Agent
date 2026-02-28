# Story 3.1: Chest Type Selection Component

Status: Ready for Review

## Story

**As a** User,
**I want** to select my chest type from a visual list of options (Round, Spindle, Hemisphere),
**So that** the system can recommend the correct cup style (shallow vs. deep) and avoid fit issues like gaping or cutting in.

## Acceptance Criteria

### 1. UI/UX - Selection Panel

- **Trigger**: Appears when n8n returns state `{"step": "shape_select"}`.
- **Component**: A vertical list of cards (SelectCard) rendered within the chat flow (or as a bottom sheet, consistent with previous steps).
- **Options**:

  1.  **Round (圆盘型)**:
      - Title: "圆盘型 (Round)"
      - Desc: "底盘大，隆起不高" (Wide base, low projection)
      - Icon/Image: `圆盘型.png` (from provided static assets).
  2.  **Spindle (纺锤型)**:
      - Title: "纺锤型 (Spindle)"
      - Desc: "底盘小，隆起高" (Narrow base, high projection)
      - Icon/Image: `纺锤型.png` (from provided static assets).
  3.  **Hemisphere (半球型)**:
      - Title: "半球型 (Hemisphere)"
      - Desc: "肉质紧实，像碗扣在胸口" (Firm, bowl-like)
      - Icon/Image: `半球型.png` (from provided static assets).

- **Card Styling**:
  - **Default**: White background, `gray-200` border.
  - **Selected**:
    - Background: `purple-50` (`#F3E8FF`).
    - Border: `moon-purple` (`#8B5CF6`).
    - Indicator: Purple checkmark icon in top-right corner.
  - **Layout**: Image/Icon on left (or top), Title & Desc on right (or bottom). Consistent with Figma.

### 2. Interaction & Logic

- **Selection**:
  - Single selection logic.
  - Clicking a card selects it immediately.
- **Submission**:
  - **Auto-submit** upon confirmation.
  - **Format**: Send natural language message to n8n (e.g., "我选择了圆盘型"). Do NOT send JSON payload.
  - **Mechanism**: Use **Select -> Highlight -> Click 'Confirm' button**.
- **State Management**:
  - Store selection in `useChatStore` (e.g., `chestType: 'round' | 'spindle' | 'hemisphere'`).
  - Send natural language text to chat flow.

### 3. Edge Cases

- **No Selection**: "Confirm" button disabled until an option is selected.
- **Mobile View**: Ensure cards are tall enough for touch targets. Images should be clear on mobile.

## Tasks / Subtasks

- [x] Task 1: Asset Management (AC: 1)

  - [x] Subtask 1.1: Move images from `moon-agent/static/*.png` to `moon-agent/public/assets/shapes/`.
  - [x] Subtask 1.2: Verify image loading path in Next.js.

- [x] Task 2: Component Development (SelectCard) (AC: 1)

  - [x] Subtask 2.1: Create `components/chat/SelectCard.tsx` (Reusable selection card).
  - [x] Subtask 2.2: Implement `title`, `description`, `imageSrc`, `selected` props.
  - [x] Subtask 2.3: Apply styling for Default and Selected states (Purple theme). Use `next/image` for optimized loading.

- [x] Task 3: Panel Implementation (ShapeSelection) (AC: 1, 2)

  - [x] Subtask 3.1: Create `components/chat/ShapeSelection.tsx`.
  - [x] Subtask 3.2: Define the data array for 3 chest types linked to the new image paths.
  - [x] Subtask 3.3: Implement local state for current selection.
  - [x] Subtask 3.4: Add "Confirm" button (Primary CTA).

- [x] Task 4: State & Integration (AC: 2)

  - [x] Subtask 4.1: Update `lib/store.ts` to include `chestType`.
  - [x] Subtask 4.2: Register `shape_select` step in `StateComponents.tsx`.
  - [x] Subtask 4.3: Implement `onConfirm` handler to send **natural language message** (e.g., "我选择了圆盘型") to n8n.

- [x] Task 5: Polish (AC: 1)
  - [x] Subtask 5.1: Verify mobile responsiveness and animations.
  - [x] Subtask 5.2: Ensure selected state is clearly visible (accessibility).

## Dev Notes

### Architecture

- **Component**: `ShapeSelection` should be a self-contained component rendered by `ChatInterface` when `step === 'shape_select'`.
- **Assets**: Images are provided in `static` folder. MUST move to `public` for Next.js to serve them.

### Database

- Update `users` table `measurements` or `body_shape` column.
  - `body_shape` (or `chest_type`) column in Supabase `users` table.

## References

- [stories.md](../../stories.md): Story 3.1 Details.
- [Figma](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-1496): Visual reference for cards.
- Static Assets: `moon-agent/static/*.png`.

## Dev Agent Record

- **Context**: Derived from Epic 3, Story 3.1.
- **Figma Node**: 10:1496, 10:1703.

### Implementation Plan

- Used red-green-refactor TDD cycle for all components
- Referenced Figma designs for styling consistency (purple theme #8B5CF6)
- Integrated with existing StateComponents pattern

### Completion Notes

- **Date**: 2025-12-14
- **Files Created**:
  - `moon-agent/public/assets/shapes/` - Asset directory with shape images
  - `moon-agent/components/chat/SelectCard.tsx` - Reusable selection card component
  - `moon-agent/components/chat/SelectCard.test.tsx` - 8 unit tests
  - `moon-agent/components/chat/ShapeSelection.tsx` - Shape selection panel
  - `moon-agent/components/chat/ShapeSelection.test.tsx` - 11 unit tests
- **Files Modified**:
  - `moon-agent/lib/store.ts` - Added ChestType type and chestType state
  - `moon-agent/lib/store.test.ts` - Added chestType tests
  - `moon-agent/components/chat/StateComponents.tsx` - Registered shape_select step
  - `moon-agent/components/chat/StateComponents.test.tsx` - Added shape_select tests
- **Tests**: 43 tests added/updated, all passing
- **Note**: Pre-existing test failure in `app/chat/page.test.tsx` (expects "撑撑姐" but header shows "满月 Moon") - unrelated to this story

### File List

- `moon-agent/public/assets/shapes/圆盘型.png` (new)
- `moon-agent/public/assets/shapes/纺锤型.png` (new)
- `moon-agent/public/assets/shapes/半球型.png` (new)
- `moon-agent/components/chat/SelectCard.tsx` (new)
- `moon-agent/components/chat/SelectCard.test.tsx` (new)
- `moon-agent/components/chat/ShapeSelection.tsx` (new)
- `moon-agent/components/chat/ShapeSelection.test.tsx` (new)
- `moon-agent/lib/store.ts` (modified)
- `moon-agent/lib/store.test.ts` (modified)
- `moon-agent/components/chat/StateComponents.tsx` (modified)
- `moon-agent/components/chat/StateComponents.test.tsx` (modified)

### Change Log

- 2025-12-14: Implemented Story 3.1 - Chest Type Selection Component (all tasks complete)
