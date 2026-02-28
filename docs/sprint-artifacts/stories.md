# Epic 1: 基础设施与核心数据层搭建 (Foundation & Core Data Layer)

**Epic 目标**: 搭建基于 Next.js + Supabase + n8n 的全栈基础环境，确立 UI 设计系统，并集成微信登录与用户权限体系。

---

### Story 1.1: Next.js 项目初始化与 UI 主题配置

**用户故事**:
作为一名 **开发人员**，
我想要 **初始化 Next.js 项目并配置 Shadcn/UI 主题**，
以便 **在后续开发中直接使用统一的组件库和配色方案，无需重复造轮子**。

**验收标准 (Acceptance Criteria)**:

- **Given** 开发环境已安装 Node.js 和 Git。
- **When** 运行初始化命令并启动项目。
- **Then** Next.js 14+ (App Router) 项目成功运行在本地端口。
- **And** Tailwind CSS 配置生效。
- **And** Shadcn/UI 已安装并配置了基础组件（Button, Card, Input）。
- **And** `globals.css` 中已定义 **UX.md** 规定的颜色变量：
  - **主色 (Primary)**: `#8B5CF6` (Main Purple), `#7C3AED` (Hover/Dark Purple)。
    - **辅助色 (Secondary)**: `#EC4899` (Bright Pink) 用于数据强调和女性化元素。
    - **文字颜色**: 主文字 `#1F2937` (Dark Gray), 次要文字 `#6B7280`。
    - **背景色**: 定义渐变变量 `bg-page-gradient` 为 `from-[#FFF5F7] to-[#FAF5FF]`。
  - **And** 定义功能色：
    - **Error/Destructive**: `#D4183D` (Red)。
    - **Success**: `green-500`。
- **And** 字体配置为 Inter 或 System UI。

**技术实现 (Technical Notes)**:

- 参考 `architecture.md`：使用 `npx create-next-app@latest moon-agent`。
- 安装依赖：`lucide-react` (图标), `clsx`, `tailwind-merge`。
- 配置 Shadcn `components.json` 以匹配 CSS 变量。
- 配置 `tailwind.config.ts` 的 `extend.colors`，添加自定义品牌色名（如 `moon-purple`, `moon-pink`）。
- 设置默认页面背景为 `bg-gradient-to-br from-[#FFF5F7] to-[#FAF5FF]`。

---

### Story 1.2: Supabase 数据库表结构设计与部署

**用户故事**:
作为一名 **后端开发人员**，
我想要 **在 Supabase 中创建 Users, Products 和 Chat Sessions 表**，
以便 **持久化存储用户画像、商品信息和对话历史，支持推荐算法运行**。

**验收标准 (Acceptance Criteria)**:

- **Given** 拥有 Supabase 项目访问权限。
- **When** 执行 SQL 建表脚本。
- **Then** `products` 表创建成功，包含字段：`id`, `name`, `price`, `stock_status`, `size_available` (JSONB), `suitable_shapes` (Array), `tags` (Array)。
- **And** `users` 表创建成功，包含字段：`measurements` (JSONB), `body_shape`, `pain_points` (Array)。
- **And** `chat_sessions` 表创建成功，用于存储对话上下文。
- **And** 简单的 RLS (Row Level Security) 策略已启用（如：允许公开读取商品，仅用户本人读写自己的数据）。

**技术实现 (Technical Notes)**:

- 参考 `architecture.md`：核心选品逻辑依赖 SQL，因此 `products` 表结构必须严格匹配。
- 使用 Supabase SQL Editor 或 Migration 文件管理。
- 手动录入或编写脚本插入 3-5 条测试商品数据（覆盖不同胸型），用于后续测试。

---

### Story 1.3: BFF 层 API Route 与 n8n 连通性实现 (已更新协议)

**用户故事**:
作为一名 **全栈开发人员**，
我想要 **实现 Next.js 的 BFF 接口并处理 n8n 的流式响应协议**，
以便 **前端能实时接收文字，并根据隐藏的 State 指令渲染特定 UI 组件**。

**验收标准 (Acceptance Criteria)**:

- **Given** n8n 配置为返回流式响应 (Streaming Response)。
- **When** 前端请求 `/api/chat`。
- **Then** 后端能正确转发 n8n 的 ReadableStream。
- **And** **协议解析 (Protocol Parsing)**: 前端能识别并分离响应中的 `<STATE>` 标签。
  - 示例输入: `<STATE>{"step":"size_input"}</STATE>宝贝，撑撑姐教你先测量...`
  - 解析结果:
    - **State**: `{"step":"size_input"}` (用于触发 UI)。
    - **Text**: `宝贝，撑撑姐教你先测量...` (用于打字机显示)。
- **And** `<STATE>` 标签内容在对话气泡中 **不可见**。

**技术实现 (Technical Notes)**:

- **Regex 解析**: 使用正则表达式 `/<STATE>(.*?)<\/STATE>/s` 提取 JSON 数据。
- **流式处理**: 建议使用 `ai` SDK (Vercel AI SDK) 的 `StreamingTextResponse` 或原生 `fetch` reader 处理流，确保在接收到 `</STATE>` 闭合标签的瞬间立即触发 UI 状态更新，不必等待整个流结束。

---

### Story 1.4: 全新移动端布局与底部导航集成

**用户故事**:
作为一名 **前端开发人员**，
我想要 **根据新的 Figma 设计稿实现包含底部导航栏的移动端布局**，
以便 **用户可以在聊天、购物车和个人中心之间快速切换**。

**验收标准 (Acceptance Criteria)**:

- **Given** 项目已初始化。
- **When** 在手机浏览器打开页面。
- **Then** 视口 (Viewport) 设置正确，禁止用户缩放 (`user-scalable=no`)。
- **And** 页面背景色为 `bg-gradient-to-b from-[#FFF5F7] to-[#FAF5FF]`。
- **And** 实现 **BottomNav** 组件，包含三个入口：
  - **聊天 (Chat)**: 默认入口，点击进入智能对话。
  - **购物车 (Cart)**: 点击进入购物车页面。
  - **我的 (User)**: 点击进入个人中心页面。
