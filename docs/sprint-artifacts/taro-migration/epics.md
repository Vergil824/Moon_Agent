---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - ../../taro-migration/README.md
  - ../../sprint-artifacts/prd.md
  - ../../sprint-artifacts/architecture.md
  - ../../sprint-artifacts/UX.md
---

# 撑撑姐 - Epic Breakdown

## Overview

本文汇总“满月 Moon”项目的史诗与用户故事拆解，基于 PRD、UX（如有）与架构要求，将需求整理为可落地的实现项。

## Requirements Inventory

### Functional Requirements

FR1: 交付基于 Taro 4 + React 的多端应用（H5/微信小程序/Taro RN），配置 tabBar (/chat, /cart, /profile) 及非 tab 页（checkout、pay、addresses、orders、settings）。
FR2: 提供共享 `packages/core`，暴露 api client、schemas (zod)、Zustand stores、hooks (auth/cart/chat/profile)、常量与 utils，并通过平台适配层复用。
FR3: 实现认证流程（密码登录、短信登录、刷新、登出），accessToken 仅存内存，refreshToken 依赖 httpOnly Cookie；跨端 Storage 抽象与路由守卫。
FR4: 交付网络层：H5 用 fetch/axios，微信用 Taro.request 适配器，Taro RN 适配；统一 headers/tenant/token，默认 withCredentials，并配置 `/app-api` 代理。
FR5: 聊天通道：H5 流式 fetch+ReadableStream；微信/Taro RN WebSocket（鉴权、心跳、重连、退避），WS 不可用时轮询兜底 (socket IO)。WebSocket 接口移至 payment_interface 项目中，并更新前端接口。
FR6: 电商闭环迁移：诊断驱动的商品推荐、购物车 SKU/数量、订单创建、支付宝支付与成功反馈。
FR7: 用户中心：订单列表、售后申请/跟踪、地址管理、测量/诊断结果同步。
FR8: 保持量体/诊断对话流（欢迎、测量输入、辅助数据滑块、胸型选择、痛点网格、分析进度反馈）并用新 UI 复刻。
FR9: UI 迁移为 Duxui（或 Taro 兼容组件），表单继续 react-hook-form + zod，移除 Next.js 组件（navigation/link/image/font）。
FR10: 样式迁移至 Tailwind + 全局 CSS token（渐变、阴影、玻璃态），使用 taro-tailwind/postcss，确保跨端兼容效果。
FR11: 媒体与资源：远程图片域白名单、Taro Image/Taro RN Image、@font-face/系统字体、图片占位与尺寸处理。
FR12: 测试与交付：更新 H5 单测/集成，补充微信 e2e/集成，预备 Taro RN Jest/react-native-testing-library，CI 分渠道构建隔离产物。

### NonFunctional Requirements

NFR1: 测量/身体数据加密，最小化存储用户数据。
NFR2: 对话响应 <2s，支付流程流畅，跨端保持交互顺滑。
NFR3: 优先跨端共享，减少 `process.env.TARO_ENV` 分支，仅在必要时使用平台后缀文件。
NFR4: WebSocket 稳定性：鉴权、心跳、重连/退避，必要时降级轮询；H5 保持 SSE 流式。
NFR5: 维持带凭证请求（withCredentials/cookies），同时满足 CORS 与平台白名单/域策略。
NFR6: Vite 构建高效，按 `dist/${process.env.TARO_ENV}` 分目录避免产物冲突。

### Additional Requirements

- 保持 n8n 编排在 BFF/API 层后端；Taro 端适配器需与现有接口兼容。
- axios/Taro 请求封装统一 headers、错误处理、重试/刷新、`/app-api` 代理配置。
- WebSocket 协议：wss 端点、Header/Query 鉴权、`auth_ack`、`partial/end/error` 事件、20–30s 心跳、重连策略、轮询兜底。
- UX 规范：Duxui 优先、对话驱动、3D 量体动画、抽象胸型图标、痛点图标、品牌色体系。
- 跨端约束：首选共享逻辑；仅必要时用 `.h5.ts`/`.weapp.ts`/`.rn.ts`；维护远程资源白名单（图片/字体/WS 域）；多命令产出 H5/weapp/rn。
- 测试与发布：H5 vitest/RTL mocks，微信端集成/e2e（如 miniprogram-automator），Taro RN 测试基线，CI 分渠道产物。

### Taro 组件替换清单（跨端适配提醒）

- 基础标签：`div/span/p/section` 等 → `View`；文本 → `Text`（遵循 @tarojs/components 规范，事件用 onX）。参考：https://docs.taro.zone/docs/components-desc
- 图片：`img`/`next/image` → `Image`（配合远程域白名单、占位与尺寸处理）。
- 链接/路由：`next/link`/`a` → Taro 路由 API（Navigator/路由方法），tabBar 配置在 `app.config.[ts|js]`。
- 表单输入：`input/textarea/select` → `Input`/`Textarea`/`Picker` 等 Taro 组件；事件全部改为 onChange/onInput 等。
- 按钮/操作：`button` → `Button`；开关、滑块等使用 Taro 对应组件或 Duxui Taro 版组件。
- 滚动/列表：如有 `div` 自实现滚动，改用 `ScrollView`；动画/骨架使用 Taro 兼容实现（或 Duxui Taro 版）。
- 媒体：`video/audio` 使用 Taro 媒体组件；文件上传使用 Taro 上传能力。

