# Story 2.1: 账号密码登录与刷新策略

Status: review

## Story

As a returning user,
I want to sign in and keep my session refreshed across platforms,
so that 我能在多端稳定完成后续流程。

## Acceptance Criteria

1. **H5 端登录与刷新**: 成功调用 `authClient` 登录后，后端需返回 `accessToken`（存入内存）及 `httpOnly` 的 `refresh cookie`（由浏览器托管）。后续请求需默认开启 `withCredentials` 以自动携带 Cookie。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.1]
2. **微信端登录适配**: 在微信小程序中，使用 `authClient` 登录。明确放弃兼容性较差的 `weapp-cookie` 方案，采用标准的 **Header (Authorization)** + **Taro Storage** 方式进行 Token 的持久化与传递。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.1]
3. **Taro RN 端登录适配**: 在 RN 端登录成功后，使用 `CookieManager.setFromResponse` 写入 `refresh cookie`。若 Cookie 机制失效，需能平滑降级至 `Header` 方案并记录详细日志。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.1]
4. **刷新策略一致性**: 确保三端在 `accessToken` 过期时，均能自动触发 `refresh` 流程，且对业务层透明。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.1]

## Tasks / Subtasks

- [x] **多端 AuthClient 封装** (AC: 1, 2, 3)
  - [x] 在 `src/core/auth/` 下创建认证工具。
  - [x] 实现针对 H5 的 Cookie 托管逻辑。
  - [x] 实现微信端基于 Storage 和 Header 的 Token 注入与存储逻辑。
  - [x] 实现针对 RN 的 `CookieManager` 调用封装。
- [x] **Token 刷新拦截器实现** (AC: 4)
  - [x] 在 `apiClient` 中增加响应拦截器，捕获 401 错误。
  - [x] 实现静默刷新逻辑：调用 `refresh` 接口获取新 `accessToken` 并重试原始请求。
- [x] **登录页面逻辑迁移**
  - [x] 创建 `src/pages/login/` 目录。
  - [x] 绑定短信验证码登录表单，调用 `authClient.login` / `authClient.sendSmsCode` 并处理成功/失败反馈。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 页面逻辑: `app/(auth)/login/*`, `app/(auth)/register/*`, `app/(auth)/welcome/*`
  - 接口与 Hook: `app/api/auth/*`, `lib/auth/auth.ts`, `lib/auth/useAuth.ts`
- **技术规范**:
  - **安全性**: H5 端建议仅在内存保留 `accessToken`；小程序端因进程机制差异，使用 `Taro.setStorageSync` 进行持久化以维持会话。
  - **微信端适配**: 微信端不依赖 Cookie，需确保后端 API 支持从 Header (`Authorization`) 读取 Token，前端 Interceptor 负责统一注入。
- **架构参考**: 借鉴 `moon-agent/lib/auth/auth.ts` 的刷新逻辑，但需适配 Taro 的网络层拦截器。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Epic 2]

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/core/auth/`
- **关联文件**:
  - `moon_agent_taro/src/core/api/client.ts` (需在此集成拦截器)
- **规范**: 统一使用 `AuthService` 类或 `useAuth` hook 进行认证操作。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.1]
- [Source: docs/sprint-artifacts/architecture.md#2.1 全栈框架]
- [Source: docs/sprint-artifacts/prd.md#4.1 用户与权限系统]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gpt-5.2-codex-xhigh

### Debug Log References

- Typecheck: PASS (`npm run typecheck`)
- Lint: PASS (`npm run lint`)

### Completion Notes List

- 完成跨端 AuthService：H5 内存 accessToken + Cookie，微信 Storage + Header，RN CookieManager 失败时降级 Header 并记录日志。
- 在请求层与拦截器处理 401：自动刷新、重试一次，失败触发 `auth:unauthorized`。
- 迁移登录页为短信验证码登录，表单校验与 `authClient.login` / `authClient.sendSmsCode` 调用完成。
- 添加类型级测试占位（AuthClient / request refresh）。
- 补充统一格式的实现注释（AuthService / request / login page）。
- 删除密码登录实现入口（页面与 auth client 逻辑）。

### File List

- `moon_agent_taro/src/core/auth/authService.ts`
- `moon_agent_taro/src/core/auth/index.ts`
- `moon_agent_taro/src/core/auth/types.ts`
- `moon_agent_taro/src/core/auth/__tests__/authClient.test.ts`
- `moon_agent_taro/src/core/api/interceptors.ts`
- `moon_agent_taro/src/core/api/request.ts`
- `moon_agent_taro/src/core/api/__tests__/requestAuth.test.ts`
- `moon_agent_taro/src/core/index.ts`
- `moon_agent_taro/src/pages/login/index.config.ts`
- `moon_agent_taro/src/pages/login/index.scss`
- `moon_agent_taro/src/pages/login/index.tsx`
- `moon_agent_taro/src/app.config.ts`
- `docs/sprint-artifacts/taro-migration/sprint-status.yaml`

## Change Log

- 2026-01-20: 完成多端登录与刷新策略实现（短信验证码登录替代密码）