- **And** 导航栏选中状态使用背景颜色 `#FAF5FF` 和紫色图标强调（Figma 152:54）。
- **And** 顶部导航栏 (ChatHeader) 更新为白色背景，阴影效果，文字为紫色 `#8B5CF6`(需要注意他们的角的弧度)。

**技术实现 (Technical Notes)**:

- 修改 `app/layout.tsx`，将 `BottomNav` 放入根布局。
- 使用 `next/navigation` 的 `usePathname` 实现选中状态切换。
- **Figma 引用**: 节点 ID `152:21` (Chat Page), `152:54` (BottomNav)。

---

### Story 1.5: 登录与注册全流程开发 (包含欢迎页、手机登录与注册)

**用户故事**:
作为一名 **未登录用户**，
我想要 **通过欢迎页引导进入手机号登录或注册流程**，
以便 **我能快速创建或进入我的账户，同步我的测量数据和购物车**。

**验收标准 (Acceptance Criteria)**:

- **欢迎页 (Welcome Page)** (Figma 162:85):

  - **Given** 用户未登录且首次进入。
  - **Then** 展示背景图 (`/assets/statics/Screenshot 2025-12-25 at 21.54.23.png`)。
  - **And** 提供“微信一键登录”按钮（绿色 `#07c160`，暂不可点击）。
  - **And** 提供“手机号码登录”按钮（半透明白色背景）。
  - **And** 底部显示“用户协议”和“隐私政策”链接。

- **手机登录页 (Login Page)** (Figma 163:178):

  - **When** 用户在欢迎页点击“手机号码登录”。
  - **Then** 进入带有毛玻璃背景的登录卡片。
  - **And** 包含“手机号码”和“密码”输入框。
  - **And** 点击紫色“登录”按钮 (`#8B5CF6`) 执行登录逻辑。
  - **And** 底部有“立即注册”链接，点击跳转至注册页。

- **注册页 (Register Page)** (Figma 163:228):

  - **When** 用户点击“立即注册”。
  - **Then** 进入注册卡片。
  - **And** 包含“手机号码”和“验证码”输入框。
  - **And** “获取验证码”按钮样式匹配设计稿。
  - **And** 点击粉色“注册并登录”按钮 (`#EC4899`) 执行注册逻辑。
  - **And** 底部有“去登录”链接，点击跳转回登录页。

- **通用逻辑**:
  - **And** 登录成功后，前端存储 JWT Token 并自动重定向。
  - **And** 视口禁止缩放。

**技术实现 (Technical Notes)**:

- **认证中间件 (NextAuth)**:
  - 采用 **NextAuth.js (Auth.js)** 作为中间层管理 Session，将 Token 加密存储在 **HttpOnly Session Cookie** 中。
- **API 通信 (Native Fetch)**:
  - 全面弃用 Axios，改用基于原生 `fetch` 封装的 `lib/api.ts`。
  - **React Query 状态同步**: 推荐使用 `@tanstack/react-query` 的 `useMutation` 钩子处理登录、注册和验证码请求，以统一管理 loading 和错误反馈。
- **登录接口**: `POST /app-api/member/auth/login` (手机号+密码) 或 `POST /app-api/member/auth/sms-login` (手机号+验证码)。
- **发送验证码**: `POST /app-api/member/auth/send-sms-code` (参数: `mobile`, `scene: 1`) -- 暂时不需要。
- **背景处理**: 使用 `backdrop-blur-[5px]` 实现设计稿中的毛玻璃效果。
- **Figma 引用**: `162:85`, `163:178`, `163:228`。

---

# Epic 2: 沉浸式对话与测量引导 (Immersive Chat & Measurement Flow)

**Epic 目标**: 构建核心对话界面，确立“满月”的闺蜜人设，并通过高质量的视觉引导帮助用户完成准确的身体数据输入。

---

### Story 2.1: 聊天界面与“满月”人设破冰