针对故事的替换提示：

- Story 1.1/1.4（基础壳 & UI）：布局用 View/Text，导航用 Navigator/tabBar 配置；全局按钮/输入统一用 Taro 组件或 NutUI（Taro 版）。
- Story 3.1~3.5（聊天体验）：消息列表/容器用 View/ScrollView；输入与选择组件用 Taro Input/Picker/Button，图文用 Image；滚动/“有新消息”在 ScrollView 中实现。
- Story 4.1~4.5（推荐/购物车/支付）：商品卡片/列表用 View/Image/ScrollView；SKU/数量选择用 Taro 表单组件或 Duxui Taro 版；提交按钮用 Button；支付/结果页媒体展示用 Image。
- Story 5.x（订单/售后/地址）：列表/时间线用 View/Text/ScrollView；表单（地址/资料）用 Input/Picker/Button；上传凭证用 Taro 上传能力；状态提示用 Duxui Taro 版或 Taro 组件。

### FR Coverage Map

FR1: Epic 1 - 多端入口与导航可用  
FR2: Epic 1 - 共享 core 支撑跨端能力  
FR3: Epic 2 - 安全登录与访问控制  
FR4: Epic 1 - 网络适配与代理可用  
FR5: Epic 3 - 跨端实时聊天通路就绪  
FR6: Epic 4 - 购物车/支付闭环可用  
FR7: Epic 5 - 用户中心与售后可用  
FR8: Epic 3 - 量体诊断体验落地  
FR9: Epic 1 - UI 组件与表单迁移完成  
FR10: Epic 1 - 样式与主题迁移完成  
FR11: Epic 1 - 媒体与资源适配完成  
FR12: Epic 6 - 质量保障与交付就绪

## Epic List

### Epic 1: 多端基础与适配层上线

让用户能在 H5/微信/Taro RN 顺畅进入应用、使用主导航，并看到一致的主题与资源加载；共享 core/适配层为后续能力打底。  
**FRs covered:** FR1, FR2, FR4, FR9, FR10, FR11

### Epic 2: 登录鉴权与访问控制

用户可完成登录/退出，会话与受保护页面按策略放行，跨端存储与路由守卫一致。  
**FRs covered:** FR3

### Epic 3: 聊天与测量诊断体验

用户可通过流式聊天完成量体/痛点诊断，跨端 WebSocket/心跳/兜底保障体验稳定。  
**FRs covered:** FR5, FR8

### Epic 4: 电商闭环：推荐 → 购物车 → 支付

用户可查看推荐、加购、创建订单并完成支付宝支付，获得清晰状态反馈。  
**FRs covered:** FR6

### Epic 5: 用户中心与售后

用户可查看订单、提交/跟踪售后、管理地址与资料同步。  
**FRs covered:** FR7

### Epic 6: 上线与质量保障

多端测试、mock、CI 分渠道构建与产物发布，支撑稳定上线。  
**FRs covered:** FR12

## Epic 1: 多端基础与适配层上线

### Story 1.1: 多端壳与 tabBar 初始化

As a shopper using different devices,
I want to enter the app on H5/WeChat/Taro RN with consistent tab navigation,
So that I can reach chat/cart/profile quickly on any platform.

**Acceptance Criteria:**

**Given** Taro4 项目安装完成，提供 H5/WeChat/Taro RN 启动脚本 (`/Users/lilangjun/Desktop/Moon/moon_agent_taro`)
**When** 运行各平台开发命令  
**Then** 构建通过且显示 tabBar（/chat, /cart, /profile）与页面路由  
**And** outputRoot 按平台分目录（如 dist/h5、dist/weapp、dist/rn）

**Given** devServer 配置 /app-api 代理  
**When** 在 H5 端请求 /app-api 健康检查  
**Then** 请求命中代理且无 CORS 报错

**Given** 远程图片域名写入微信白名单/URLCheck  
**When** 在微信开发者工具打开示例图片  
**Then** 无安全警告且图片正常展示

### Story 1.2: 共享 core 包与路径别名

As a developer,
I want a shared `packages/core` with aliases,
So that 业务模块可跨端复用 api/schemas/stores/hooks/utils。

**Acceptance Criteria:**

**Given** 创建 `packages/core` 并定义入口导出(api client stub、schemas、stores、hooks、utils)  
**When** 在应用端通过别名（如 `@core/api`）导入  
**Then** H5/WeChat/Taro RN 构建均能通过且无循环依赖/未解析模块

**Given** package.json/workspace 配置完成  
**When** 运行安装与构建  
**Then** 软链/别名生效，不需相对路径穿越

### Story 1.3: 网络适配层

As a signed-in user,
I want consistent HTTP clients per platform,
So that requests carry credentials, headers, and work across H5/WeChat/Taro RN.

**Acceptance Criteria:**

**Given** TARO_APP_API_BASE 等环境变量配置  
**When** 在 H5 调用请求封装  
**Then** 默认 withCredentials，自动注入 tenant/token header，并通过 `/app-api` 代理

**Given** TARO_ENV=weapp  
**When** 发起请求  
**Then** 使用 Taro.request 适配器且返回结构与 H5 保持一致的成功/错误处理

**Given** 请求失败（如 401/5xx）  
**When** 触发拦截器  
**Then** 日志/重试或错误提示按照约定执行，不出现未处理 Promise

### Story 1.4: UI 组件与主题基线（NutUI + weapp-tailwindcss）

