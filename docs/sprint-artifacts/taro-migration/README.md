# Taro 迁移与多端计划

## 背景与目标

- 现有 Next.js 应用需迁移到 Taro 4 + React，以同时支持 H5、微信小程序，并通过 Taro RN 目标产物覆盖 RN 端（不单独新建独立 RN 应用）。
- 统一技术栈：React + TypeScript，状态/数据层保留 TanStack Query、Zustand、Zod；UI 采用 Duxui，样式通过 Tailwind（h5 和 RN 用 tailwindcss，微信小程序用 weapp-tailwindcss@4）和全局主题变量。
- 核心方向：路由改造（tabBar + 非 tab 页）、鉴权与存储抽象、API 适配（Taro.request/axios）、聊天通道（H5 流式；小程序/RN 用 WebSocket 或轮询兜底）。

## 架构与约束

- Monorepo 建议：`packages/core`（api/schemas/hooks/stores/util）、`apps/taro`（单一 Taro 工程，产出 H5 + 微信 + Taro RN）。
- UI：Duxui（React，Taro4，多端兼容，包括 Taro RN）；如需 Vant 风格可替换为 Taroify/@antmjs/vantui（需评估 Taro RN 适配或自定义适配）。
- 样式：Tailwind 与全局 CSS 变量迁移；保留渐变/圆角/阴影等 token。
- 网络：H5 走 fetch/axios；微信端用 axios Taro 适配或 taro-fetch-ponyfill（非必选）；Taro RN 目标通过 axios + Taro RN 环境适配。
- 流式聊天：H5 继续 fetch+ReadableStream；小程序/Taro RN 使用 WebSocket（首选）或轮询。
- Vite 作为编译工具

## 里程碑（建议顺序）

1. 项目初始化：Taro4 + Duxui + Tailwind；配置 tabBar/pages、devServer 代理、远程图片域。
2. 核心逻辑抽象：提炼 `packages/core`（api、schemas、stores、hooks、常量、utils），通过平台适配层暴露。
3. 鉴权与存储：封装 authClient（登录/短信/刷新/登出）；token 策略 = accessToken 内存持有、refreshToken 依赖 httpOnly Cookie（需后端支持）；Storage 抽象仅存放必要用户态数据（非令牌），路由守卫。
4. API 适配：axios + 适配器（Taro.request、Taro RN 适配）；统一 headers/tenant/token；配置 `/app-api` 代理，默认携带 credentials 以使用 httpOnly Cookie。
5. UI 与页面迁移：auth 流程 → chat/cart/profile tab 页 → 其他页面（checkout、pay、addresses、orders、settings 等）；替换 next/navigation/link/image/font。
6. 聊天通道改造：接入 WebSocket（含心跳/重连/鉴权），H5 保留流式；若 WS 未就绪，先落地轮询兜底。Websocket 接口移至 payment_interface 项目中，并更新前端接口
7. 样式与主题校准：迁移全局变量、渐变、阴影、玻璃态等；校正组件尺寸/交互。
8. 测试与验收：H5 单测/集成，微信真机回归，Taro RN 目标预检（后续真机）；补充 mocks。

## 任务拆解（Backlog）

- 脚手架与配置
  - 创建 `moon_agent_taro`，接入 Taro4 + React + TS + Tailwind + Duxui。
  - 配置 tabBar（/chat, /cart, /profile）与 pages；devServer 代理 `/app-api`。
  - 远程图片域/URLCheck 白名单；环境变量改为 `.env.[mode]`（如 TARO_APP_API_BASE）。
- 核心共享层
  - 抽取 `packages/core`：apiClient、schemas（zod）、stores（zustand）、hooks（useAuth/useCart/useChat...）、utils。
  - 平台适配接口：Storage、Router、Request（axios/Taro/Taro RN）、Image 适配（占位与尺寸处理）。