**用户故事**:
作为一名 **用户**，
我想要 **在一个色调柔和、充满安全感的界面中与“满月”对话**，
以便 **感受到亲切的引导，消除紧张感**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户首次进入应用。
- **When** 页面加载完成。
- **Then** 页面背景显示为 **粉紫渐变 (from-[#FFF5F7] to-[#FAF5FF])**。
- **And** 用户的消息气泡使用 **品牌紫粉渐变 (from-[#8B5CF6] to-[#EC4899])**，文字为白色。
- **And** “满月”的回复气泡使用纯白 `#FFFFFF`，文字为深灰 `#1F2937`。
- **And** 底部操作按钮 (CTA) 默认状态为 `#8B5CF6`，Hover 状态变为 `#7C3AED`。

* **Given** 用户进入对话。
* **When** 收到 n8n 响应 `<STATE>{"step":"welcome"}</STATE>来啦宝宝...`。
* **Then** 界面 **流式打印** “来啦宝宝...” 文本。
* **And** 在文本打印完毕或 State 解析完成后，在气泡下方 **渲染** 预设回复按钮 (Button Group)。
* **And** 状态 `step: "welcome"` 对应渲染组件 `WelcomeOptions`。

**技术实现 (Technical Notes)**:

- **UI 组件**: 开发 `ChatInterface` 组件，使用 `Framer Motion` 实现气泡弹出的平滑动画。
- **状态管理**: 使用 Zustand 存储 `messages` 数组。
- **数据存储**: 每次对话记录需异步同步到 Supabase `chat_messages` 表。

---

### Story 2.2: 测量引导组件 (3D 动画集成)

### Story 2.2: 测量引导组件 (3D 动画集成) (已更新协议)

**用户故事**:
作为一名 **不确定自己尺码的用户**，
我想要 **在“满月”说完引导语后，自动弹出测量工具**，
以便 **我可以一边看动画一边输入数据**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户同意测量。
- **When** n8n 返回 `<STATE>{"step":"size_input"}</STATE>宝贝，撑撑姐教你先测量...`。
- **Then** 检测到 `step: "size_input"` 时，立即渲染 **测量引导卡片 (MeasureGuide Card)**。
- **And** 卡片包含 3D 演示动画和数字输入框。
- **And** 胸围差使用 **亮粉色 `#EC4899`** 进行强调。

**技术实现 (Technical Notes)**:

- **资产优化**: 使用 `<Image unoptimized />` 加载 GIF 或 WebP 格式的 3D 演示序列。
- **交互逻辑**: 步骤条模式，自动或点击切换上下围输入。

---

### Story 2.3: 辅助数据采集 (身高/体重滑块)

**用户故事**:
作为一名 **用户**，
我想要 **通过顺滑的方式输入身高、体重和腰围**，
以便 **算法能判断我是圆身还是扁身，从而修正底围建议**。

**验收标准 (Acceptance Criteria)**:

- **Given** 核心尺码测量完成。
- **When** “满月”询问辅助信息时。
- **Then** 底部弹出 BMI 输入面板。
- **And** 身高和体重使用 **水平滑块 (Sliders)** 控件。
- **And** 滑块轨道 (Track) 使用浅紫 `purple-200`。
- **And** 滑块填充条 (Range) 和 滑块拇指 (Thumb) 使用 **主紫色 `#8B5CF6`**。
- **And** 确认后自动提交给 n8n 进行处理。

**技术实现 (Technical Notes)**:

- **UI 组件**: 使用 Shadcn/UI 的 `Slider` 组件进行定制。
- **数据校验**: 设置合理的最大/最小值范围（如身高 140-200cm）。

---

### Story 2.4: n8n 意图识别与参数提取

**用户故事**:
作为一名 **系统设计者**，
我想要 **n8n 能够自动从用户的自然语言对话中提取结构化数据 (JSON)**，
以便 **无论用户是直接输入“88 73”还是通过引导流程输入，系统都能获取标准化的数据**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户在前端发送包含数据的消息（如“上围 88，下围 73” 或通过表单提交的 JSON 字符串）。
- **When** 消息通过 API Route 传送到 n8n。
- **Then** n8n 的 LLM Chain 能够识别这是“提供身体数据”的意图。
- **And** n8n 能够提取出 `{ "upper_bust": 88, "under_bust": 73 }` 等关键参数。
- **And** 提取的数据被更新到 Supabase `users` 表的对应记录中。
- **And** 如果数据缺失或异常（如上围小于下围），n8n 返回相应的追问话术。

**技术实现 (Technical Notes)**:

- **n8n 节点**: Webhook -> AI Agent (Function Calling / Structured Output) -> Supabase Update -> Response。
- **Prompt**: 在 n8n 的 System Prompt 中定义提取规则，强调对数字的敏感度。

---

### Story 2.5: Zustand 状态持久化 (会话记录跨页面保持)

**用户故事**:
作为一名 **用户**，
我想要 **在切换到购物车或个人中心后返回聊天界面时，看到之前的对话记录**，
以便 **我不需要重新开始对话，保持流畅的购物体验**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户已经与“满月”进行了部分对话。
- **When** 用户点击底部导航栏跳转到“购物车”或“我的”页面。
- **And** 用户再次点击“聊天”返回。
- **Then** 聊天气泡列表应完整保留，无需重新加载。
- **And** 即使刷新浏览器页面，会话记录在当前 Session 内依然存在。
- **And** 持久化内容应包括：消息列表 (`messages`)、当前诊断状态 (`currentState`) 及已输入的身体数据。

**技术实现 (Technical Notes)**:

- **中间件使用**: 使用 Zustand 的 `persist` 中间件。
- **存储介质**: 默认使用 `sessionStorage` 以实现刷新不丢失（限当前会话）。
- **Key 定义**: `moon-chat-storage`。
- **白名单过滤**: 在 `partialize` 中配置仅持久化必要的业务数据（`messages`, `currentState`, `measurementData` 等），避免持久化 UI 状态（如 `isTyping`）。
- **Hydration 处理**: 在 Next.js 环境下，需确保 Zustand Store 在读取 sessionStorage 完成（Hydrated）后再执行初始化逻辑，避免因初始状态为空而重复触发欢迎语。

---

### Story 2.6: 全局流式对话管理与背景追更 (Global Streaming Management & Background Updates)

**用户故事**:
作为一名 **用户**，
我想要 **在切换到购物车或个人中心时，聊天对话依然能在后台继续接收**，
以便 **我返回聊天界面时，能够看到完整的建议，而不会因为页面切换导致连接中断或报错**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户正在与“满月”进行流式对话。
- **When** 用户点击底部导航栏跳转到其他页面（如购物车）。
- **Then** 正在进行的 `fetch` 请求和流解析逻辑 **不应中断**。
- **And** 消息内容应持续异步追加到 `useChatStore` 的 `messages` 数组中。
- **And** `isStreaming` 状态在后台保持为 `true` 直至流结束。
- **Given** 流在后台已经结束或仍在继续。
- **When** 用户再次点击“聊天”返回。
- **Then** 聊天气泡应正确显示后台已接收的所有内容。
- **And** 如果流仍在进行，应自动触发“打字机”追赶逻辑，继续显示剩余内容。
- **And** 正常流式阶段保持可读节奏：小步输出（词/1–2 字符）、tick 约 40–80ms，句读/段落处有短暂停顿，营造“思考感”。
- **And** 追赶阶段受控：允许加速追平 backlog，但在剩余约 200–400 字符时切回正常节奏，并限制单次跳跃/停顿，避免瞬间刷完让用户来不及阅读。
- **And** **不再显示** 因页面切换导致的“网络错误”或“请求失败”警告。

**技术实现 (Technical Notes)**:

- **逻辑上移**: 将 `streamAssistantReply` 函数从 `app/chat/page.tsx` 迁移到 `lib/store.ts` 的 `useChatStore` 动作中。
- **全局单例**: 利用 Zustand Store 的单例特性，确保其生命周期贯穿整个 Session（除非刷新页面）。
- **打字机解耦**: 将消息追加（Data Append）与打字机效果（UI Display）解耦。Store 负责数据追加，组件负责根据已读位置（Read Pointer）进行打字显示。
- **节奏分段**: 以 `lag = fullContent.length - displayedLength` 判断阶段。lag 小走正常节奏（1–2 字符/40–80ms + 标点停顿）；lag 大进入 catch-up（限制最大步长、可按句/段推进），追到剩余约 200–400 字符后回落正常，确保跨页返回不瞬刷。
- **追赶机制**: 在 `ChatPage` 挂载时，检查 `isStreaming` 状态，并对比当前消息的“已渲染长度”与“实际长度”，自动启动流式显示。

**Dev Agent TODO**:

- [ ] 在 `ChatInterface/useTypewriter` 按 `lag` 区分正常流式节奏与 catch-up 节奏，catch-up 剩余约 200–400 字符时切回正常节奏（AC: 8, 9）。
- [ ] 正常流式节奏：小步输出（词/1–2 字符）、tick 约 40–80ms，句读/段落停顿以增强“思考感”（AC: 新增节奏要求）。
- [ ] Catch-up 节奏：限制单次跳跃/可按句段推进，避免跨页返回瞬刷 backlog（AC: 新增节奏要求）。
- [ ] 挂载时检测 `isStreaming` + `lag`，触发追赶并保持滚动到底部，确保跨页返回可继续播放（AC: 7, 8, 9）。
- [ ] 确保 Store 的流式请求在路由切换时不中断，`isStreaming/streamingMessageId` 正确复位，UI 不再抛出“网络错误/请求失败”误报（AC: 3, 4, 5, 10）。

# Epic 3: 智能诊断与可视化反馈 (Diagnosis Engine & Visualization)

---

### Story 3.1: 胸型自我认知选择组件

**用户故事**:
作为一名 **用户**，
我想要 **通过直观的图片而不是复杂的文字来选择我的胸型**，
以便 **Agent 能准确判断我适合深杯还是浅杯，从而避免空杯或压胸的问题**。

**验收标准 (Acceptance Criteria)**:

- **Given** 辅助数据（身高/体重）采集完毕。
- **When** 进入胸型诊断节点。
- **Then** 界面展示垂直滚动的选项卡片列表。
- **And** 提供三个选项：
  1. **圆盘型 (散)**: 对应“底盘大，隆起不高”。
  2. **纺锤型**: 对应“底盘小，隆起高”。
  3. **半球型**: 对应“肉质紧实，像碗扣在胸口”。
- **And** 每个选项左侧展示抽象的、圆润的 **3D 线条图标**（非写实照片），右侧为标题和描述。
- **And** **卡片选中状态 (Selected)**：
  - 背景变为浅紫色 `#F3E8FF`。
  - 边框变为 **主紫色 `#8B5CF6`**。
  - 右上角出现紫色勾选标记。
- **And** 确认后自动提交给 n8n 进行处理。
- **And** 选择后自动触发下一环节。

* **When** n8n 返回 `<STATE>{"step":"shape_select"}</STATE>...选出最接近的胸型图`。
* **Then** 识别 `step: "shape_select"`。
* **And** 在气泡下方渲染 **SelectCard 组件**。
* **And** 此时用户只能操作卡片，底部输入框禁用或隐藏，确保流程单线进行。

**技术实现 (Technical Notes)**:

- **UI 组件**: 开发 `SelectCard` 组件。
- **资产**: 需要 UI 设计师提供 3 种胸型的 SVG 或 PNG 图标。
- **数据逻辑**: 用户的选择 (e.g., `shape: "round"`) 存入 Zustand Store，稍后统一提交。

---

### Story 3.2: 痛点多选交互 (Grid Layout)

**用户故事**:
作为一名 **用户**，
我想要 **快速选择我平时最烦恼的问题**，
以便 **推荐算法能针对性地帮我避雷**

**验收标准 (Acceptance Criteria)**:

- **Given** 胸型选择完成。
- **When** 进入痛点诊断节点。
- **Then** 界面展示 **多选网格 (Grid Layout)**。
- **And** 选项内容严格匹配 PRD 定义：
  - 隐形刺客 (钢圈戳腋下)
  - 逃跑新娘 (跑杯)
  - 分身术 (压胸)
  - 空城计 (空杯)
  - 滑坠深坑 (肩带问题)。
- **And** 每个选项是一个带有图标和简短文字的小方块。
- **And** 支持多选，痛点选项被选中时：
  - 边框变为 **橙色系 (orange-600)** 或 **强调粉色 (`border-[#EC4899]`)** 以表达“痛点/警示”含义。
  - 背景变为对应的浅色系 (orange-50 或 pink-50)。
- **And** 确认后自动提交给 n8n 进行处理。

**技术实现 (Technical Notes)**:

- **UI 组件**: 开发 `PainPointGrid` 组件。
- **交互**: 底部提供一个显眼的“选好了”按钮（Primary Button）提交数据。

---

### Story 3.3: n8n 诊断计算引擎

**用户故事**:
作为一名 **产品经理**，
我想要 **n8n 根据用户的所有输入（尺码+身型+胸型+痛点）计算出最终的内衣参数**，
以便 **生成精准的推荐 SQL 查询条件**。

**验收标准 (Acceptance Criteria)**:

- **Given** 前端提交了包含 `{ measurements, body_shape, chest_type, pain_points }` 的完整 Payload。
- **When** n8n 接收到请求。
- **Then** 执行 **尺码计算逻辑**：基于上下围差计算初始尺码，并根据身高/体重（圆身/扁身）进行底围修正。
- **And** 执行 **匹配规则逻辑**：
  - 若圆盘型 -> 标记 `cup_style: "shallow"`, `wire: "wide"`。
  - 若纺锤型 -> 标记 `cup_style: "deep"`, `wire: "narrow"`。
  - 若痛点含“戳腋下” -> 标记 `exclude_features: ["high_side_ratio"]`。
- **And** 返回结构化的诊断结果 JSON，包含：`final_size` (e.g., "75C"), `analysis_text` (分析文案), `recommended_features` (推荐特征)。

**技术实现 (Technical Notes)**:

- **n8n Workflow**: 这是一个纯逻辑处理流程，可以使用 Code Node (JavaScript) 来实现复杂的 `if/else` 匹配规则，比纯 LLM 更稳定且省钱。
- **LLM 辅助**: 仅用于生成 `analysis_text`（安抚性、解释性的话术）。

---

### Story 3.4: 3D 身体蓝图与报告渲染 (The Aha Moment)(已弃用)

**用户故事**:
作为一名 **用户**，
我想要 **看到一张标注了我身体特征的 3D 蓝图，并明确看到我的真实尺码**，
以便 **直观地理解为什么我以前买的内衣不合适**。

**验收标准 (Acceptance Criteria)**:

- **Given** n8n 返回了诊断结果。
- **When** 结果准备就绪前，先展示“正在综合你的数据...”的加载过渡页。
- **Then** 结果页渲染 **灰色哑光 3D 人台模型**。
- **And** 在模型关键部位（如底盘、鸡心位）通过 CSS 覆盖层 (Overlay) 展示冷色调的数据标注。
- **And** 3D 模型的背景或氛围光使用 **`from-purple-500 to-pink-500`** 渐变。
- **And** **尺码对比卡片**：
  - **旧尺码 (错误)**: 使用 **Destructive Red `#D4183D`** 或红色背景 `red-50` 配合删除线。
  - **新尺码 (正确)**: 使用 **Success Green `text-green-600`** 和 `border-green-500` 进行强烈对比。
- **And** 关键数据指标使用 **亮粉色 `#EC4899`** 标注。
- **And** 展示 **尺码对比卡片**：划掉“旧认知尺码”（如果有），醒目展示“现在的真实尺码” (绿色/紫色强调)。
- **And** 展示详细数据列表（上下围实测值）。

**技术实现 (Technical Notes)**:

- **前端渲染**: MVP 阶段不需使用 Three.js 实时渲染。使用一张高质量的 **通用灰色人台图片** 作为底图，通过绝对定位 (`absolute positioning`) 将数据标签 (`div`) 覆盖在图片对应坐标上。
- **动态性**: 标签的内容（如“底盘宽”）来自 n8n 返回的数据。

---

### Story 3.5: 分析加载与进度反馈界面 (Loading Analysis & Progress Feedback)

**用户故事**:
作为一名 **用户**，
我想要 **在完成所有数据输入后看到清晰的进度指示和鼓励性反馈**，
以便 **我知道分析已经开始，并在等待结果时感到安心**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户已完成所有输入。
- **When** n8n 开始处理。
- **Then** 渲染 **LoadingAnalysis** 组件。
- **And** 包含进度条和鼓励性文案（“你的胸型非常典型...”）。

**技术实现 (Technical Notes)**:

- **Figma 引用**: 节点 ID `14:3041`。

# Epic 4: 商城与支付闭环 (Ecommerce & Payment Ecosystem)

**Epic 目标**: 基于诊断数据检索商品，并打通加购、支付、结算的全链路交易流程。

---

### Story 4.1: n8n 推荐逻辑与 SQL 生成

**用户故事**:
作为一名 **后端开发人员**，
我想要 **n8n 根据诊断数据检索推荐商品**，
以便 **精准捞出符合用户身体特征且有库存的商品**。

---

### Story 4.2: 推荐卡片与“推荐理由”动态展示

**用户故事**:
作为一名 **用户**，
我想要 **在看到推荐商品时，明确知道“为什么这款适合我”**，
以便 **放心下单**。

**验收标准 (Acceptance Criteria)**:

- **Given** n8n 返回了推荐商品。
- **Then** 展示 **产品推荐卡片流**，背景使用 **粉红色渐变** 的“推荐理由”标签。

---

### Story 4.3: 购物车管理与页面开发

**用户故事**:
作为一名 **用户**，
我想要 **将心仪的内衣加入购物车，并统一管理**，
以便 **我可以批量结算我选择的商品**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户点击了商品卡片上的“加入购物车”。
- **When** 进入 **购物车页面** (Cart Page) (Figma 151:173)。
- **Then** 顶部显示“购物车”标题及商品总数，背景为品牌粉紫渐变。
- **And** 显示 **配送地址栏**: "配送至: [当前默认地址]"。
  - **And** 分别展示 **有效商品列表 (`validList`)** 和 **失效商品列表 (`invalidList`)**。
  - **And** 每个有效商品项包含：
    - 左侧 **选择框**: 绑定 `selected` 字段，支持单选/取消。
    - 商品图片: 优先使用 `sku.picUrl`，若不存在则使用 `spu.picUrl`。
    - 商品名称: 展示 `spu.name`。
    - 规格展示: 遍历 `sku.properties` 数组，将 `propertyName` 与 `valueName` 拼接（如：“尺码: 75D; 颜色: 黑色”）。
    - 价格显示: 使用 `sku.price` (粉色)。
    - **数量加减组件**: 绑定 `count` 字段，支持实时修改。
  - **And** 失效商品项（`invalidList`）：样式置灰，不可勾选，明确标注“已失效”或相关原因。
- **And** 底部 **操作栏**:
  - 左侧 "全选" 复选框。
  - 中间显示 "合计: ¥[总金额]" (金额使用 `#EC4899` 粗体)。
  - 右侧 **“结算”按钮**: 使用品牌红粉渐变 (`linear-gradient(105deg, #DA3568, #FB7185)`)，圆角设计。

**技术实现 (Technical Notes)**:

- 调用后端 `yudao-module-trade` 的 `AppCartController` 接口。
- **接口路径**:
  - 查询列表: `GET /app-api/trade/cart/list` (返回 `validList` 和 `invalidList`)。
  - 添加购物车: `POST /app-api/trade/cart/add` (添加新的 sku_id)。
  - 更新数量: `PUT /app-api/trade/cart/update-count` (修改已有项的数量)。
  - 选中状态: `PUT /app-api/trade/cart/update-selected` (切换选中/不选中)。
  - 删除商品: `DELETE /app-api/trade/cart/delete` (支持批量删除)。
  - 总数查询: `GET /app-api/trade/cart/get-count`。
- **数据结构映射 (`AppCartListRespVO`)**:
  - `validList` / `invalidList` 每一项均为 `Cart` 对象。
  - `id`: 对应购物车项的唯一编号（更新/删除时使用）。
  - `spu.name`: 商品名称。
  - `sku.picUrl`: 商品图片（若为空则兜底使用 `spu.picUrl`）。
  - `sku.price`: 对应 SKU 的当前价格。
  - `sku.properties`: 一个包含属性 ID、名称、值 ID、值名称的数组。前端需遍历并拼接 `propertyName` 和 `valueName`。
- **数据同步 (React Query)**:
  - 使用 `@tanstack/react-query` 的 `useQuery` 钩子管理购物车列表 (`cartList`)。
  - 支持在进入购物车页面前的预取 (Prefetch) 逻辑，以实现无缝切换。
  - 在全局组件（如 `BottomNav`）中共享此 Query 状态以显示购物车角标。
- **尺码区分与 SKU 逻辑**:
  - **添加购物车前**: 前端需通过对应的 `skuId`，并以此 ID 调用添加接口（在 productRecommendation 组件中想对应的数据有 sku_id）。
  - **购物车列表展示**: `AppCartListRespVO` 已经返回了 `sku.properties`。前端直接遍历这个 properties 数组，提取出属性名（如“尺码”）和属性值（如“M”）进行展示即可。
  - **在购物车中修改尺码**: 如果用户想在购物车里直接换个尺码，应该调用 `PUT /app-api/trade/cart/update-count` (重置购物车项) 接口。
- **状态管理**: 使用 Zustand 或 React Query 同步购物车实时状态。
- **Figma 引用**: 节点 ID `151:173`。

---

### Story 4.6: 推荐卡片一键加购与“后悔药”撤回机制 (One-click Add to Cart & Undo Logic)

**用户故事**:
作为一名 **用户**，
我想要 **在看到心仪的内衣推荐时，能够一键将其加入购物车**，
并在 **发现加错或想改变主意时，能通过弹出的提示框一键撤回加购操作**，
以便 **享受丝滑的购物体验，减少繁琐的跳转和管理成本**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户正在查看“满月”提供的商品推荐卡片。
- **When** 用户点击卡片上的“加入购物车”按钮。
- **Then** 前端应提取该商品的 `sku_id`。
- **And** 调用后端接口 `POST /app-api/trade/cart/add`，参数包含 `skuId` 和 `count: 1`。
- **And** 请求成功后，界面显示包含“撤回”按钮的 Toast 提示。
- **And** 推荐卡片的按钮状态变为“已加购”（置灰或禁用）。
- **When** 用户点击 Toast 上的“撤回”按钮。
- **Then** 前端应立即调用后端删除接口 `DELETE /app-api/trade/cart/delete?ids={cartId}`。
- **And** 撤回成功后，Toast 提示变为“已撤回”，且推荐卡片的按钮恢复为“加入购物车”状态。

**技术实现 (Technical Notes)**:

- **接口对接 (Native Fetch)**:
  - 必须通过基于原生 `fetch` 封装的 `lib/api.ts` 进行调用，不再使用 Axios。
  - 添加购物车: `POST /app-api/trade/cart/add`，Body: `{ skuId: number, count: number }`。
  - 删除/撤回购物车: `DELETE /app-api/trade/cart/delete`，Query: `ids` (逗号分隔的购物车项 ID)。
- **认证状态集成 (NextAuth)**:
  - 在组件层或 Hook 中，通过 `useSession()` 钩子获取最新的 `accessToken`。
  - 确保请求 Header 中包含 `Authorization: Bearer [token]`，该逻辑应由 `lib/api.ts` 的 `clientFetch` 统一处理。
- **数据流管理 (React Query)**:
  - 使用 `useMutation` 钩子封装加购和删除操作。
  - **关键同步**: 在 `useMutation` 的 `onSuccess` 回调中，必须调用 `queryClient.invalidateQueries({ queryKey: ['cartList'] })`，以确保购物车全局状态同步更新。
- **撤回逻辑实现**:
  - `POST /trade/cart/add` 接口成功后会返回创建的购物车项 ID (`cartId`)。
  - 前端需暂存此 `cartId` 到 Toast 的上下文或闭包中。
  - 当用户触发“撤回”时，使用该 `cartId` 调用删除接口，模拟撤回效果。
- **UI 组件**: 使用 `sonner` 的 `toast.custom` 自定义样式，保持设计稿的圆润紫色风格。
- **数据流**: `isAdded` 状态应在组件层维护。为了支持“撤回”后的即时恢复，`setAddedProducts` 应在撤回接口成功后执行删除操作。

---

### Story 4.4: 确认订单与下单创建 (已更新细节)

**用户故事**:
作为一名 **用户**，
我想要 **在支付前核对收货地址、预览费用并正式提交订单**，
以便 **产生支付所需的订单单号并进入结算环节**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户在购物车点击“结算”。
- **结算预览**:
  - **When** 进入页面，调用 `GET /app-api/trade/order/settlement` 获取实时计价。
- **地址与支付偏好**:
  - 支持地址的增删改查（参考前序逻辑）。
  - 用户可选择支付方式（微信/支付宝）。
  - 在购物车界面选择的地址需要随着进入结算页时自动选中
  - 在结算页的地址栏中，需要展示当前选中的地址信息
- **下单执行**:
  - **When** 点击“立即支付”。
  - **Then** 调用 `POST /app-api/trade/order/create`。
  - **And** **数据返回解析**: 必须获取返回的 `id` (交易订单号) 和 `payOrderId` (支付单编号)。
  - **And** 成功后，立即将 `payOrderId` 传递给支付模块 (Story 4.5)。

**技术实现 (Technical Notes)**:

- **接口**: `POST /app-api/trade/order/create`。
- **返回结构**: `AppTradeOrderCreateRespVO` 包含 `id` 和 `payOrderId`。

---

### Story 4.5: 支付提交、环境唤起与状态查询 (已更新逻辑)

**用户故事**:
作为一名 **已产生支付单的用户**，
我想要 **系统自动根据我的访问设备选择最合适的支付方式**，
以便 **我能丝滑地完成支付流程而不受环境限制**。

**验收标准 (Acceptance Criteria)**:

- **端环境识别与渠道自动选择**:
  - **支付宝 (Alipay)**:
    - **Given** 用户选择支付宝。
    - **When** 在 **手机端浏览器** 访问。
    - **Then** 自动设 `channelCode: "alipay_wap"`，返回 URL 后直接唤起支付宝 App。
    - **When** 在 **电脑端浏览器** 访问。
    - **Then** 自动设 `channelCode: "alipay_pc"`，返回 PC 支付页面 URL。
  - **微信 (WeChat)**:
    - **Given** 用户选择微信。
    - **When** 在 **微信 App 内浏览器** 访问。
    - **Then** 自动设 `channelCode: "wx_pub"` (需传递 `openid`)。
    - **When** 在 **手机普通浏览器** (非微信) 访问。
    - **Then** 自动设 `channelCode: "wx_wap"`。
    - **When** 在 **电脑端浏览器** 访问。
    - **Then** 自动设 `channelCode: "wx_native"`，前端需将返回的链接转换为二维码展示。
- **支付提交 (Payment Submission)**:
  - **Given** 已从 Story 4.4 获取 `payOrderId`。
  - **When** 调用 `POST /app-api/pay/order/submit`。
  - **And** 参数包含：`id` (payOrderId), `channelCode` (根据上述规则确定), `returnUrl`, `displayMode: "url"`。
  - **Then** 根据 `displayContent` 执行跳转或二维码渲染。
- **支付结果页与状态查询**:
  - **Given** 用户支付完成回跳。
  - **Then** 进入结果页，启动 **2s 间隔的定时轮询** 查询订单支付状态。
- **错误处理规范**:
  - 网络/业务错误需显示友好提示；Token 过期自动清理并重定向。

**技术实现 (Technical Notes)**:

- **核心接口**: `POST /app-api/pay/order/submit`。
- **设备识别**: 需封装 `getPaymentChannel(platform, browser)` 工具函数进行 `channelCode` 的自动判定。
- **二维码生成**: 电脑端微信支付需使用 `qrcode.react` 等库渲染 `displayContent`。

# Epic 5: 用户中心与售后闭环 (User Profile & Post-Sales)

**Epic 目标**: 提供完整的账户管理、订单追踪及退换货支持。

---

### Story 5.5: 个人中心与订单列表 (已更新细节)

**用户故事**:
作为一名 **用户**，
我想要 **在“我的”页面查看我的个人信息和订单状态，并能管理账户安全和基本资料**，
以便 **跟踪我的购买历史并保持账号信息的准确性**。

**验收标准 (Acceptance Criteria)**:

- **个人中心主页 (Figma 152:78)**:
  - **Given** 用户点击底部导航栏的“我的”。
  - **When** 页面加载。
  - **Then** 调用 `/app-api/member/user/get` 获取数据。
  - **And** 展示：用户头像 (`avatar`)、昵称 (`nickname`) 和 ID。
  - **And** 提供菜单项：我的订单、我的售后、收货地址、关于我们、设置。
- **设置与资料修改 (Figma 166:361)**:
  - **When** 点击“设置”。
  - **Then** 进入设置页，提供“修改密码”和“修改个人资料”入口。
  - **And** 点击“修改资料”支持更新 `nickname` 和 `avatar` (调用 `/app-api/member/user/update`)。
  - **And** 点击“修改密码”进入密码变更流程 (调用 `/app-api/member/user/update-password`)。
  - **And** **交互与导航逻辑**:
    - 子页面（设置、修改资料、修改密码）必须包含“返回”按钮，且遵循物理返回路径（如：修改资料 -> 设置 -> 个人中心）。
    - 当用户通过底部导航栏切换到其他 Tab（如“聊天”）再返回“我的”时，应保持在离开前的页面（即状态保持），除非用户再次点击已选中的“我的”图标，此时应重置到个人中心主页。
- **订单列表分页**:
  - **When** 点击“我的订单”。
  - **Then** 调用 `/app-api/trade/order/page` 渲染订单分页列表。
  - **And** 使用 **Shadcn/UI Pagination** 组件进行翻页控制。
  - **And** 修改资料和修改密码时，必须使用 shadcn/ui 的 Form 组件来处理表单提交
  - **And** 每项订单展示包含：订单 ID、编号 (`no`)、状态 (`status`)、实付金额 (`payPrice`) 及订单项列表 (`items`)。

**技术实现 (Technical Notes)**:

- **API 接口集成**:
  - 获取资料: `GET /app-api/member/user/get` -> 结构体 `AppMemberUserInfoRespVO`。
  - 更新资料: `PUT /app-api/member/user/update` -> Body 包含 `nickname`, `avatar`。
  - 修改密码: `PUT /app-api/member/user/update-password` -> Body 包含 `oldPassword`, `newPassword`。
  - 订单分页: `GET /app-api/trade/order/page` -> 返回 `PageResultAppTradeOrderPageItemRespVO`。
- **UI & 路由**:
  - **Figma 引用**: 个人中心 `152:78`，设置页 `166:361`。
  - **组件库**: 引入 Shadcn/UI 的 `Pagination`, `Avatar`, `Skeleton` (用于加载态)。
  - **路由模式**: 建议使用 Next.js 嵌套路由 (`/profile/settings`, `/profile/orders`)。
- **数据管理**:
  - 使用 `@tanstack/react-query` 的 `useQuery` 获取用户信息，并在资料更新成功后通过 `queryClient.invalidateQueries` 触发实时刷新。
  - 使用 `useForm` 处理修改资料和密码的表单提交。

---

### Story 5.6: 退换货流程支持 (售后服务)

**用户故事**:
作为一名 **购买后不合适的用户**，
我想要 **在线申请退换货**，
以便 **即使买错也能获得完善的售后保障**。

**验收标准 (Acceptance Criteria)**:

- **Given** 订单处于“已完成”或“已收货”状态。
- **When** 在“我的售后”中发起退款/退货申请。
- **Then** 用户可以上传照片、填写原因。
- **And** 后端记录售后申请，并同步更新订单状态为“售后中”。

**技术实现 (Technical Notes)**:

- 调用 `yudao-module-trade` 的售后相关接口。
- 确保符合 PRD 中“支持 7 天无理由退换”的承诺。

---

### Story 5.7: 订单详情与生命周期管理 (详情、收货、物流、取消)

**用户故事**:
作为一名 **已下单用户**，
我想要 **查看订单详情、追踪物流并在收到货后确认收货，或者在必要时取消订单**，
以便 **掌握订单的实时状态并自主管理交易流程**。

**验收标准 (Acceptance Criteria)**:

- **订单详情 (Order Detail)**:
  - **When** 用户在订单列表中点击某项订单。
  - **Then** 跳转至详情页，调用 `GET /app-api/trade/order/get-detail`。
  - **And** 展示：收货地址、物流信息摘要、商品清单（调用 `GET /app-api/trade/order/item/get` 可获取单项详情）、订单费用明细（总价、运费、优惠）、订单状态时间线。
- **物流追踪**:
  - **When** 用户点击“查看物流”。
  - **Then** 调用 `GET /app-api/trade/order/get-express-track-list`。
  - **And** 展示时间倒序的物流节点列表。
- **状态操作与生命周期**:
  - **取消订单**: 对于“待付款”订单，支持点击“取消”，调用 `DELETE /app-api/trade/order/cancel`。
  - **确认收货**: 对于“已发货”订单，支持点击“确认收货”，调用 `PUT /app-api/trade/order/receive`。
  - **删除订单**: 对于“已关闭”或“已完成”订单，支持点击“删除”，调用 `DELETE /app-api/trade/order/delete`。

**技术实现 (Technical Notes)**:

- **API 集成**:
  - 详情获取: `GET /app-api/trade/order/get-detail`。
  - 物流查询: `GET /app-api/trade/order/get-express-track-list`。
  - 确认收货: `PUT /app-api/trade/order/receive`。
  - 取消订单: `DELETE /app-api/trade/order/cancel`。
  - 删除订单: `DELETE /app-api/trade/order/delete`。
  - 支付状态手动同步 (模拟用): `POST /app-api/trade/order/update-paid`。
- **UI 交互**:
  - 操作按钮（如“确认收货”）需增加二次确认弹窗 (`AlertDialog`)。
  - 订单状态变更后，触发 `queryClient.invalidateQueries({ queryKey: ['orderList'] })` 刷新列表和详情。

---

### Story 5.8: 订单项评价系统

**用户故事**:
作为一名 **已收货用户**，
我想要 **对购买的商品进行评价**，
以便 **分享我的穿戴感受并获得积分奖励**。

**验收标准 (Acceptance Criteria)**:

- **评价提交**:
  - **Given** 订单项状态为“待评价”。
  - **When** 用户点击“评价”。
  - **Then** 跳转至评价界面。
  - **And** 支持星级评分、输入文字、上传图片。
  - **And** 点击“提交”调用 `POST /app-api/trade/order/item/create-comment`。
- **状态反馈**:
  - **Then** 评价成功后，该订单项状态更新为“已评价”，并跳转回订单详情页。

**技术实现 (Technical Notes)**:

- **API 接口**: `POST /app-api/trade/order/item/create-comment`。
- **UI 组件**: 使用 Shadcn/UI 的 `Textarea` 和自定义的 `StarRating` 组件。

---

### Story 5.9: 全功能地址管理系统 (选择与管理模式)

**用户故事**:
作为一名 **用户**，
我想要 **通过统一的地址管理系统在购物结算时选择配送地址，或在个人中心维护我的地址库**，
以便 **我能高效地管理收货信息并享受流畅的下单体验**。

**验收标准 (Acceptance Criteria)**:

1. **统一地址列表页 (`/profile/addresses`)**:

   - **Given** 用户访问地址列表页。
   - **管理模式 (Default)**:
     - **When** 从“个人中心”进入。
     - **Then** 点击地址项进入“编辑表单”；点击“添加新地址”按钮进入“创建表单”。
   - **选择模式 (`?mode=select`)**:
     - **When** 从“购物车”或“结算页”进入（携带 `callbackUrl` 参数）。
     - **Then** 点击地址项卡片会将该地址设为当前选中的配送地址，并自动返回 `callbackUrl`。
     - **And** 只有点击右侧的“编辑图标”才会进入编辑表单，点击卡片其余部分触发“选中”逻辑。

2. **核心组件设计**:

   - **AddressListItem (地址项组件)**:
     - 展示姓名、电话、详细地址及“默认”标签。
     - 包含明确的“编辑”图标热区。

- **AddressForm (地址表单组件)**:
  - 支持姓名、手机号、省市区选择（联动选择器）、详细地址、设为默认。
  - **智能地址补全**: 集成 **腾讯地图 API (Javascript API GL)**，在输入详细地址时提供关键词提示（Autocomplete），并自动解析填入省市区。
  - 支持创建模式和更新模式。

3. **交互流设计 (UX Flow)**:
   - **场景 A (结算选地址)**: 结算页地址栏 -> `/profile/addresses?mode=select&callbackUrl=/checkout` -> 点击卡片 -> 设为默认/选中 -> 回跳 `/checkout`。(购物车同理)
   - **场景 B (中心管地址)**: 个人中心 -> `/profile/addresses` -> 点击卡片/添加 -> 进入表单 -> 保存 -> 返回列表。

**技术实现 (Technical Notes)**:

- **路由结构 (Next.js App Router)**:
  - `app/profile/addresses/page.tsx`: 列表页（处理模式逻辑与 API 分发）。
  - `app/profile/addresses/new/page.tsx`: 新建页。
  - `app/profile/addresses/[id]/page.tsx`: 编辑页。
- **API 接口**:
  - 获取列表: `GET /app-api/member/address/list`
  - 获取详情: `GET /app-api/member/address/get?id={id}`
  - 创建地址: `POST /app-api/member/address/create`
  - 更新地址: `PUT /app-api/member/address/update`
  - 删除地址: `DELETE /app-api/member/address/delete?id={id}`
  - 设为默认: `PUT /app-api/member/address/update-default?id={id}`
- **数据管理**:
  - 使用 `@tanstack/react-query` 管理地址列表缓存，通过 `invalidateQueries` 实现实时刷新。
  - 在“选择模式”下，选定后可利用 `useRouter.push(callbackUrl)` 或 `useRouter.back()` 进行导航。
- 等待加载地址时使用 shadcn/ui 的 Skeleton 组件来显示加载状态， 并且 badge 用于标记默认地址
- 对于没有地址时，使用 shadcn/ui 的 EmptyState 组件来显示没有地址的提示，并且有“去添加”按钮
- 对于没有地址时创建的地址，必须自动设为默认地址
- 对于创建地址时，必须使用 shadcn/ui 的 Form 组件来处理表单提交