As a shopper,
I want consistent UI components and theme,
So that 视觉/交互在多端保持一致。

**Acceptance Criteria:**

**Given** 核心组件库使用 NutUI（`@nutui/nutui-react-taro`），并启用按需引入样式（`babel-plugin-import`）  
**When** 渲染包含 NutUI Button/Input（或等价组件）+ Tailwind 工具类的示例页面  
**Then** 微信端样式正常生效（NutUI + Tailwind），且无运行时报错

**Given** `weapp-tailwindcss` 已按 Taro 4 + Vite 推荐方式接入，并开启 `injectAdditionalCssVarScope: true`  
**When** 构建/运行 `TARO_ENV=weapp`  
**Then** Tailwind 类名与样式转换正确，且 Tailwind/CSS 变量不会被 Taro Vite 移除导致主题失效

**Given** 主题 Token 与全局工具类以 `moon-agent/app/globals.css` 为真源（如需 Tailwind 类语义映射，再参考 `moon-agent/tailwind.config.ts`）  
**When** `moon_agent_taro` 侧使用同名同义的 CSS 变量与 Tailwind 映射（品牌色/渐变/圆角/阴影）  
**Then** `moon-agent` 与 `moon_agent_taro` 关键视觉风格一致

**Given** 表单示例使用 `react-hook-form` + `zod`  
**When** 在微信端填写提交  
**Then** 校验与错误提示正常，无跨端兼容问题

**Given** 存在一个 UI Smoke Test（组件可用性）页面  
**When** 在微信端打开该页面并执行基础交互（点击、输入、Toast 等）  
**Then** NutUI 组件可正常渲染与交互，Tailwind/全局工具类生效，且无明显控制台错误

### Story 1.5: 资源与字体适配

As a shopper,
I want images and fonts to load correctly across platforms,
So that 界面完整、无缺失或警告。

**Acceptance Criteria:**

**Given** 远程图片域白名单与本地占位方案配置  
**When** H5 与微信端加载示例图片  
**Then** 无警告，尺寸按占位/比例正确展示

**Given** 字体通过 @font-face 或系统字体定义  
**When** 在 H5/微信/Taro RN 预览  
**Then** 字体加载成功或优雅降级，无 404/跨域报错

**Given** Taro Image/Taro RN Image 替换示例位  
**When** 构建多端  
**Then** 资源路径正确打包到对应 dist 子目录

**现有实现参考（moon-agent）：**

- Story 1.1: `app/layout.tsx`, `app/page.tsx`, `app/(auth)/layout.tsx`, `tailwind.config.ts`, `app/globals.css`
- Story 1.2: `lib/core/api.ts`, `lib/core/store.ts`, `lib/core/supabaseClient.ts`
- Story 1.3: `lib/core/api.ts`, `lib/utils/utils.ts`
- Story 1.4: `components/layout/*`, `components/ui/*`, `app/globals.css`, `tailwind.config.ts`
- Story 1.5: `public/assets/*`, `app/globals.css`

## Epic 2: 登录鉴权与访问控制

### Story 2.1: 账号密码登录与刷新策略

As a returning user,
I want to sign in and keep my session refreshed across platforms,
So that 我能在多端稳定完成后续流程。

**Acceptance Criteria:**

**Given** H5 端调用 authClient 登录  
**When** 后端返回 accessToken + httpOnly refresh cookie，且 axios 请求默认 withCredentials  
**Then** accessToken 仅存内存，refresh cookie 由浏览器托管并随后续请求发送

**Given** 微信端同域或经代理访问 API  
**When** 使用 authClient（封装 wx-cookie/weapp-cookie 或 sessionId header 兜底）登录  
**Then** refresh 凭据能随请求携带；若服务器 Set-Cookie 受限，则 fallback 为 header/sessionId 且登录流程可完成

**Given** Taro RN 端登录  
**When** 收到 Set-Cookie  
**Then** CookieManager.setFromResponse 写入 refresh cookie；后续请求自动附带；若失败则使用 header 兜底且有日志

### Story 2.2: 短信登录

As a user without password,
I want to log in via SMS code,
So that 我能快速进入聊天与下单。

**Acceptance Criteria:**

**Given** 输入手机号  
**When** 请求短信验证码  
**Then** 触发防刷/冷却提示，成功状态有倒计时

**Given** 用户输入验证码  
**When** 提交短信登录  
**Then** 与 Story 2.1 相同的 accessToken 内存持有与 refresh 策略生效，并返回登录成功态

### Story 2.3: 会话存储抽象

As a developer,
I want a storage abstraction for session-safe data,
So that 跨端持久化必要用户态且不泄露 token。

**Acceptance Criteria:**

**Given** 封装 Storage 适配（H5 localStorage/sessionStorage、微信/Taro RN 存储 API）  
**When** 调用存取用户信息
**Then** 在各端均可正常读写；存储中不包含 accessToken/refresh token

**Given** 用户首次登录或登出  
**When** 清理存储  
**Then** 仅保留必要的非敏感信息（如上次 tab、主题），敏感字段被移除

（这里后续会改为通过数据库来存储用户与 agent 的会话信息，需要留出一个接口来后期直接对接数据库）

### Story 2.4: 路由守卫

As an unauthenticated visitor,
I want protected pages to redirect appropriately,
So that 未登录不会进入受限内容。

**Acceptance Criteria:**

