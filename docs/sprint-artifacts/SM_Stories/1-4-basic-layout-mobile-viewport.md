# Story 1.4: 基础布局与移动端视口配置

Status: done

## Story

作为一名 **前端开发人员**，
我想要 **创建适配移动端的 H5 基础布局容器**，
以便 **应用在手机浏览器和微信中显示正常，无缩放问题**。

## Acceptance Criteria

- **Given** 项目已初始化。
- **When** 在手机浏览器打开页面。
- **Then** 视口 (Viewport) 设置正确，禁止用户缩放 (`user-scalable=no`)。
- **And** 页面背景色为纯白或浅灰，无左右晃动。
- **And** 创建一个全局 Layout 组件，包含在此阶段所需的任何全局状态提供者 (如 React Query Provider)。

## Tasks / Subtasks

- [x] 配置 `app/layout.tsx` 中的 Metadata `viewport` 设置。
  - `width=device-width`, `initial-scale=1`, `maximum-scale=1`, `user-scalable=no`。
- [x] 创建全局 Providers 组件 (`components/providers.tsx`)。
  - 集成 `QueryClientProvider` (TanStack React Query)。
- [x] 配置 Zustand 全局 Store (`lib/store.ts`)。
  - 初始化一个基础的 Store 结构（即使暂时为空）。
- [x] 在 `app/layout.tsx` 中应用 Providers 和全局样式。
  - 确保 `body` 具有正确的背景色类（如 `bg-page-gradient` 或 `bg-white`）。
- [x] 验证移动端显示（模拟器或真机）。

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Mobile-First:** 必须优先考虑移动端体验。
- **State Management:**
  - **Zustand:** Client-side global UI state (e.g., sidebar open, current modal).
  - **React Query:** Server-side data caching and synchronization.
- **Layout:** Next.js App Router `layout.tsx` hierarchy.

### Technical Notes

- **Viewport:** Next.js 14+ uses `export const viewport: Viewport = { ... }` in `layout.tsx`, not `<meta>` tags in `Head`.
- **Providers:** Client components (like QueryClientProvider) must be wrapped in a separate `"use client"` component (`providers.tsx`) before being imported into the server component `layout.tsx`.

### Project Structure Notes

- `moon-agent/components/providers.tsx`
- `moon-agent/lib/store.ts` (or `store/index.ts`)

### References

- [Source: docs/sprint-artifacts/stories.md#Story 1.4]
- [Source: docs/sprint-artifacts/architecture.md#2.1 全栈框架 (Fullstack Web)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented `viewport` export in `app/layout.tsx` with `userScalable: false` and max scale = 1.
- Added `components/providers.tsx` wrapping TanStack React Query `QueryClientProvider`.
- Added `lib/store.ts` with a minimal Zustand store scaffold.
- Applied Providers and mobile-safe body classes (including `overflow-x-hidden`) in `app/layout.tsx`.
- Verified via unit tests: `npm test` (Vitest) passed.
- Verified `next build` compiles (fixed Next.js font loader requirement by keeping font loader at module scope).
- Pending: mobile simulator/real-device validation (WeChat/iOS Safari) and screenshot/log evidence.

### File List

- moon-agent/app/layout.tsx
- moon-agent/components/providers.tsx
- moon-agent/lib/store.ts
- moon-agent/components/providers.test.tsx
- moon-agent/lib/store.test.ts
- moon-agent/app/layout.test.ts
- moon-agent/package.json
- moon-agent/vitest.config.ts