- 鉴权
  - authClient：密码登录、短信登录、刷新、登出；token 策略 = accessToken 仅存内存，refreshToken 依赖 httpOnly Cookie（需跨域/域名策略配合）；统一处理 token 注入与过期刷新。
  - Storage 抽象实现多端（不存 token，仅存必要用户资料等）；路由守卫（小程序 onShow/H5 路由/Taro RN navigation middleware）。
  - 登录/注册/欢迎页重定向规则复刻（auth 页与受保护页），请求默认 `withCredentials: true` 以携带 refresh cookie。
- API 与网络
  - axios 适配器：H5 默认、微信 Taro.request、Taro RN 适配；统一 headers/tenant/token；默认开启 `withCredentials` 以使用 refresh httpOnly Cookie。
  - 错误码与重试策略；全局 toast/错误提示迁移至 Duxui 组件或自定义。
- 聊天通道
  - 方案：WebSocket 优先；设计消息协议（鉴权、心跳、消息、错误）。
  - H5：保留 fetch 流式；与 WS 客户端共存。
  - 微信/Taro RN：实现 WS 客户端；若后端暂不可用，落地轮询兜底。
- UI 迁移
  - 替换 Radix/shadcn 组件为 Duxui：Button/Input/Switch/Slider/Dialog/Toast 等。
  - BottomNav → Taro tabBar + Duxui Icon；ChatHeader 自定义。
  - 表单保留 react-hook-form + zod，字段组件换 Duxui。
  - 图片：next/image → Taro Image / Taro RN Image；字体：移除 next/font，改用 @font-face 或系统字体。
- 样式/动画
  - 迁移全局 CSS 变量、渐变、阴影、玻璃态、slider 特效；检查小程序/Taro RN 兼容性（伪元素/滤镜需改写）。
  - Tailwind content 范围指向 `src/**/*.{ts,tsx}`；保留工具类。
- 测试
  - H5：更新 vitest/RTL mocks（去除 next/navigation/image）；关键 hooks 单测。
  - 微信：补充 e2e/集成（如 miniprogram-automator）。
  - Taro RN：预留 jest + react-native-testing-library（按 Taro RN 目标验证）。
- 交付与运维
  - 构建配置（H5 静态、小程序上传、Taro RN 目标打包）；CI 产物分渠道。
  - 环境与密钥管理：TARO*APP*\* 变量，多端兼容。

## WebSocket 统一协议（草案）

- 端点：`wss(s)://<domain>/app-api/chat/ws?sessionId=<id>`；Header 优先 `Authorization: Bearer <accessToken>`，如小程序 Header 受限可备用 query `token=<accessToken>`；域名需在小程序 WS 白名单，使用 wss。
- 握手：校验 accessToken 与会话禁用逻辑（原 `app/api/chat/route.ts`），失败关闭 4001/4003，成功后推送 `{"type":"auth_ack"}`。
- 客户端消息：`{"type":"chat","sessionId":"...","messageId":"uuid","text":"...","metadata":{...}}`。
- 服务端推送：
  - `partial`: `{"type":"partial","messageId":"...","delta":"..."}`
  - `end`: `{"type":"end","messageId":"...","text":"完整文本","finishReason":"stop"}`
  - `error`: `{"type":"error","code":"...","message":"..."}`
- 心跳：客户端每 20-30s 发送 `ping`，服务端回 `pong`；超时关闭 4008。
- 限流/并发：可限制每用户并发连接与 QPS，违规关闭 429/401。
- 转发：后端 WS 代理将请求转发到 n8n/LLM，保持流式，按 `partial/end` 回传。
- 前端待办：Taro 使用 `Taro.connectSocket`（带 header/query token），实现自动重连、心跳、超时降级（必要时轮询）。

## 跨端一致性策略与检查清单