**Given** 未登录访问受保护页面（含 tab 与非 tab 页）  
**When** 进入页面  
**Then** 自动跳转到欢迎/登录页，并提示需要登录

**Given** 登录态恢复后访问同一路由  
**When** 守卫检测到有效 accessToken  
**Then** 放行并加载用户态（例如头像/昵称），不重复重定向

### Story 2.5: 登出与失效处理

As a signed-in user,
I want clear logout and expiry handling,
So that 会话失效后能安全退回登录。

**Acceptance Criteria:**

**Given** 用户主动点击退出  
**When** 触发登出  
**Then** 清空内存 accessToken、删除 refresh cookie（H5/RN 使用 CookieManager 或 weapp-cookie），清理存储并跳转登录/欢迎

**Given** 接口返回 401/403  
**When** 刷新流程失败  
**Then** 触发与主动退出相同的清理与跳转流程，并提示登录已过期

**现有实现参考（moon-agent）：**

- Story 2.1/2.2/2.5: `app/(auth)/login/*`, `app/(auth)/register/*`, `app/(auth)/welcome/*`, `app/api/auth/*`, `lib/auth/auth.ts`, `lib/auth/useAuth.ts`
- Story 2.3: `lib/auth/useAuth.ts`, `lib/core/store.ts`（用户态存储），`middleware.ts`
- Story 2.4: `middleware.ts`, `app/(auth)/layout.tsx`（受保护布局与重定向逻辑）

## Epic 3: 聊天与测量诊断体验

### Story 3.1: 聊天通道适配（流式/WS/兜底）

As a shopper,
I want chat to stream across platforms,
So that 我能实时获得回复并在小程序/RN 正常使用。

**Acceptance Criteria:**

**Given** H5 端发起聊天  
**When** 通过 fetch/ReadableStream 或 SSE 请求  
**Then** partial 增量流式输出，end 事件合并完整消息，错误时提示并可重试

**Given** 微信/Taro RN 端发起聊天  
**When** 使用 Taro.connectSocket（带 Header/Query token）建立 WS  
**Then** 收到 auth_ack 后开始收发消息；心跳每 20–30s；断线自动重连，超过阈值切换轮询兜底

**Given** WS 连续失败或在弱网  
**When** 进入轮询模式  
**Then** 仍能获取新消息，UI 显示已降级状态

**迁移实现要求：**

- H5 复用 `lib/chat/sse.ts`、`lib/chat/chatProtocol.ts`、`app/api/chat/route.ts`；Taro 端替换为 `Taro.connectSocket` + 轮询兜底，事件语义保持 `partial/end/error/auth_ack/心跳`，重连策略参考 `lib/chat/n8nDualChannel.ts`。对于 websocket，在后端 `payment_interface` 项目中实现,把 `moon-agent` 项目中的 `app/api/chat/route.ts` 迁移到 `payment_interface` 项目中,并更新前端接口。

**补充说明（推荐 BFF 起步形态）：**

- 推荐让 **weapp/H5 仅连接 `payment_interface`**，不直连 n8n（隐藏 n8n 地址与 token，统一鉴权/限流/审计日志/错误映射）。
- Phase 1（最低复杂度，优先落地）：在 `payment_interface` 新增 `chat/stream`（或等价路径）作为 **SSE 流式代理/透传**。
  - `payment_interface` 不实现聊天业务编排，仅校验登录态/权限后，将请求转发到 n8n 的 SSE 接口，并将上游返回的流 **边读边写**给客户端。
  - 注意避免中间层缓冲导致“假流式”：关闭/绕开 proxy buffering、compression，正确设置 `Content-Type: text/event-stream` 与连接保活，并在客户端断开时中止上游请求。
- Phase 2（跨端增强）：为 weapp/Taro RN 提供 `chat/ws`，将 n8n 的流式输出 **转换为协议事件**（`partial/end/error`），并实现 `auth_ack/心跳/重连/失败降级轮询`。
- 配置建议：在部署 yaml 中使用 `N8N_BASE_URL`（域名/服务名优先，其次才是 IP），避免硬编码 IP 带来的多环境与变更成本。

组件替换提示：容器/列表用 View/ScrollView，输入与按钮用 Taro Input/Button，图片用 Image，事件统一 onX。

### Story 3.2: 量体与辅助数据采集

As a shopper,
I want to input measurements and basic data,
So that 诊断与推荐更准确。

**Acceptance Criteria:**

**Given** 用户输入上下胸围  
**When** 数值不在合理区间或为空  
**Then** 显示校验提示并禁止提交

**Given** 身高/体重/腰围滑块  
**When** 拖动或输入  
**Then** 状态写入 store，并在聊天/表单中保持一致（跨端同样表现）

**迁移实现要求：**

- 复用 `components/chat/MeasureGuide.tsx`, `AuxiliaryInput.tsx`, `StateComponents.tsx`, `WelcomeOptions.tsx` 的交互与校验逻辑；Taro 端确保输入事件、样式与 store 写入兼容。

### Story 3.3: 胸型与痛点选择

As a shopper,
I want to choose my chest type and pain points,
So that 诊断能考虑我的实际困扰。

**Acceptance Criteria:**

**Given** 胸型卡片列表
**When** 选择某胸型  
**Then** 卡片高亮并写入 store，可单选切换

**Given** 痛点多选网格  
**When** 勾选/取消痛点  
**Then** UI 状态同步到 store，至少可选 0..N 项，下一步按钮需有最小校验提示

**迁移实现要求：**

