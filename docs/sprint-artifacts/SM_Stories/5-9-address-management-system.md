# Story 5.9: 全功能地址管理系统 (Unified Address Management System)

Status: Ready for Review

## Story

作为一名 **用户**，
我想要 **通过统一的地址管理系统在购物结算时选择配送地址，或在个人中心维护我的地址库**，
以便 **我能高效地管理收货信息并享受流畅的下单体验**。

## 验收标准 (Acceptance Criteria)

1. **统一地址列表页 (`/profile/addresses`)**:

   - **Given** 用户进入地址列表。
   - **模式识别与交互**:
     - **管理模式 (Default)**: 点击地址项进入"编辑表单"；点击"添加新地址"按钮进入"创建表单"。
     - **选择模式 (`?mode=select`)**: 点击地址卡片触发"选中并返回"逻辑；只有点击右侧"编辑图标"才进入编辑。
   - **自动返回**: 在选择模式下，选中后立即将该地址设为当前选中的配送地址，并自动跳转回 `callbackUrl` 参数指定的页面。
   - **加载状态**: 等待加载地址时，必须使用 **Shadcn/UI Skeleton** 组件显示占位，提升感知速度。
   - **空状态处理**: 若地址列表为空，使用 **Shadcn/UI Empty** 样式展示提示文字及"去添加"按钮。

2. **地址项交互设计 (`AddressListItem`)**:

   - **展示**: 包含姓名、手机号（脱敏处理）、详细地址。
   - **默认标识**: 使用 **Shadcn/UI Badge** 明确标记"默认"地址。
   - **双热区设计**:
     - **热区 A (主体区域)**: 管理模式下跳转编辑，选择模式下执行选中并回跳。
     - **热区 B (编辑图标)**: 使用 `lucide-react` 的 `Pencil` 图标，始终跳转至编辑表单。

3. **地址表单逻辑 (`AddressForm`)**:

   - **表单实现**: 必须使用 **Shadcn/UI Form** 组件（基于 react-hook-form 和 zod）处理表单提交与验证。
   - **字段校验**: 姓名必填，手机号进行 11 位大陆手机号正则校验。
   - **功能支持**: 支持省市区联动选择（Picker）、详细地址输入、设为默认开关。
   - **智能地址补全**: 集成 **腾讯地图 API (Javascript API GL)**。在输入详细地址时提供关键词联想（Autocomplete），选中后自动解析并填入省、市、区及详细地址。
   - **自动默认逻辑**: 若用户创建的是**首条**地址，系统必须自动将其设为默认地址。

4. **异常流程与反馈**:
   - 腾讯地图接口调用失败时，降级为普通文本输入，不影响基础功能。
   - 接口报错（如网络问题、校验失败）需通过 Toast 弹出友好提示。

## 任务拆解 (Tasks)

### Task 1: 路由结构与 UI 壳层搭建 (Routing & Shell)

- [x] 实现 Next.js App Router 嵌套路由：`/profile/addresses`, `/profile/addresses/new`, `/profile/addresses/[id]`。
- [x] 根据 URL 参数 (`mode`, `callbackUrl`) 动态调整页面标题和交互逻辑。
- [x] 实现基于 **Shadcn/UI Skeleton** 的列表加载态。
- [x] 实现 **EmptyState** 缺省页。

### Task 2: API 适配与数据流管理 (Data Layer)

- [x] 在 `lib/addressApi.ts` 中封装地址库完整的 CRUD 接口。
- [x] 使用 `React Query` 的 `useQuery` 管理 `addressList`，并在操作后通过 `invalidateQueries` 刷新。
- [x] 实现"选择并回跳"逻辑，支持 `useRouter.push(callbackUrl)` 或 `useRouter.back()`。

### Task 3: 核心组件开发 (Components)

- [x] 开发 `AddressListItem` 组件：
  - [x] 实现双热区点击逻辑。
  - [x] 使用 `Badge` 渲染默认标签。
  - [x] 选中态视觉反馈（边框变色或 Checkmark）。
- [ ] 封装 `AddressAutocomplete` 组件（基于腾讯地图 SDK）。 _(Deferred: 用户要求暂不实现)_

### Task 4: 智能表单开发 (Forms & Integration)

- [ ] 注册并配置腾讯地图 JavaScript API Key (环境变量)。 _(Deferred: 用户要求暂不实现)_
- [x] 使用 **Shadcn/UI Form** 实现 `AddressForm`。
- [x] 集成省市区联动选择器。
- [x] 实现"首条地址自动设为默认"的前端或后端触发逻辑。
- [x] 实现表单提交后的成功跳转与数据同步。

