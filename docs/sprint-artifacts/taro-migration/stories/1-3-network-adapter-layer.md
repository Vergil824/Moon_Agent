# Story 1.3: 网络适配层

Status: review

## Story

As a signed-in user,
I want consistent HTTP clients per platform,
so that requests carry credentials, headers, and work across H5/WeChat/Taro RN.

## Acceptance Criteria

1. **环境变量配置**: 完成 `TARO_APP_API_BASE` 等环境变量在各环境（dev/prod）的配置，确保 API 基础路径可动态切换。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.3]
2. **H5 端适配**: 在 H5 环境下统一使用 `Taro.request`，默认开启 `withCredentials`（可配置），自动注入 `tenant` 和 `token` 请求头，并能通过 `/app-api` 代理转发至后端。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.3]
3. **小程序/RN 端适配**: 在 `TARO_ENV=weapp` 或 `TARO_ENV=rn` 时同样使用 `Taro.request`，其返回结构（成功数据与错误对象）需与 H5 端保持完全一致。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.3]
4. **统一拦截器**: 实现全局请求与响应拦截器，处理统一逻辑，如：401 自动触发刷新/登录、5xx 错误日志记录、异常重试策略等，避免出现未处理的 Promise。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.3]

## Tasks / Subtasks

- [x] **环境变量体系搭建** (AC: 1)
  - [x] 在 `config/dev.ts` 和 `config/prod.ts` 中定义 `defineConstants`。
  - [x] 创建 `.env` 模板文件，记录各平台 API 基础路径。
- [x] **跨端请求封装** (AC: 2, 3)
  - [x] 在 `src/core/api/` 下创建请求工具类（统一基于 `Taro.request` 封装）。
  - [x] 实现针对 H5 的 `withCredentials` 与 Headers 注入逻辑（通过 `Taro.request` 参数控制）。
  - [x] 实现针对 WeChat/RN 的 `Taro.request` 适配封装，统一数据结构。
- [x] **全局拦截器开发** (AC: 4)
  - [x] 编写请求拦截器：注入认证令牌、租户 ID。
  - [x] 编写响应拦截器：处理业务状态码（如 200 vs 201）、处理系统错误码（如 401, 500）。
  - [x] 实现错误提示（Toast）与日志记录功能。
- [x] **跨端兼容性验证**
  - [x] 在 H5 和小程序端分别调用测试接口，观察 Headers 和返回数据是否符合预期。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 网络请求与工具类: `lib/core/api.ts`, `lib/utils/utils.ts`
- **技术选型**: 统一使用 `Taro.request` 进行跨端请求封装，避免 `fetch/axios` 的多实现差异。
- **架构参考**: 借鉴 `moon-agent/lib/core/api.ts` 的拦截器设计与错误处理流程。 [Source: docs/sprint-artifacts/taro-migration/epics.md#FR4]
- **安全性**: 确保 Token 刷新逻辑在网络层自动处理，不暴露给业务侧。
- **配置提醒**: H5 的代理配置需在 `config/dev.ts` 中与 `TARO_APP_API_BASE` 保持一致。

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/core/api/`
- **关联文件**:
  - `moon_agent_taro/config/dev.ts`
  - `moon_agent_taro/config/prod.ts`
- **导出规范**: 默认导出 `apiClient` 实例，命名建议为 `client.ts` 或 `request.ts`。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.3]
- [Source: docs/sprint-artifacts/architecture.md#4.1 对话交互协议]
- [Source: docs/sprint-artifacts/architecture.md#4.2 推荐算法的分层实现]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- Weapp build: SUCCESS (108 modules transformed)
- Lint check: PASS (no errors)

### Completion Notes List

### Modification Notes

- 统一 H5/WeChat/RN 请求通道为 `Taro.request`。
- 更新 H5 `withCredentials` 的实现方式为 `Taro.request` 参数控制。
- 移除对 `fetch/axios` 的技术选型描述，避免多实现分叉。

- **AC 1 (环境变量配置)**: Configured `defineConstants` in dev.ts and prod.ts with TARO_APP_API_BASE, TARO_APP_TENANT_ID, TARO_APP_ENV. Added type declarations in global.d.ts.
- **AC 2 (H5 端适配)**: Implemented H5 fetch adapter with `credentials: 'include'` for withCredentials, automatic tenant-id and Authorization header injection.
- **AC 3 (小程序端适配)**: Implemented Taro.request adapter with same response structure (ApiResponse<T>). Platform detection via `process.env.TARO_ENV`.
- **AC 4 (统一拦截器)**: Implemented global interceptors via `Taro.addInterceptor()`. Handles 401 with token refresh, 5xx error logging, Toast notifications. EventCenter for auth:unauthorized events.

### File List

**New Files:**

- `moon_agent_taro/src/core/api/request.ts` - Cross-platform request client
- `moon_agent_taro/src/core/api/interceptors.ts` - Global interceptors and token refresh

**Modified Files:**

- `moon_agent_taro/config/dev.ts` - Added defineConstants and proxy config
- `moon_agent_taro/config/prod.ts` - Added defineConstants for production
- `moon_agent_taro/types/global.d.ts` - Added TARO*APP*\* type declarations
- `moon_agent_taro/src/core/api/index.ts` - Re-export request and interceptor modules
- `moon_agent_taro/src/app.ts` - Initialize interceptors on app launch

## Change Log

- 2026-01-04: Story implementation completed (Claude Opus 4.5)