- 复用 `components/chat/ShapeSelection.tsx`, `SelectCard.tsx`, `PainPointGrid.tsx`, `PainPointCard.tsx` 的状态与样式；Taro 端手势/多选高亮保持一致，store 对齐。

组件替换提示：卡片/网格用 View，图标/插图用 Image，交互用 Button/Checkbox 等 Taro 兼容组件，事件 onClick/onChange。

### Story 3.4: 流式消息渲染与聊天 UI

As a shopper,
I want the chat UI to render streaming messages smoothly,
So that 我能边读边等后续内容。

**Acceptance Criteria:**

**Given** 接收 WS/SSE partial 片段  
**When** 渲染消息列表  
**Then** partial 按顺序追加、end 时合并，错误时显示提示气泡

**Given** 新消息到达  
**When** 用户未手动滚动查看历史  
**Then** 自动滚动至底部；用户上滑时不强制滚动，并显示“有新消息”

**迁移实现要求：**

- 复用 `components/chat/ChatInterface.tsx`, `StateComponents.tsx` 的 partial→end 合并与滚动策略；在 Taro 端实现等效的自动滚动与“有新消息”提示，错误气泡保持。

组件替换提示：消息容器用 ScrollView，气泡/列表项用 View/Text，状态按钮用 Button/Icon，保持 onX 事件。

### Story 3.5: 分析与报告呈现

As a shopper,
I want to see analysis progress and results,
So that 我理解诊断依据与下一步行动。

**Acceptance Criteria:**

**Given** 进入分析阶段  
**When** 后端处理未完成  
**Then** 显示进度/加载提示，不阻塞后续 partial 渲染

**Given** 收到诊断与推荐摘要  
**When** 渲染结果卡片  
**Then** 展示胸型/尺码/痛点摘要与下一步 CTA，并引用 store 中的用户输入数据

**迁移实现要求：**

- 复用 `components/chat/LoadingAnalysis.tsx`, `ProductRecommendation.tsx`, `StateComponents.tsx`；Taro 端确保占位/结果卡片渲染与数据流（store/接口响应）一致。

组件替换提示：结果卡片用 View/Text/Image，CTA 用 Button，滚动区域用 ScrollView，事件 onClick/onTap。

**现有实现参考（moon-agent）：**

- Story 3.1（通道/流式）：`lib/chat/chatProtocol.ts`, `lib/chat/sse.ts`, `lib/chat/n8nDualChannel.ts`, `app/api/chat/route.ts`, `app/chat/page.tsx`
- Story 3.2（量体/辅助）：`components/chat/MeasureGuide.tsx`, `components/chat/AuxiliaryInput.tsx`, `components/chat/StateComponents.tsx`, `components/chat/WelcomeOptions.tsx`
- Story 3.3（胸型/痛点）：`components/chat/ShapeSelection.tsx`, `components/chat/PainPointGrid.tsx`, `components/chat/PainPointCard.tsx`, `components/chat/SelectCard.tsx`
- Story 3.4（流式渲染）：`components/chat/ChatInterface.tsx`, `components/chat/StateComponents.tsx`, `components/chat/ChatInterface.test.tsx`
- Story 3.5（分析/推荐呈现）：`components/chat/LoadingAnalysis.tsx`, `components/chat/ProductRecommendation.tsx`

## Epic 4: 电商闭环：推荐 → 购物车 → 支付

### Story 4.1: 推荐列表接入

As a shopper,
I want to see recommendations aligned with my diagnosis,
So that 我能快速挑选合适的商品。

**Acceptance Criteria:**

**Given** 已有诊断/偏好数据在 store  
**When** 请求推荐接口  
**Then** 列表展示商品卡片、推荐理由标签，支持下拉刷新/分页加载

**Given** 接口返回空或错误  
**When** 渲染列表  
**Then** 显示占位/重试提示，不崩溃

复用：`components/chat/ProductRecommendation.tsx`, `components/chat/StateComponents.tsx`

### Story 4.2: SKU 选择与加购

As a shopper,
I want to choose size/spec and add to cart,
So that 我的选择被正确记录。

**Acceptance Criteria:**

**Given** 商品卡片或详情页  
**When** 选择 SKU/数量并点击加购  
**Then** cart store 更新，toast 提示成功，未选规格时给出提醒

**Given** 规格缺货  
**When** 尝试加购  
**Then** 禁用操作或提示缺货

复用：`app/cart/page.tsx`, `components/cart/*`, `lib/cart/cartApi.ts`, `lib/cart/useCart.ts`

组件替换提示：商品卡/列表用 View/Image/ScrollView，规格/数量用 Taro Picker/Input/Button，toast 用 Taro/Duxui Taro 兼容组件。

### Story 4.3: 购物车结算

As a shopper,
I want to review and submit my cart,
So that 我能在确认信息后下单。

**Acceptance Criteria:**

**Given** 购物车列表  
**When** 选择/全选商品、调整数量  
**Then** 合计金额实时更新，库存超限有提示

**Given** 进入结算流程  
**When** 确认收货地址/配送/发票信息  
**Then** 校验必填项通过后才可下单，缺失信息有明确提示

复用：`app/checkout/page.tsx`, `components/checkout/*`, `lib/order/orderApi.ts`, `lib/address/*`, `lib/cart/useCart.ts`

组件替换提示：地址/配送/发票表单用 Taro Input/Picker/Button，列表/总价用 View/Text/ScrollView，图片用 Image。

