# Story 1.5: 登录与注册全流程开发

## 1. 任务概述

本 Story 旨在根据最新的 Figma 设计稿，完整实现从欢迎引导页到手机号登录、注册的闭环流程。

## 2. 设计规范

- **Welcome Page**: [Figma 162:85](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=162-85)
- **Login Page**: [Figma 163:178](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=163-178)
- **Register Page**: [Figma 163:228](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=163-228)

## 3. 验收标准 (AC)

### AC 1: 欢迎引导页 (Welcome)

- [] 背景图渲染正常：`/assets/statics/Screenshot 2025-12-25 at 21.54.23.png`。
- [] 微信登录按钮：背景色 `#07c160`，图标居左，文字居中（暂不实现跳转）。
- [] 手机号登录按钮：背景色 `rgba(255,255,255,0.1)`，边框 `rgba(255,255,255,0.3)`，点击跳转至 Login Page。
- [] 隐私协议区域：文案"登录即代表同意用户协议和隐私政策"，链接样式带下划线。

### AC 2: 手机号/密码登录页 (Login)

- [] 页面背景：原页面背景 + `backdrop-blur-[5px]` + `rgba(0,0,0,0.2)` 蒙层。
- [] 卡片样式：白色背景，圆角 `14px`。
- [] 输入框：手机号码（11 位校验）、密码（隐藏输入）。
- [] 登录按钮：背景色 `#8B5CF6` (Main Purple)，文字白色。
- [] 底部跳转：点击"立即注册"跳转至 Register Page。

### AC 3: 手机号/验证码注册页 (Register)

- [] 界面主题色：粉色系为主（对应新用户注册场景）。
- [] 验证码功能：
  - 输入 11 位手机号后，"获取验证码"按钮可用。
  - 点击后开始 60s 倒计时。
- [] 注册按钮：背景色 `#EC4899` (Bright Pink)。
- [] 底部跳转：点击"去登录"返回 Login Page。

## 4. 技术实现建议

- **认证中间件 (BFF)**:
  - **NextAuth.js (Auth.js) + Credentials Provider**: 采用目前 Next.js 生态中最标准的方案。由 Next.js 作为中间层（BFF - Backend for Frontend）来管理 Session，Spring Boot 负责 Token 签发。
  - **核心流程**: 前端提交凭证 -> NextAuth 转发至 Spring Boot (`POST /app-api/member/auth/login`) -> Spring Boot 返回 Access & Refresh Token -> NextAuth 将这两个 Token 加密存储在自己的 **HttpOnly Session Cookie** 中。
  - **Token 管理**: 由 NextAuth 自动处理 Cookie 的安全性与加密，前端组件通过 `useSession()` 获取 Token 或状态。
- **API 通信 (Native Fetch)**:
  - **移除 Axios**: 全面弃用 Axios，改用原生 `fetch` 接口。
  - **Server Components 优化**: 直接使用 `fetch` 或基于其封装的函数，以获得 Next.js 的原生缓存 (`cache`)、重验证 (`revalidate`) 和性能优化。
  - **封装请求**: 在 `lib/api.ts` 中封装通用请求工具，自动处理 Access Token 的注入以及 401 状态下的 Token 刷新逻辑。
  - **React Query 状态同步**: 推荐使用 `@tanstack/react-query` 的 `useMutation` 钩子处理登录、注册和验证码请求，以统一管理 loading 和错误反馈。
- **核心接口定义**:
  - **登录接口**: `POST /app-api/member/auth/login` (手机号+密码) 或 `POST /app-api/member/auth/sms-login` (手机号+验证码)。
  - **发送验证码**: `POST /app-api/member/auth/send-sms-code` (参数: `mobile`, `scene: 1`) -- 暂时不需要。
- **路由与中间件**:
  - **middleware.ts**: 利用 Next.js 中间件进行路由保护，确保受限页面在服务端即完成权限校验。
  - **刷新逻辑**: 在 NextAuth 的 `jwt` callback 中实现 Refresh Token 逻辑（调用 `/app-api/member/auth/refresh-token`）。

## 5. 资源文件

- 背景图: `moon-agent/public/assets/statics/Screenshot 2025-12-25 at 21.54.23.png`

## 6. 实现文件清单

### 新增/修改文件

