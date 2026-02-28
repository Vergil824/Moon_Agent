# Story 3.2: Pain Point Multiselect Grid

Status: review

## Story

**As a** User,
**I want** to quickly select my most annoying bra fit issues from a grid of common pain points,
**So that** the recommendation algorithm can specifically avoid products that would cause these problems for me.

## Acceptance Criteria

### 1. UI/UX - Selection Grid

- **Trigger**: Appears when n8n returns state `{"step": "pain_point_select"}`.
- **Component**: A grid layout (2 columns on mobile) of selectable cards.
- **Options (Strict Adherence to PRD)**:

  1.  **隐形刺客** (钢圈戳腋下) - Icon: Wire digging.
  2.  **逃跑新娘** (跑杯) - Icon: Cup slipping.
  3.  **分身术** (压胸) - Icon: Spillover/Quad-boob.
  4.  **空城计** (空杯) - Icon: Gaping cup.
  5.  **滑坠深坑** (肩带问题) - Icon: Slipping strap.

- **Card Styling**:

  - **Default**: White background, `gray-200` border, muted text.
  - **Selected (Pain State)**:
    - Background: `orange-50` or `red-50` (Warm tone to signify "pain").
    - Border: `orange-500` or `moon-purple` (depending on Figma - let's stick to **Orange/Red** for pain semantic as per PRD "Orange/Pink" note, or consistent Purple if Figma dictates). _Decision_: Use **`border-orange-500` and `bg-orange-50`** to distinguish "Pain Points" from "Preferences".
    - Icon: Highlighted color.
  - **Layout**: Icon top, Title bold, Description small.

- **Action**: "选好了" (Done) button at the bottom (Primary styling).

### 2. Interaction & Logic

- **Selection**:
  - **Multiselect**: Users can select 0, 1, or multiple options.
  - Tapping a card toggles its state.
- **Submission**:
  - Click "选好了" to confirm.
  - **Format**: Send natural language message (e.g., "我有空杯和跑杯的问题").
- **State Management**:
  - Store selected IDs/Keys in `useChatStore` (e.g., `painPoints: ['gaping', 'slipping']`).

### 3. Edge Cases

- **No Selection**: User can click "Confirm" without selection (implies no specific pain points).
- **Responsive**: Grid adapts to screen width (2 columns on mobile, 3-4 on tablet).

## Tasks / Subtasks

- [x] Task 1: Asset Preparation (AC: 1)

  - [x] Subtask 1.1: Move user-provided images from `moon-agent/static/*.png` to `moon-agent/public/assets/pain_points/`.
  - [x] Subtask 1.2: Ensure filenames align with keys.

- [x] Task 2: Component Development (PainPointCard) (AC: 1)

  - [x] Subtask 2.1: Create `components/chat/PainPointCard.tsx`.
  - [x] Subtask 2.2: Implement `title`, `imageSrc`, `selected`, `onToggle` props.
  - [x] Subtask 2.3: Apply styling: Default vs Selected (purple theme per Figma).

- [x] Task 3: Grid Implementation (PainPointGrid) (AC: 1, 2)

  - [x] Subtask 3.1: Create `components/chat/PainPointGrid.tsx`.
  - [x] Subtask 3.2: Implement responsive grid layout (CSS Grid `grid-cols-2`).
  - [x] Subtask 3.3: Manage local array state for selected items.
  - [x] Subtask 3.4: Add "确认痛点" button.

- [x] Task 4: State & Integration (AC: 2)

  - [x] Subtask 4.1: Update `lib/store.ts` to include `painPoints` array and `setPainPoints`.
  - [x] Subtask 4.2: Register `pain_point_select` step in `StateComponents.tsx`.
  - [x] Subtask 4.3: Implement `onConfirm` handler to generate natural language string from selected items.

- [x] Task 5: Testing (AC: 3)
  - [x] Subtask 5.1: Test multiselect logic (adding/removing items).
  - [x] Subtask 5.2: Test submission with 0 items vs multiple items.

## Dev Notes

### Architecture

- **Component**: `PainPointGrid` rendered by `ChatInterface` via `StateComponents`.
- **Assets**: User will provide PNG assets in `static/` later.

### Database

- Update `users` table `pain_points` column (Array of strings).

## References

- [stories.md](../../stories.md): Story 3.2 Details.
- [Figma](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-2271): Visual reference.

## Dev Agent Record

- **Context**: Derived from Epic 3, Story 3.2.
- **Figma Node**: 10:2271.