### Story 4.4: 订单创建与支付跳转

As a shopper,
I want to place the order and start payment,
So that 我能完成购买。

**Acceptance Criteria:**

**Given** 结算信息齐全  
**When** 调用下单接口  
**Then** 成功返回订单号，错误时提示原因并可重试

**Given** 下单成功  
**When** 进入支付环节  
**Then** 组装支付参数：H5 跳转/唤起 Alipay；微信预留 requestPayment 占位；Taro RN 预留 WebView/SDK 占位并记录 TODO

复用：`app/pay/submit/page.tsx`, `lib/payment/payApi.ts`, `lib/payment/useSettlement.ts`, `lib/order/orderApi.ts`

组件替换提示：表单与按钮用 Taro 组件，支付指引/状态用 View/Text/Image，必要时在小程序端用 requestPayment 占位封装。

### Story 4.5: 支付结果回传与重试

As a shopper,
I want clear payment status and retry options,
So that 我知道订单是否完成。

**Acceptance Criteria:**

**Given** 进入支付后  
**When** 轮询或接收回调  
**Then** 能区分成功/失败/取消，成功显示结果页并更新订单状态，失败可重试或返回购物车

**Given** 网络异常  
**When** 状态未知  
**Then** 提示用户检查订单详情或手动刷新状态，不出现假成功

复用：`app/pay/result/page.tsx`, `lib/payment/payApi.ts`, `lib/order/orderApi.ts`

组件替换提示：结果页用 View/Text/Image，按钮用 Button，状态列表用 ScrollView；轮询/刷新操作绑定 onX 事件。

**现有实现参考（moon-agent）：**

- Story 4.1（推荐展示）：`components/chat/ProductRecommendation.tsx`, `components/chat/StateComponents.tsx`
- Story 4.2（SKU/加购）：`app/cart/page.tsx`, `components/cart/*`, `lib/cart/cartApi.ts`, `lib/cart/useCart.ts`
- Story 4.3（结算）：`app/checkout/page.tsx`, `components/checkout/*`, `lib/order/orderApi.ts`, `lib/address/*`, `lib/cart/useCart.ts`
- Story 4.4（下单与支付）：`app/pay/submit/page.tsx`, `lib/payment/payApi.ts`, `lib/payment/useSettlement.ts`, `lib/order/orderApi.ts`
- Story 4.5（支付结果）：`app/pay/result/page.tsx`, `lib/payment/payApi.ts`, `lib/order/orderApi.ts`

## Epic 5: 用户中心与售后

### Story 5.1: 订单列表与状态

As a shopper,
I want to view my orders with statuses,
So that 我能了解当前进度。

**Acceptance Criteria:**

**Given** 登录后进入订单列表  
**When** 分页加载  
**Then** 显示订单卡片及状态标签（待支付/已支付/已取消/退款中等），空态显示提示与入口

**Given** 接口错误或超时  
**When** 列表拉取失败  
**Then** 提示重试，不影响其他页面

复用：`app/profile/orders/page.tsx`, `components/order/OrderListItem.tsx`, `components/order/OrderListSkeleton.tsx`, `lib/order/useOrders.ts`, `lib/order/orderApi.ts`

组件替换提示：订单列表/空态用 View/Text/Image，分页区块用 ScrollView，操作按钮用 Button，事件统一 onX。

### Story 5.2: 订单详情与物流

As a shopper,
I want to see order details and timeline,
So that 我能追踪支付与配送。

**Acceptance Criteria:**

**Given** 打开订单详情  
**When** 数据加载完成  
**Then** 展示商品明细、收货信息、金额、支付/配送/退款时间线，提供再次购买占位按钮

**Given** 物流信息可用  
**When** 查看物流  
**Then** 显示最新节点与时间，缺失时提示“暂无物流信息”

复用：`lib/order/orderApi.ts`（详情/状态），`components/order/OrderListItem.tsx`（时间线展示，可扩展物流）

组件替换提示：详情/时间线用 View/Text/ScrollView，节点图标/商品图用 Image，操作按钮用 Button。

### Story 5.3: 售后申请与证据上传

As a shopper,
I want to request returns or exchanges,
So that 我能解决售后问题。

**Acceptance Criteria:**

**Given** 在订单详情选择售后  
**When** 选择商品与申请类型（退货/换货）、填写原因、上传图片（Taro 上传组件跨端可用）  
**Then** 提交后创建售后单，返回申请成功提示

**Given** 必填项缺失  
**When** 提交  
**Then** 阻止提交并给出明确提示

复用：暂无现成售后页面/接口，迁移需新增；可复用订单列表入口与 `lib/order/orderApi.ts` 结构和订单展示组件

组件替换提示：售后表单用 Taro Input/Picker/Button，图片/凭证上传用小程序上传能力，提示/错误用 Taro 或 Duxui Taro 组件。

### Story 5.4: 售后进度与操作

As a shopper,
I want to track my after-sales request,
So that 我知道下一步需要做什么。

**Acceptance Criteria:**

**Given** 售后单存在  
**When** 查看售后详情  
**Then** 显示状态（审核中/待寄回/退款中/完成）、金额、客服说明，必要时显示补充信息或撤销入口

**Given** 售后状态变化  
**When** 进入详情或刷新  
**Then** 同步最新节点，失败时提示重试

复用：同上，需新增售后模块；入口可用订单列表/详情，接口与状态展示可沿用 `lib/order/orderApi.ts` 风格

