# Story 5.5: 个人中心与订单列表

Status: Ready for Review

## Story

As a **User**,
I want **to view my profile and order status on the "Me" page, and manage account security and basic info**,
so that **I can track my purchase history and keep account info accurate**.

## Acceptance Criteria

### 1. 个人中心主页 (Figma 152:78)

- **Given** 用户点击底部导航栏的“我的”。
- **When** 页面加载。
- **Then** 调用 `/app-api/member/user/get` 获取数据。
- **And** 展示：用户头像 (`avatar`)、昵称 (`nickname`) 和 ID。
- **And** 显示 **Skeleton** 加载占位符以避免布局抖动 (CLS)。
- **And** 提供菜单项：
  - 我的订单 (`/profile/orders`)
  - 我的售后
  - 收货地址 (关联 Story 5.9，路由 `/profile/addresses`，如未实现则暂且保留入口)
  - 关于我们
  - 设置 (`/profile/settings`)

### 2. 设置与资料修改 (Figma 166:361)

- **When** 点击“设置”。
- **Then** 进入设置页，提供“修改密码”和“修改个人资料”入口。
- **And** 点击“修改资料”支持更新 `nickname` 和 `avatar` (调用 `/app-api/member/user/update`)。
- **And** 点击“修改密码”进入密码变更流程 (调用 `/app-api/member/user/update-password`)。
- **And** **表单验证 (Validation)**:
  - **昵称**: 必填，1-20 字符。
  - **密码**: 必填，至少 6 位 (需与 Story 1.5 注册规则保持一致)。
- **And** **用户反馈**:
  - 操作成功时显示 **Toast** ("修改成功")。
  - 操作失败时显示 **Toast** (API 返回的错误信息)。
- **And** **交互与导航逻辑**:
  - 子页面（设置、修改资料、修改密码）必须包含“返回”按钮，且遵循物理返回路径。
  - 当用户通过底部导航栏切换到其他 Tab 再返回“我的”时，应保持在离开前的页面（状态保持）。

### 3. 订单列表分页

- **When** 点击“我的订单”。
- **Then** 调用 `/app-api/trade/order/page` 渲染订单分页列表。
- **And** 使用 **Shadcn/UI Pagination** 组件进行翻页控制。
- **And** 每项订单展示包含：订单 ID、编号 (`no`)、状态 (`status`)、实付金额 (`payPrice`) 及订单项列表 (`items`)。

## Tasks / Subtasks

- [x] 个人中心页面 (`/profile`) 开发 (AC: 1)
  - [x] 实现 UI 布局 (Header, Menu Items)
  - [x] 集成 `useQuery` 调用 `/app-api/member/user/get`
  - [x] 实现 Skeleton Loading 状态
  - [x] 处理菜单导航链接 (含地址管理占位)
- [x] 设置与资料修改功能开发 (AC: 2)
  - [x] 创建设置页面及子页面
  - [x] 定义 Zod Schema (ProfileSchema, PasswordSchema)
  - [x] 实现资料更新逻辑 + Toast 反馈
  - [x] 实现密码修改逻辑 + Toast 反馈
  - [x] 确保 Form 验证与后端规则一致
- [x] 订单列表页面开发 (AC: 3)
  - [x] 创建订单列表页 (`/profile/orders`)
  - [x] 实现订单列表 UI item 组件
  - [x] 集成 `/app-api/trade/order/page` API
  - [x] 实现 Pagination 逻辑

## Dev Notes

### API Interface

| Action      | Method | Endpoint                               | Payload/Return                            |
| :---------- | :----- | :------------------------------------- | :---------------------------------------- |
| Get Info    | `GET`  | `/app-api/member/user/get`             | Resp: `AppMemberUserInfoRespVO`           |
| Update Info | `PUT`  | `/app-api/member/user/update`          | Body: `{ nickname, avatar }`              |
| Update Pwd  | `PUT`  | `/app-api/member/user/update-password` | Body: `{ oldPassword, newPassword }`      |
| Order List  | `GET`  | `/app-api/trade/order/page`            | Resp: `PageResult<AppTradeOrderPageItem>` |

- **Data Management**:
  - Use `@tanstack/react-query`'s `useQuery` for fetching.
  - Use `queryClient.invalidateQueries({ queryKey: ['user-info'] })` after successful update.

### Project Structure Notes

- Use `clientFetch` from `lib/api.ts` for all client-side requests.
- Ensure Auth token is handled automatically.
- Components location: `components/profile/` or `components/order/`.

### References