- 平台分支最小化：仅在必要处使用 `process.env.TARO_ENV` 分支，默认逻辑保持跨端通用。
- 多端文件后缀：对不可避免的差异使用 `*.h5.ts` / `*.weapp.ts` / `*.rn.ts`，保持 import 路径不变。
- 输出目录隔离：`outputRoot: dist/${process.env.TARO_ENV}` 便于多端并行调试，避免产物覆盖。
- 资源白名单：远程域名/WS 域名/字体/图片需列入微信白名单；RN 侧用本地或 HTTPS 资源；H5 遵守 CORS。
- UI 组件：优先 Duxui 跨端组件；避免原生小程序组件（会削弱跨端）；必要时局部后缀文件隔离。
- 样式兼容：减少依赖滤镜/伪元素等特定特性；若需使用，为 weapp/rn 提供降级样式或平台后缀文件。
- 路由导航：统一 Taro 路由 API；平台特有行为用小范围分支。
- 网络/鉴权：请求适配层封装（H5 axios/fetch，weapp Taro.request，Taro RN axios 适配），默认 `withCredentials`；WS 用 `Taro.connectSocket`，心跳+重连。
- 第三方/原生能力：通过适配层暴露，不在业务中直接调用原生 API；能力检测放在适配层实现。
- 构建与命令：单项目多命令出 H5/weapp/rn 产物；确保 `mini/h5/rn` 配置到位。
- 同步调试：分端输出目录 + 平台后缀文件，避免多端联调时相互干扰。

## 风险与决策

- 聊天流式：小程序不支持 SSE，需 WebSocket 或轮询；需后端提供 WS 端点或网关转换。
- UI 兼容性：Radix/shadcn 不跨端，已选 Duxui；若改用 Vant 体系，需兼顾 Taro RN 适配。
- 样式差异：滤镜/伪元素在小程序/Taro RN 可能受限，需要替代实现。
- 网络差异：Taro.request 与 axios 在拦截器、错误码处理上存在差异，需统一封装。
- 远程资源：图片域名白名单、字体加载在小程序/Taro RN 可能受限，需要本地化或 CDN。
- Cookie 支持差异：refreshToken 依赖 httpOnly Cookie，需验证微信小程序/Taro RN 的 Cookie 支持、withCredentials 行为与跨域域名策略。

## 开放问题

- WebSocket 服务端是否可提供/何时可用？若暂不可用，轮询允许的频率/延迟要求？
- Taro RN 目标上线时点与优先级？是否需要提前定义 RN UI 方案（Duxui vs 原生组件封装）。
- 现有埋点/监控需求是否需要在小程序/Taro RN 同步？
- 服务端是否已开启 refreshToken httpOnly Cookie（域名、SameSite、安全策略）？微信/Taro RN 对 Cookie 的支持程度、跨域策略需确认。

## 验收与测试范围

- 功能：auth 流程、聊天收发（WS/兜底）、购物车/结算/地址/订单/支付提交流程在 H5 与微信端跑通。
- 性能/体验：WS 稳定性、重连与心跳；图片加载与骨架屏；tabBar 与导航交互一致。
- 兼容：微信真机/不同网络；H5 主流浏览器；Taro RN 目标预检。

## 最小版本项目结构域解释

```
├── babel.config.js             # Babel 配置
├── .eslintrc.js                # ESLint 配置
├── config                      # 编译配置目录
│   ├── dev.js                  # 开发模式配置
│   ├── index.js                # 默认配置
│   └── prod.js                 # 生产模式配置
├── package.json                # Node.js manifest
├── dist                        # 打包目录
├── project.config.json         # 小程序项目配置
├── src # 源码目录
│   ├── app.config.js           # 全局配置
│   ├── app.css                 # 全局 CSS
│   ├── app.js                  # 入口组件
│   ├── index.html              # H5 入口 HTML
│   └── pages                   # 页面组件
│       └── index
│           ├── index.config.js # 页面配置
│           ├── index.css       # 页面 CSS
│           └── index.jsx       # 页面组件，如果是 Vue 项目，此文件为 index.vue
```