组件替换提示：状态流用 View/ScrollView，操作按钮 Button，提示用 Text/Image，事件 onClick/onChange。

### Story 5.5: 地址管理与资料同步

As a shopper,
I want to manage addresses and synced profile,
So that 下单时可直接使用并保持资料一致。

**Acceptance Criteria:**

**Given** 地址列表  
**When** 新增/编辑/删除/设默认  
**Then** 变化即时生效并同步到下单流程，缺少必填字段时给出提示

**Given** 登录后  
**When** 进入 profile/设置页面  
**Then** 显示同步的基础资料/诊断结果，允许刷新并在跨端保持一致

复用：`app/profile/addresses/*`, `components/address/*`, `lib/address/*`, `app/profile/settings/*`, `lib/profile/*`

组件替换提示：地址/资料表单用 Taro Input/Picker/Button，列表用 View/ScrollView，头像/图标用 Image。

**现有实现参考（moon-agent）：**

- Story 5.1（订单列表/状态）：`app/profile/orders/page.tsx`, `components/order/OrderListItem.tsx`, `components/order/OrderListSkeleton.tsx`, `lib/order/useOrders.ts`, `lib/order/orderApi.ts`
- Story 5.2（订单明细/物流）：`lib/order/orderApi.ts`（订单详情接口），`components/order/OrderListItem.tsx`（时间线/状态，可扩展物流节点）
- Story 5.3/5.4（售后）：暂无现成售后页面/接口，需迁移时新增；可复用订单列表作为入口、`lib/order/orderApi.ts` 结构与状态展示组件
- Story 5.5（地址/资料同步）：`app/profile/addresses/*`, `components/address/*`, `lib/address/*`, `app/profile/settings/*`, `lib/profile/*`

## Epic 6: 上线与质量保障

### Story 6.1: H5 单测与集成基线

As a developer,
I want automated tests for H5,
So that 核心流程在改动后可回归。

**Acceptance Criteria:**

**Given** 配置 vitest + RTL  
**When** 运行测试  
**Then** 关键 hooks/组件（auth/chat/cart 等）有用例且通过，移除 Next 依赖的 mocks（navigation/image 等）

**Given** 新增用例  
**When** 覆盖率统计  
**Then** 基线覆盖率达团队约定（可记录阈值），失败时 CI 报警

复用：`vitest.config.ts`, `vitest.setup.ts`, `app/chat/page.test.tsx`, `app/layout.test.ts`, `app/page.test.tsx`, `app/checkout/page.test.tsx`, `app/profile/orders/page.test.tsx`, `components/cart/*.test.tsx`, `components/checkout/*.test.tsx`, `components/chat/*.test.tsx`, `components/order/OrderListItem.test.tsx`

### Story 6.2: 微信端集成/e2e

As a QA,
I want automated checks on WeChat mini program,
So that 核心路径在真机/模拟器可验证。

**Acceptance Criteria:**

**Given** 配置 miniprogram-automator 或同类脚本  
**When** 运行用例（登录 → 聊天 → 加购 → 结算前）  
**Then** 用例通过并产出截图/日志，失败有清晰错误

复用：当前无小程序脚本；可参考 H5 用例结构与 `test/` 目录，迁移时新增 miniprogram-automator 脚本

### Story 6.3: Taro RN 测试基线

As a QA,
I want RN-side tests to run,
So that RN 目标有最小保障。

**Acceptance Criteria:**

**Given** 配置 Jest + react-native-testing-library  
**When** 运行样例用例（至少 1-2 个组件/屏）  
**Then** 测试通过，RN 特定依赖已 mock，CI 可执行

复用：暂无 RN 用例/配置，需新建 Jest + RNTL 基线（可参考 H5 测试结构）

### Story 6.4: CI 分渠道构建与产物

As a release manager,
I want channel-specific builds,
So that 我能输出 H5/微信/RN 可用产物。

**Acceptance Criteria:**

**Given** CI 配置  
**When** 触发 pipeline  
**Then** 执行 H5/weapp/rn 构建命令，产物按 `dist/${TARO_ENV}` 输出并上传/归档

**Given** 代理与域名配置  
**When** 构建前检查  
**Then** 校验 TARO_APP_API_BASE 等必填环境变量与白名单，缺失时报错中断

复用：`package.json` 构建/测试脚本，`Dockerfile`, `tailwind.config.ts`, `next.config.mjs`, `scripts/test-supabase.js`

### Story 6.5: 环境与密钥管理

As an operator,
I want environment templates and secret handling,
So that 配置安全且可复现。

**Acceptance Criteria:**

**Given** 提供 .env.[mode] 模板（含 TARO_APP_API_BASE、WS 域、图片域等）  
**When** 新人按模板配置  
**Then** 能成功运行三端开发/构建

**Given** 白名单/域名校验脚本  
**When** 校验  
**Then** 确保图片/WS/支付域满足微信与 H5 要求；敏感变量不提交到仓库

复用：目前无 .env 模板需新增；可参考 `next.config.mjs` 中的域名/代理配置

**现有实现参考（moon-agent）：**

