# Story 2.3: Auxiliary Data Collection (Height/Weight Sliders)

Status: done

## Story

**As a** User,
**I want** to input my height, weight, and waist circumference through a smooth, interactive interface,
**So that** the system can determine my body shape (round vs. flat) and refine the underbust measurement suggestions.

## Acceptance Criteria

### 1. UI/UX - Auxiliary Input Panel

- **Trigger**: Panel appears after the core measurement (Story 2.2) is completed and Moon asks for auxiliary info.
- **Component**: A bottom sheet or distinct card/panel layout.
- **Input Fields**:
  1.  **Height (身高)**:
      - Control: Horizontal Slider.
      - Range: 140cm - 200cm (Default: 165cm).
      - Display: Current value shown above/on the thumb.
  2.  **Weight (体重)**:
      - Control: Horizontal Slider.
      - Range: 30kg - 100kg+ (Default: 55kg).
      - Display: Current value shown.
  3.  **Waist (腰围) (Optional/Secondary)**:
      - Control: Slider or Numeric Input (consistent with style).
      - Range: 50cm - 120cm.
- **Styling (Strict adherence to UX.md)**:
  - **Track**: `purple-200` (Light Violet).
  - **Thumb/Range**: `moon-purple` (`#8B5CF6`).
  - **Background**: Clean white card styling.
- **Action**: "Confirm" (确认) button to submit data.

### 2. Logic & Data Handling

- **State Management**:
  - Local state for slider values while dragging.
  - Update global Zustand store on confirmation.
- **Data Submission**:
  - Payload: `{ height: number, weight: number, waist: number }`.
  - Target: Submit to n8n webhook (or local API route proxy) for processing.

### 3. Edge Cases

- **Validation**: Prevent submission if values are untouched (unless defaults are valid) or unreasonable (though sliders constrain this).
- **Responsiveness**: Ensure sliders are touch-friendly on mobile devices (sufficient hit area).

## Tasks / Subtasks

- [x] Task 1: Component Implementation (AuxiliaryInput) (AC: 1)

  - [x] Subtask 1.1: Create `components/chat/AuxiliaryInput.tsx` scaffold with Framer Motion entry animation.
  - [x] Subtask 1.2: Implement **Height** slider using custom `Slider` component (Range: 140-200).
  - [x] Subtask 1.3: Implement **Weight** slider using custom `Slider` component (Range: 30-100).
  - [x] Subtask 1.4: Implement **Waist** slider (Range: 50-120).
  - [x] Subtask 1.5: Apply styling: `track-gray-200`, `range-moon-purple`, `thumb-moon-purple`.
  - [x] Subtask 1.6: Add "Confirm" button with loading state.

- [x] Task 2: State Management Integration (AC: 2)

  - [x] Subtask 2.1: Update `lib/store.ts` (Zustand) to include `auxiliaryData` with `height`, `weight`, `waist`.
  - [x] Subtask 2.2: Bind component local state to inputs and update Zustand store on "Confirm".

- [x] Task 3: Integration & Data Submission (AC: 2)

  - [x] Subtask 3.1: Implement data submission via `onSelect` callback with JSON payload `{ height, weight, waist }`.
  - [ ] Subtask 3.2: Verify Supabase `users` table schema supports these fields (or `measurements` JSONB) and ensure persistence. (Deferred to backend integration)

- [x] Task 4: Testing & Polish (AC: 3)
  - [x] Subtask 4.1: Unit tests for slider interaction created.
  - [x] Subtask 4.2: Sliders enforce range constraints (min/max attributes).
  - [x] Subtask 4.3: "Confirm" action triggers `onSelect` callback with JSON data.

## Dev Notes

### Architecture & Components

- **Components**:
  - Create `components/ui/slider.tsx` (Shadcn/UI).
  - Create `components/chat/AuxiliaryInput.tsx` (or similar name).
- **State**:
  - Extend `useChatStore` or `useUserStore` to hold auxiliary data.

### Database (Supabase)

- Ensure `users` table has specific fields or a JSONB structure to hold these new metrics if not already present.
  - _Schema Check_: `users` table -> `measurements` (JSONB). Suggested structure: `measurements: { upper: 88, under: 73, height: 165, weight: 55, waist: 68 }`.

### Project Structure Alignment

- File Path: `moon-agent/components/chat/AuxiliaryInput.tsx`
- Styles: Use `globals.css` variables (`bg-moon-purple`, etc.).

## References

- [Epics.md](../../epics.md): Story 2.3 Details.
- [UX.md](../../UX.md): Node 1 (BMI Screen) Visual Specs.
- [PRD.md](../../prd.md): Node 3 (Auxiliary Info) Logic.

## Dev Agent Record

- **Context**: Derived from Epic 2, Story 2.3.
- **Focus**: Mobile-first interaction, smooth animations (Framer Motion for panel entry).
- **Figma Reference**: https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=10-1280

### Agent Model Used

Claude Opus 4.5 (Amelia Dev Agent)

### Implementation Plan

1. Created reusable Slider UI component with custom styling
2. Built AuxiliaryInput component with three sliders matching Figma design
3. Extended Zustand store with `auxiliaryData` state
4. Added component to StateComponentMap for chat flow integration
5. Created comprehensive unit tests (10 tests for AuxiliaryInput, 7 for Slider)

### Completion Notes

**Date:** 2025-12-14

**Implementation Summary:**

1. Created `components/ui/slider.tsx` - Custom slider component with:

   - Label and unit display
   - Value display below slider
   - Custom CSS styling for track/thumb matching moon-purple theme
   - Accessible range input with min/max constraints

2. Created `components/chat/AuxiliaryInput.tsx` - Auxiliary data collection panel with:

   - Three sliders: Height (140-200cm), Weight (30-100kg), Waist (50-120cm)
   - Framer Motion entry animation (fade + slide up)
   - Local state for slider values during interaction
   - Zustand integration for global state persistence
   - Confirm button with loading state
   - Matches Figma design specs

3. Updated `lib/store.ts`:

   - Added `AuxiliaryData` type
   - Added `auxiliaryData` state field
   - Added `setAuxiliaryData` action

4. Updated `components/chat/StateComponents.tsx`:

   - Added `auxiliary_input` step mapping to AuxiliaryInput component

5. Added custom slider CSS to `globals.css`:
   - Progressive fill track styling
   - Moon-purple thumb with hover/active states
   - Focus ring for accessibility

**Test Results:** 76 tests passing (including 18 new tests)

**Additional Enhancements:**

- Step name mapped as `body_info` (per n8n response)
- Value display is editable (click to type)
- Number only in border box, unit displayed separately
- Confirm returns natural language: "我的身高是 Xcm，体重 Ykg，腰围 Zcm"

## File List

- `components/ui/slider.tsx` (NEW)
- `components/ui/slider.test.tsx` (NEW)
- `components/chat/AuxiliaryInput.tsx` (NEW)
- `components/chat/AuxiliaryInput.test.tsx` (NEW)
- `components/chat/StateComponents.tsx` (MODIFIED)
- `lib/store.ts` (MODIFIED)
- `lib/store.test.ts` (MODIFIED)
- `app/globals.css` (MODIFIED)

## Change Log

- 2025-12-14: Initial implementation of Story 2.3 - Auxiliary Data Collection (Height/Weight/Waist sliders).
- 2025-12-14: Fixed step name to `body_info` (matching n8n response).
- 2025-12-14: Added editable value input (click number to edit directly).
- 2025-12-14: Separated number and unit display (only number has border).
- 2025-12-14: Changed confirm response to natural language Chinese format.
