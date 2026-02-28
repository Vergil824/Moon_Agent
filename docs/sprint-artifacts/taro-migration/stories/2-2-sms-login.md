# Story 2.2: 短信登录

Status: review

## Story

As a user without password,
I want to log in via SMS code,
so that 我能快速进入聊天与下单。

## Acceptance Criteria

1. **验证码请求**: 用户输入合规手机号后可请求发送短信验证码。需实现防刷机制与冷却时间提示（如 60s 倒计时）。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.2]
2. **验证码登录**: 用户输入正确验证码后完成登录。登录后的令牌处理需遵循 Story 2.1 的规范：`accessToken` 仅存内存，`refresh` 策略通过 Cookie 或 Header 实现。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.2]
3. **跨端交互一致性**: 确保手机号输入格式校验、验证码倒计时等交互在 H5、微信小程序和 RN 端均保持一致。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.2]

## Tasks / Subtasks

- [x] **验证码发送接口集成** (AC: 1)
  - [x] 在 `authClient` 中增加发送短信验证码的接口方法。
  - [x] 实现前端倒计时逻辑（使用 `useCountDown` 或类似 hook）。
- [x] **短信登录接口集成** (AC: 2)
  - [x] 在 `authClient` 中增加短信验证码登录的接口方法。
  - [x] 集成 Story 2.1 中已实现的 Token 管理与刷新拦截器。
- [x] **短信登录页面开发** (AC: 3)
  - [x] 在 `src/pages/login/` 下增加短信登录模式。
  - [x] 绑定手机号与验证码输入框，处理校验逻辑。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 登录注册页面: `app/(auth)/login/*`, `app/(auth)/register/*`, `app/(auth)/welcome/*`
  - 认证逻辑与 Hook: `app/api/auth/*`, `lib/auth/auth.ts`, `lib/auth/useAuth.ts`
- **技术规范**:
  - **安全性**: 手机号输入需进行正则校验。
  - **防刷机制**: 前端冷却时间需与后端策略保持同步。
- **架构参考**: 借鉴 `moon-agent/lib/auth/auth.ts` 中处理手机验证码的逻辑。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Epic 2]

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/core/auth/`
- **关联文件**:
  - `moon_agent_taro/src/core/auth/authClient.ts`
- **规范**: 短信登录作为 `AuthService` 的一个方法实现。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 2.2]
- [Source: docs/sprint-artifacts/prd.md#4.1 用户与权限系统]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

### Completion Notes List

- **验证码发送接口**: `authService.sendSmsCode(mobile, scene)` 已在 authService.ts 中实现，支持 H5/weapp/RN 跨平台
- **前端倒计时**: 在 login 页面使用 useState + useEffect 实现 60s 倒计时逻辑
- **短信登录接口**: `authService.login()` 和 `authService.loginWithSms()` 已实现，集成 Token 管理
- **Token 管理**: accessToken 内存存储，refreshToken 按平台策略（H5 Cookie / weapp 存储 / RN fallback）
- **登录页面**: `src/pages/login/index.tsx` 使用 react-hook-form + zod 进行表单验证
- **手机号校验**: 使用正则 `/^1[3-9]\d{9}$/` 验证 11 位中国手机号
- **用户额外要求已实现**:
  - 创建 `AuthLayout` 组件，welcome/login 共享背景图片（缓存避免重新加载）
  - 背景图片使用指定的 `Screenshot 2025-12-25 at 21.54.23.png`
  - 修复"获取验证码"按钮字体显示问题：移除 opacity-50，使用更深灰色 `text-[#6b7280]`，增加 `font-semibold`
  - 修正 placeholder 从 "4 位验证码" 改为 "6 位验证码" 与 schema 一致

### File List

- `moon_agent_taro/src/assets/auth/auth-bg.png` (新增)
- `moon_agent_taro/src/core/components/auth/AuthLayout.tsx` (新增)
- `moon_agent_taro/src/core/components/auth/index.ts` (新增)
- `moon_agent_taro/src/core/components/index.ts` (修改)
- `moon_agent_taro/src/pages/welcome/index.tsx` (修改)
- `moon_agent_taro/src/pages/login/index.tsx` (修改)
- `moon_agent_taro/src/core/auth/authService.ts` (已存在)
- `moon_agent_taro/src/core/auth/types.ts` (已存在)
- `moon_agent_taro/src/core/schemas/form.ts` (已存在)