## 技术注意事项 (Technical Notes)

- **核心接口**:
  - 获取列表: `GET /app-api/member/address/list`
  - 获取详情: `GET /app-api/member/address/get?id={id}`
  - 创建地址: `POST /app-api/member/address/create`
  - 更新地址: `PUT /app-api/member/address/update`
  - 删除地址: `DELETE /app-api/member/address/delete?id={id}`
  - 设为默认: `PUT /app-api/member/address/update-default?id={id}`
  - 获取地区树: `GET /app-api/system/area/tree`
- **关键组件库**:
  - UI 框架: **Shadcn/UI** (Form, Skeleton, Badge, Button, Input, Switch)。
  - 地图服务: **Tencent Maps JavaScript API GL**。
  - 验证: **Zod**。
- **状态同步**: 确保所有修改操作后都执行 `queryClient.invalidateQueries({ queryKey: ['addressList'] })`。

## 引用资源

- [Figma Node: 166:361 (Address Reference)](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=166-361)
- [stories.md: Story 5.9 原始定义]

## Dev Agent Record

### Implementation Plan

- Created address management system with manage/select dual modes
- Built API layer with full CRUD operations in `lib/addressApi.ts`
- Implemented React Query hooks in `lib/useAddress.ts` for state management
- Created reusable components: AddressSkeleton, AddressEmptyState, AddressListItem, AddressForm, AreaPicker
- Form validation using react-hook-form + zod
- First address auto-default logic implemented in useCreateAddress hook
- Province/City/District cascading picker using backend area tree API

### Completion Notes

- All core functionality implemented
- Tencent Maps integration deferred per user request
- Province/city/district picker implemented using `/app-api/system/area/tree` API
- Toast notifications via Sonner for all mutations
- Disabled dark mode in globals.css to maintain consistent branding
- Cart page now shows skeleton loading state and error handling

### Debug Log

- Fixed TypeScript type inference issue with react-hook-form resolver
- Fixed cart address selection not persisting across page navigation (added addressStore.ts)
- Fixed address pages showing in AppShell (added to PAGES_WITHOUT_SHELL)
- Disabled dark mode media query in globals.css

## File List

### New Files

- `moon-agent/lib/addressApi.ts` - API functions for address CRUD
- `moon-agent/lib/useAddress.ts` - React Query hooks for address management
- `moon-agent/lib/addressSchemas.ts` - Zod validation schemas
- `moon-agent/lib/addressStore.ts` - Zustand store for selected address persistence
- `moon-agent/lib/areaApi.ts` - API functions for area tree
- `moon-agent/lib/useArea.ts` - React Query hooks for area data
- `moon-agent/components/address/AddressSkeleton.tsx` - Loading skeleton
- `moon-agent/components/address/AddressEmptyState.tsx` - Empty state component
- `moon-agent/components/address/AddressListItem.tsx` - Address list item with dual hot zones
- `moon-agent/components/address/AddressForm.tsx` - Address form component
- `moon-agent/components/address/AreaPicker.tsx` - Province/City/District cascading selector
- `moon-agent/components/address/index.ts` - Component exports
- `moon-agent/components/cart/CartSkeleton.tsx` - Cart loading skeleton
- `moon-agent/app/profile/addresses/page.tsx` - Address list page
- `moon-agent/app/profile/addresses/new/page.tsx` - New address page
- `moon-agent/app/profile/addresses/[id]/page.tsx` - Edit address page

### Modified Files

- `moon-agent/app/globals.css` - Disabled dark mode
- `moon-agent/app/cart/page.tsx` - Added address integration, skeleton loading, error handling
- `moon-agent/components/layout/AppShell.tsx` - Exclude address pages from shell
- `moon-agent/components/cart/index.ts` - Export CartSkeleton
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status

## Change Log

| Date       | Change                                                          |
| ---------- | --------------------------------------------------------------- |
| 2025-12-28 | Initial implementation of address management system (Story 5.9) |
| 2025-12-28 | Deferred Tencent Maps integration per user request              |
| 2025-12-28 | Added cart-address integration and skeleton loading             |
| 2025-12-28 | Disabled dark mode, fixed address selection persistence         |
| 2025-12-28 | Implemented province/city/district cascading picker             |