- Story 6.1（H5 测试）：`vitest.config.ts`, `vitest.setup.ts`, `app/chat/page.test.tsx`, `app/layout.test.ts`, `app/page.test.tsx`, `app/checkout/page.test.tsx`, `app/profile/orders/page.test.tsx`, `components/cart/*.test.tsx`, `components/checkout/*.test.tsx`, `components/chat/*.test.tsx`, `components/order/OrderListItem.test.tsx`
- Story 6.2（微信 e2e）：当前无小程序脚本；可参考现有 H5 用例结构与 `test/` 目录，迁移时新增 miniprogram-automator 脚本
- Story 6.3（RN 测试）：暂无 RN 用例/配置，需新建 Jest+RNTL 基线
- Story 6.4（CI/产物）：`package.json` 构建/测试脚本，`Dockerfile`, `tailwind.config.ts`, `next.config.mjs`, `scripts/test-supabase.js`
- Story 6.5（环境/密钥）：目前无 .env 模板需新增；可参考 `next.config.mjs` 中的域名/代理配置

## Epic 7: UI/UX 迁移对齐（H5 + Weapp，1:1 复刻 moon-agent）

> 目标：在不改变业务逻辑与接口语义的前提下，把 `moon-agent`（Next.js）的页面结构、布局与关键交互，迁移到 `moon_agent_taro`（Taro H5/Weapp）并做到尽量一致。
>
> 范围优先级：Auth → Chat → Cart → Checkout → Profile/Address/Order → Pay。

### Story 7.1: Auth UI/UX 对齐（登录/注册/欢迎）

As a user,
I want the auth pages to look and behave the same across H5/weapp,
So that 我能无学习成本完成登录与进入主流程。

**Acceptance Criteria:**

**Given** 登录/注册/欢迎页已迁移到 Taro Page  
**When** 我在 H5 与 weapp 打开对应页面  
**Then** 布局层级（标题/表单/按钮/辅助入口）、间距/字体/颜色、以及错误提示/禁用态/加载态与 `moon-agent` 保持一致（允许平台差异导致的最小偏差）

**Given** 表单校验（手机号/密码/验证码）  
**When** 输入非法值或提交失败  
**Then** 错误文案位置、样式、与交互（如自动聚焦、Toast/Inline error）与 `moon-agent` 一致，且不会引入新的鉴权逻辑变更

### Story 7.2: Chat UI/UX 对齐（对话列表/输入区/消息气泡）

As a shopper,
I want chat UI to be consistent with the existing product,
So that 我能快速理解消息流、输入与状态反馈。

**Acceptance Criteria:**

**Given** 聊天页面在 H5/weapp 可用  
**When** 消息流式输出 / 断线重连 / 降级提示发生  
**Then** 消息列表滚动行为、气泡样式、loading/typing 状态、错误与重试入口的交互与 `moon-agent` 对齐

**Given** 输入区（多行、发送按钮、禁用态）  
**When** 我输入/发送/撤销输入  
**Then** 输入体验（键盘弹起不遮挡、按钮状态、发送后清空）与 `moon-agent` 尽量一致

### Story 7.3: Cart UI/UX 对齐（购物车列表/数量调整/总价区）

As a shopper,
I want cart UI to match the existing experience,
So that 我能清晰管理商品与价格。

**Acceptance Criteria:**

**Given** 购物车页面已迁移  
**When** 我增减数量、删除、查看价格汇总  
**Then** 列表结构、交互控件（Stepper/按钮）、空态/错误态/加载态、与视觉 token 在 H5/weapp 与 `moon-agent` 对齐

### Story 7.4: Checkout UI/UX 对齐（地址/配送/提交订单）

As a shopper,
I want checkout UI to be predictable and consistent,
So that 我能顺畅完成下单。

**Acceptance Criteria:**

**Given** 结算页包含地址选择、商品确认、费用汇总与提交按钮  
**When** 我切换地址/修改备注/提交订单  
**Then** 表单区块顺序、校验提示、提交 loading/禁用态、失败后的错误呈现与 `moon-agent` 对齐

### Story 7.5: Profile/Address/Order UI/UX 对齐（个人中心/地址簿/订单列表）

As a user,
I want profile-related pages to feel the same,
So that 我能快速管理个人信息与订单。

**Acceptance Criteria:**

**Given** 个人中心入口与信息展示完成迁移  
**When** 我查看/编辑信息、管理地址、浏览订单  
**Then** 页面信息架构、列表/卡片样式、空态/错误态、以及关键操作按钮的交互与 `moon-agent` 对齐

### Story 7.6: Pay UI/UX 对齐（支付方式/确认/结果页）

As a shopper,
I want payment UI to be consistent and reassuring,
So that 我能明确知道支付状态与下一步。

**Acceptance Criteria:**

**Given** 支付页与支付结果页完成迁移  
**When** 我选择支付方式、发起支付、支付成功/失败/取消  
**Then** 状态反馈（loading/success/fail）、结果页文案与按钮入口、以及视觉样式与 `moon-agent` 对齐

**现有实现参考（moon-agent）：**

- Story 7.1: `app/(auth)/*`, `components/auth/*`, `lib/auth/*`
- Story 7.2: `app/chat/*`, `components/chat/*`, `lib/chat/*`
- Story 7.3: `app/cart/*`, `components/cart/*`, `lib/cart/*`
- Story 7.4: `app/checkout/*`, `components/checkout/*`, `lib/order/*`, `lib/address/*`
- Story 7.5: `app/profile/*`, `components/profile/*`, `components/address/*`, `components/order/*`, `lib/profile/*`, `lib/address/*`, `lib/order/*`
- Story 7.6: `app/pay/*`, `components/order/*`, `lib/payment/*`