- `moon-agent/lib/api.ts`: API wrapper definition.
- `moon-agent/lib/auth.ts`: Authentication types.
- **Story 1.5 (Login)**: Refer for consistent UI styling and form behavior.
- **Story 5.9 (Address)**: Future integration point for address menu.
- Figma: 152:78 (Profile), 166:361 (Settings)

## Dev Agent Guardrails

### Technical Requirements

- **Framework**: Next.js 14 (App Router)
- **Type Safety**: MUST define or import strict TypeScript interfaces for API responses (`AppMemberUserInfoRespVO`). DO NOT use `any`.
- **Validation**: `zod` schema MUST be used for all forms.
- **UI Feedback**: `sonner` or `use-toast` (shadcn) MUST be used for user feedback.

### Architecture Compliance

- **API Pattern**: MUST use `clientFetch`.
- **Auth**: Rely on `clientFetch` token injection.
- **Directory Structure**:
  - Pages: `app/profile/page.tsx`, `app/profile/settings/page.tsx`
  - Components: `components/profile/ProfileHeader.tsx`, `components/profile/ProfileMenu.tsx`

### Library/Framework Requirements

- `lucide-react` for icons.
- `react-hook-form` + `zod`.
- `@tanstack/react-query`.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Current Agent

### Completion Notes List

- Initial Draft Created based on user input.
- Validated and Enhanced: Added Zod validation, Toast feedback, Type safety requirements, and improved navigation context.
- Status set to ready-for-dev.
- **Task 1 Complete (2025-12-29)**: 个人中心页面开发完成
  - Created `lib/userApi.ts` with user API types and functions
  - Created `lib/useUser.ts` hook with `useUserInfo`, `useUpdateUserInfo`, `useUpdatePassword`
  - Created `components/profile/ProfileHeader.tsx`, `ProfileMenu.tsx`, `ProfileSkeleton.tsx`
  - Updated `app/profile/page.tsx` with full implementation
  - All 13 tests passing
- **Task 2 Complete (2025-12-29)**: 设置与资料修改功能完成
  - Created `lib/profileSchemas.ts` with Zod validation schemas
  - Created `app/profile/settings/page.tsx` settings menu
  - Created `app/profile/settings/edit-profile/page.tsx` profile edit page
  - Created `app/profile/settings/change-password/page.tsx` password change page
  - All 28 tests passing
- **Task 3 Complete (2025-12-29)**: 订单列表页面开发完成
  - Extended `lib/orderApi.ts` with order list types and pagination API
  - Created `lib/useOrders.ts` hook with `useOrderList`
  - Created `components/order/OrderListItem.tsx`, `OrderListSkeleton.tsx`, `OrderEmptyState.tsx`
  - Created `app/profile/orders/page.tsx` with full pagination
  - All 21 tests passing
- **Total: 62 tests passing for Story 5-5**

### File List

**New Files:**

- `lib/userApi.ts` - User API types and functions
- `lib/useUser.ts` - User hooks for profile management
- `lib/useUser.test.tsx` - Tests for user hooks
- `lib/profileSchemas.ts` - Zod validation schemas for profile/password
- `lib/profileSchemas.test.ts` - Tests for validation schemas
- `lib/useOrders.ts` - Order list hook
- `components/profile/ProfileHeader.tsx` - Profile header component
- `components/profile/ProfileMenu.tsx` - Profile menu navigation
- `components/profile/ProfileSkeleton.tsx` - Loading skeleton
- `components/profile/index.ts` - Profile components export
- `components/order/OrderListItem.tsx` - Order item card
- `components/order/OrderListSkeleton.tsx` - Order list skeleton
- `components/order/OrderEmptyState.tsx` - Empty state component
- `components/order/index.ts` - Order components export
- `components/order/OrderListItem.test.tsx` - Order item tests
- `app/profile/settings/page.tsx` - Settings page
- `app/profile/settings/page.test.tsx` - Settings page tests
- `app/profile/settings/edit-profile/page.tsx` - Edit profile page
- `app/profile/settings/edit-profile/page.test.tsx` - Edit profile tests
- `app/profile/settings/change-password/page.tsx` - Change password page
- `app/profile/settings/change-password/page.test.tsx` - Change password tests
- `app/profile/orders/page.tsx` - Orders list page
- `app/profile/orders/page.test.tsx` - Orders page tests

**Modified Files:**

- `lib/orderApi.ts` - Added order list types and pagination API
- `app/profile/page.tsx` - Rewritten with full profile functionality
- `app/profile/page.test.tsx` - Added comprehensive tests
