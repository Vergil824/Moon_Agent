# Story 2.5: 登出与失效处理

Status: ready-for-dev

## Story

As a signed-in user,
I want clear logout and expiry handling,
so that 会话失效后能安全退回登录。

## Acceptance Criteria

1. **主动登出处理（清理顺序明确）**: 用户点击退出登录后，需立即执行清理逻辑：清空内存中的 `accessToken`、删除 `refresh cookie`（H5 使用浏览器机制，RN 使用 `CookieManager`，小程序使用 `weapp-cookie` 或同等方案）、调用 Story 2.3 的存储清理函数，并跳转至登录或欢迎页。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]
2. **路由栈重置**: 登出/失效后必须使用 `reLaunch` 等方式重置路由栈，避免用户通过系统返回键回到受保护页面。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]
3. **会话失效拦截（刷新失败兜底）**: 当接口返回 401/403 且自动刷新流程失败时，需触发与主动退出相同的清理逻辑，并向用户展示“登录已过期，请重新登录”的明确提示。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]
4. **幂等与容错**: 即使清理过程某一步（如删除 Cookie）报错，也不应阻塞后续清理与重定向；重复触发清理应保持幂等。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]
5. **多端状态清理一致性**: 确保在 H5、微信小程序和 RN 端，登出操作都能彻底清除所有身份识别凭据，无残留状态。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]

## Tasks / Subtasks

- [ ] **梳理登出清理清单与“必须清理项”** (AC: 1, 5)
  - [ ] 列出必须清理：内存 `accessToken`、refresh cookie、持久化用户态（Story 2.3）。
  - [ ] 明确“允许保留”的非敏感项（如 Tab、主题），与 Story 2.3 的规则一致。
  - [ ] 定义统一的清理入口函数签名（例如 `logout(reason)` / `clearAuth(reason)`）。

- [ ] **实现 AuthService.logout（核心编排）** (AC: 1, 2, 4)
  - [ ] 清空内存 token（立即生效）。
  - [ ] 调用 cookie 清理适配器（平台差异封装在 adapter 内）。
  - [ ] 调用 Story 2.3 的 `clearUserSession`（或等价函数）清理持久化用户态。
  - [ ] 无论中间步骤是否报错，都保证执行最终重定向与路由栈重置（try/finally 模式）。
  - [ ] 对重复调用保持幂等（不会抛异常、不会多次弹提示）。

- [ ] **实现 cookie 清理适配器（多端）** (AC: 1, 5)
  - [ ] weapp：使用 `weapp-cookie` 或项目既定方案删除 refresh cookie。
  - [ ] H5：明确依赖浏览器 cookie 策略（如 httpOnly 由后端控制时，前端仅能通过接口触发清理）。
  - [ ] RN：使用 `CookieManager` 删除 refresh cookie（或等价方案）。
  - [ ] 明确失败处理：失败时记录日志/上报（若项目有），但不阻塞登出完成。

- [ ] **路由跳转与栈重置（统一）** (AC: 2)
  - [ ] 实现 `redirectToAuthEntry()`：使用 `Taro.reLaunch`（优先）跳转 welcome/login。
  - [ ] 确保退出后无法通过返回键回到受保护页面。

- [ ] **失效处理：401/403 + 刷新失败兜底** (AC: 3, 4)
  - [ ] 在 `apiClient`/请求层识别 401/403。
  - [ ] 当刷新流程失败：触发 `logout(reason="expired")`。
  - [ ] 统一弹出“登录已过期，请重新登录”提示（Toast/Modal/页面提示其一，并确保只提示一次）。

- [ ] **UI 触发绑定：退出按钮** (AC: 1)
  - [ ] 在个人中心/设置页的“退出登录”按钮上绑定 `logout(reason="manual")`。
  - [ ] 处理二次点击/重复触发（按钮 loading / 禁用）。

- [ ] **测试用例矩阵（优先 weapp）** (AC: 1, 2, 3, 4, 5)
  - [ ] 手动退出：token 清空 + cookie 清理调用 + 存储清理调用 + reLaunch 生效。
  - [ ] 401/403 + 刷新失败：同等清理 + “登录已过期”提示。
  - [ ] 清理步骤报错：依旧完成重定向与栈重置（不阻塞）。
  - [ ] 幂等：连续触发 logout 不会产生异常/重复提示。
  - [ ] 多端验证：分别检查 weapp/H5/RN 的 cookie 与存储残留情况（H5/RN 可标记为后续增强但需有检查项）。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 登录相关页面: `app/(auth)/login/*`, `app/(auth)/register/*`, `app/(auth)/welcome/*`
  - 认证接口与 Hook: `app/api/auth/*`, `lib/auth/auth.ts`, `lib/auth/useAuth.ts`
- **技术规范**:
  - **交互体验**: 登出后应使用 `reLaunch` 类 API 重置路由栈，防止用户通过物理返回键回到受保护页面。
  - **健壮性**: 即使清理过程中的某个步骤（如删除 Cookie）报错，也不应阻塞后续的重定向逻辑。
- **架构参考**: 借鉴 `moon-agent/lib/auth/useAuth.ts` 中的退出登录实现。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Epic 2]

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/core/auth/`
- **关联文件**:
  - `moon_agent_taro/src/core/auth/authClient.ts`
  - `moon_agent_taro/src/core/api/client.ts`
- **规范**: 登出是认证生命周期的终点，需确保其在各端的行为高度一致。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.5]
- [Source: docs/sprint-artifacts/prd.md#4.1 用户与权限系统]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gemini-3-flash-preview

### Debug Log References

### Completion Notes List

### File List

