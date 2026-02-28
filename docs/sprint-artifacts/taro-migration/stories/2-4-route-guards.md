# Story 2.4: 路由守卫

Status: review

## Story

As an unauthenticated visitor,
I want protected pages to redirect appropriately,
so that 未登录不会进入受限内容。

## Acceptance Criteria

1. **未登录重定向（含 Tab/非 Tab）**: 当未登录用户访问受保护页面（包括 Tab 页如 `/pages/profile/index` 和非 Tab 页如 `/pages/checkout/index`）时，需自动跳转至欢迎页或登录页，并显示"需要登录"的提示。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
2. **受保护路由清单可配置**: 受保护页面的定义必须可维护（白名单/黑名单/分组均可），且能覆盖"Tab 与非 Tab"的差异化跳转策略。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
3. **登录态校验与放行**: 在进入受保护路由前，需检查 `accessToken` 是否有效；若有效，则直接放行并加载用户状态（如头像、昵称等），不触发重复重定向。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
4. **会话恢复回跳**: 登录成功或会话恢复后，访问原受保护路由应能正常进入，不再被拦截；若存在"上一次被拦截的目标路由"，应优先回跳到该路由。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
5. **跨端拦截适配（Taro 生命周期）**: 考虑到小程序无传统的 `middleware`，需在 Taro 的页面生命周期（如 `componentDidShow` / `useDidShow`）或页面容器级自定义 Hook 中实现一致的守卫逻辑。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
6. **避免闪烁与循环跳转**: 守卫执行过程中需避免页面内容短暂露出（闪烁）与"登录页/欢迎页"被反复重定向的循环问题。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]

## Tasks / Subtasks

- [x] **梳理路由与受保护页面清单** (AC: 1, 2)
  - [x] 在 `app.config.ts` 或等价路由配置中列出所有页面路径（Tab/非 Tab 分组）。
  - [x] 定义 `protectedRoutes`（受保护页面清单）与 `publicRoutes`（公开页面，如 welcome/login）。
  - [x] 定义"Tab 页重定向策略"（例如 `switchTab` 到某个 Tab 或 `reLaunch`）与"非 Tab 页重定向策略"（例如 `navigateTo` / `redirectTo` / `reLaunch`）。

- [x] **设计守卫 Hook / HOC 的 API** (AC: 2, 5, 6)
  - [x] 选择实现形态：`useAuthGuard`（Hook）/ `withAuthGuard`（HOC）/ "受保护布局容器"（页面壳）。
  - [x] 定义输入输出：当前路由信息、是否受保护、鉴权结果、重定向目标、提示文案。
  - [x] 设计防循环机制：识别 welcome/login 等公开页并跳过守卫；识别已在重定向中状态。

- [x] **实现 token 校验与鉴权判断** (AC: 3)
  - [x] 在守卫内调用 `AuthService.isAuthenticated()`（或等价方法）检查内存 `accessToken` 有效性。
  - [x] 明确"未登录"的判定边界：token 缺失/过期/无效均视为未登录。
  - [x] 记录"被拦截的目标路由"（path + query + 是否 Tab）用于后续回跳。

- [x] **实现重定向与提示** (AC: 1, 4, 6)
  - [x] 未登录访问受保护页：跳转到 welcome/login，并展示"需要登录"提示（Toast/Modal/页面提示之一，项目统一即可）。
  - [x] 选择并实现跳转 API：`Taro.reLaunch` / `Taro.redirectTo` / `Taro.navigateTo` / `Taro.switchTab`（按 Tab/非 Tab 分策略）。
  - [x] 处理"返回栈"：确保用户不能通过系统返回键回到受保护页面（必要时使用 `reLaunch`）。

- [x] **实现会话恢复后的回跳** (AC: 4)
  - [x] 登录成功/会话恢复：若存在被拦截目标路由，则跳回目标路由并清理该记录。
  - [x] 若无记录：按默认落点进入（例如首页或 profile）。

- [x] **用户态加载（放行前/放行后策略明确）** (AC: 3)
  - [x] 明确用户态加载时机：放行前需具备最小信息（如 userId）还是放行后异步拉取头像昵称。
  - [x] 若加载失败：给出降级行为（例如仍放行但显示占位，或要求重新登录）。

- [x] **单元测试与场景矩阵（优先 weapp）** (AC: 1, 3, 4, 5, 6)
  - [x] 未登录访问受保护 Tab 页：被拦截并跳转 + 提示。
  - [x] 未登录访问受保护非 Tab 页：被拦截并跳转 + 提示。
  - [x] 已登录访问受保护页：不重定向，不重复提示。
  - [x] 登录后回跳：能回到原目标路由，且不再拦截。
  - [x] 防循环：welcome/login 不会触发二次重定向。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 路由拦截与布局: `middleware.ts`, `app/(auth)/layout.tsx` (受保护布局与重定向逻辑)
- **技术规范**:
  - **交互体验**: 重定向应平滑，避免闪烁。
  - **灵活性**: 守卫逻辑应支持"部分页面开放，部分页面锁定"的灵活配置。
- **架构参考**: 虽然无法直接使用 Next.js 的 `middleware.ts`，但应借鉴其逻辑流程，在 Taro 端的 `app.ts` 或页面级 Hook 中实现类似功能。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Epic 2]

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/hooks/` 或 `moon_agent_taro/src/core/auth/`
- **关联文件**:
  - `moon_agent_taro/src/app.config.ts` (路由清单)
- **规范**: 统一使用 `useAuthGuard` 进行页面保护。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.4]
- [Source: docs/sprint-artifacts/prd.md#4.1 用户与权限系统]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

None - All tasks completed without errors.

### Completion Notes List

1. **路由配置** (`routes.ts`)
   - `TAB_ROUTES`: chat, cart, profile
   - `PUBLIC_ROUTES`: welcome, login, index, ui-smoke
   - `PROTECTED_ROUTES`: chat, cart, profile
   - `getRedirectStrategy()`: Tab 页使用 reLaunch 防止返回

2. **守卫 Hook** (`useAuthGuard.tsx`)
   - `useAuthGuard`: 主要 Hook，检测认证状态
   - `withAuthGuard`: HOC 包装器
   - `AuthGuardResult`: status (checking/authenticated/redirecting/public)
   - 使用 `useDidShow` 集成 Taro 生命周期

3. **Return URL 处理**
   - `storeReturnUrl()`: 存储被拦截路由
   - `navigateToReturnUrl()`: 登录后跳回
   - `hasReturnUrl()` / `peekReturnUrl()`: 查询工具
   - 30分钟过期机制

4. **防循环与防闪烁**
   - `isRedirecting` ref 防止重复重定向
   - `isAuthRedirectTarget()` 识别公开页跳过守卫
   - 返回 `null` 在 checking/redirecting 状态防止内容闪烁

5. **AuthService 扩展**
   - 添加 `isAuthenticated()` 方法

### File List

**新增文件:**
- `moon_agent_taro/src/core/auth/routes.ts`
- `moon_agent_taro/src/core/auth/useAuthGuard.tsx`
- `moon_agent_taro/src/core/auth/__tests__/routes.test.ts`
- `moon_agent_taro/src/core/auth/__tests__/useAuthGuard.test.ts`

**修改文件:**
- `moon_agent_taro/src/core/auth/index.ts` - 添加路由和守卫导出
- `moon_agent_taro/src/core/auth/authService.ts` - 添加 isAuthenticated 方法
- `docs/sprint-artifacts/taro-migration/sprint-status.yaml` - 状态更新

## Change Log

- 2026-01-26: 完成 Story 2.4 路由守卫实现，所有任务完成。