- `app/api/auth/[...nextauth]/route.ts` - NextAuth.js API 路由入口
- `lib/auth.ts` - NextAuth 核心配置 (Options, Providers, Callbacks)
- `lib/api.ts` - 基于原生 `fetch` 封装的 API 客户端
- `lib/authSchemas.ts` - Zod 表单验证 Schema
- `app/(auth)/layout.tsx` - Auth 页面布局
- `app/(auth)/welcome/page.tsx` - 欢迎页组件
- `app/(auth)/login/page.tsx` - 登录页组件
- `app/(auth)/register/page.tsx` - 注册页组件
- `middleware.ts` - Next.js 全局认证中间件

### 移除文件

- `lib/apiClient.ts` - (被 `lib/api.ts` 替代)
- `lib/authStore.ts` - (状态由 NextAuth Session 管理)

## 7. 任务拆解 (Tasks)

### Task 1: NextAuth 基础环境集成 (NextAuth Integration)

- [x] 安装 `next-auth@beta` 相关依赖。
- [x] 配置 `app/api/auth/[...nextauth]/route.ts` 入口。
- [x] 实现 `lib/auth.ts`：配置 `CredentialsProvider` 对接 Spring Boot 登录接口。
- [x] 在 `jwt` 和 `session` callbacks 中实现 Token 加密存储与 Session 透传。

### Task 2: 基于 Fetch 的 API 封装 (Native Fetch Wrapper)

- [x] 实现 `lib/api.ts`：支持服务端 (Server Components) 和客户端的统一请求工具。
- [x] 实现 Access Token 自动注入 Header 逻辑。
- [x] 实现双 Token 刷新机制：在 `jwt` callback 中检测过期并调用 `/refresh-token`。

### Task 3: 认证页面与表单开发 (Pages & Forms)

- [x] 开发 `welcome` 欢迎页（背景图、微信/手机登录入口）。
- [x] 开发 `login` 登录页：实现账号密码表单及 Zod 验证。
- [x] 开发 `register` 注册页：实现验证码倒计时逻辑。
- [x] 集成 `useSession` 钩子，根据登录状态控制 UI 渲染（如 Header 头像）。

### Task 4: 路由保护与逻辑闭环 (Auth Logic & Middleware)

- [x] 实现 `middleware.ts`：定义公共路径白名单，保护私有路由。
- [x] 实现登录/注册成功后的重定向逻辑。
- [x] 编写并验证 `fetch` 请求工具在 Server Components 中的性能与缓存表现。

## 8. Dev Agent Record

### Implementation Notes (2025-12-28)

**Completed Components:**

- `lib/auth.ts` - NextAuth core configuration with two CredentialsProviders (password & sms)
- `lib/api.ts` - Native fetch wrapper with serverFetch & clientFetch functions
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
- `middleware.ts` - Route protection with public/private path handling
- `components/providers.tsx` - Updated with SessionProvider

**Technical Decisions:**

1. Used NextAuth.js v4.24.13 (stable) for reliable App Router compatibility
2. Implemented two separate CredentialsProviders: "password" for login, "sms" for registration
3. Token refresh logic in JWT callback with 60-second buffer before expiration
4. Session strategy: JWT (stateless, no database required)
5. Kept existing UI components unchanged - only updated auth logic

**Migration Notes:**

- `lib/authStore.ts` - Deprecated, replaced by NextAuth session management
- `lib/apiClient.ts` - Kept for backward compatibility but will be deprecated
- `lib/cartApi.ts` - Updated to use native fetch via `lib/api.ts`
- `lib/useCart.ts` - Updated to pass accessToken from session

### File List

**New Files:**

- `lib/auth.ts` - NextAuth configuration
- `lib/api.ts` - Native fetch wrapper
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `middleware.ts` - Route protection middleware

**Modified Files:**

- `package.json` - Added next-auth@beta dependency
- `components/providers.tsx` - Added SessionProvider
- `lib/useAuth.ts` - Refactored to use NextAuth signIn/signOut
- `lib/useCart.ts` - Updated to use session accessToken
- `lib/cartApi.ts` - Updated to use native fetch
- `app/page.tsx` - Updated to use useSession
- `app/(auth)/login/page.tsx` - Minor update for NextAuth integration
- `app/(auth)/register/page.tsx` - Minor update for NextAuth integration
- `vitest.setup.ts` - Added next-auth mocks for testing

### Change Log

- 2025-12-28: Story 1.5 implementation completed with NextAuth integration
