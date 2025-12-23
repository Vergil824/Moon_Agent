# Epic 1: 基础设施与核心数据层搭建 (Foundation & Core Data Layer)

**Epic 目标**: 搭建基于 Next.js + Supabase + n8n 的全栈基础环境，确立 UI 设计系统，并打通前端到 AI 智能体的通信链路。

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

### Story 1.4: 基础布局与移动端视口配置

**用户故事**:
作为一名 **前端开发人员**，
我想要 **创建适配移动端的 H5 基础布局容器**，
以便 **应用在手机浏览器和微信中显示正常，无缩放问题**。

**验收标准 (Acceptance Criteria)**:

- **Given** 项目已初始化。
- **When** 在手机浏览器打开页面。
- **Then** 视口 (Viewport) 设置正确，禁止用户缩放 (`user-scalable=no`)。
- **And** 页面背景色为纯白或浅灰，无左右晃动。
- **And** 创建一个全局 Layout 组件，包含在此阶段所需的任何全局状态提供者 (如 React Query Provider)。

**技术实现 (Technical Notes)**:

- 修改 `app/layout.tsx` 的 metadata viewport 设置。
- 配置 `Zustand` store (空状态即可) 和 `React QueryClientProvider`。

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
- **Then** 界面流式显示文字引导。
- **And** 检测到 `step: "size_input"` 时，**立即**在当前对话气泡下方渲染 **测量引导卡片 (MeasureGuide Card)**。
- **And** 卡片包含 3D 演示动画和数字输入框。
- **And** 在用户完成卡片操作（点击“确认”）之前，对话流暂停等待。
- **And** 胸围差使用 **亮粉色 `#EC4899`** 进行强调。

**技术实现 (Technical Notes)**:

- **资产优化**: 使用 `<Image unoptimized />` 加载 GIF 或 WebP 格式的 3D 演示序列，预加载关键资源。
- **交互逻辑**: 步骤条 (Step Wizard) 模式，用户输入完下围后自动或点击下一步切换到上围。

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

# Epic 3: 智能诊断与可视化反馈 (Diagnosis Engine & Visualization)

**Epic 目标**: 将用户输入的身体数据转化为可视化的诊断结果，通过胸型判断、痛点分析和 3D 蓝图展示，建立用户的信任感并为推荐打下基础。

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

### Story 3.4: 3D 身体蓝图与报告渲染 (The Aha Moment)

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

- **Given** 用户已完成胸型选择和痛点输入。
- **When** n8n 开始处理诊断逻辑，前端接收到 `<STATE>{"step":"summary"}</STATE>` 或类似指令。
- **Then** 界面渲染 **LoadingAnalysis** 组件（参考 Figma 14:3041）。
- **And** 组件包含一个 **进度条 (Progress Bar)**，初始显示为 **33%**（或根据实际后端进度动态更新）。
- **And** 界面显示鼓励性文案：“Get！数据齐全。你的胸型非常典型，我知道你之前的内衣为什么钢圈总戳腋下了。”
- **And** 进度条上方显示动态加载图标（紫色渐变球体效果）。
- **And** 文字下方显示“分析中... [百分比]”的次要提示文字。
- **And** 整体背景采用品牌渐变色，边框为 `#8B5CF6`。

**技术实现 (Technical Notes)**:

- **UI 组件**: 开发 `LoadingAnalysis` 组件，使用 `Framer Motion` 实现进度条填充动画。
- **状态触发**: 当 `chatProtocol` 解析到 `step: "summary"` 时，渲染此组件。
- **样式**: 使用 Tailwind CSS，主色调 `#8B5CF6` (Violet) 和强调色 `#EC4899` (Pink)。
- **Figma 引用**: 节点 ID `14:3041`。

# Epic 4: 推荐算法与选品闭环 (Recommendation Algorithm & Product Display)

**Epic 目标**: 基于诊断数据，通过 n8n 编排精准的 SQL 查询，从 Supabase 检索合适的内衣商品，并以极具说服力的方式展示给用户。

---

### Story 4.1: n8n 推荐逻辑与 SQL 生成

**用户故事**:
作为一名 **后端开发人员**，
我想要 **n8n 根据诊断出的尺码和特征（如“圆盘型”）动态生成并执行 PostgreSQL 查询**，
以便 **从数据库中精准捞出符合用户身体特征且有库存的商品**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户诊断结果已生成 (Epic 3)。
- **When** n8n 进入选品环节。
- **Then** n8n 根据诊断数据构建 SQL 查询：
  - **尺码匹配**: 查询 `size_available` JSONB 字段，确保 `final_size` (e.g., "75C") 库存 > 0。
  - **胸型匹配**: 确保 `suitable_shapes` 数组包含用户的胸型 (e.g., "round")。
  - **痛点规避**: 如果痛点含“戳腋下”，排除 `tags` 含 "high_side_ratio" 的商品。
- **And** 执行查询并限制返回数量（如 Top 5）。
- **And** 如果没有完美匹配的商品，执行降级策略（如：放宽痛点限制，但保留尺码匹配），并标记为“次优推荐”。
- **And** 返回商品列表 JSON 给前端。

**技术实现 (Technical Notes)**:

- **Postgres Node**: 在 n8n 中直接连接 Supabase 执行 SQL。
- **Query 示例**: `SELECT * FROM products WHERE sizes->>'75C' > '0' AND 'round' = ANY(suitable_shapes)`。
- **排序优化**: 优先返回 `tags` 匹配度最高的商品。

---

### Story 4.2: 推荐卡片与“推荐理由”动态展示

**用户故事**:
作为一名 **用户**，
我想要 **在看到推荐商品时，明确知道“为什么这款适合我”**，
以便 **消除我对网购内衣不合适的疑虑，放心下单**。

**验收标准 (Acceptance Criteria)**:

- **Given** n8n 返回了推荐商品列表。
- **When** 前端渲染推荐列表 (Recommendations Screen)。
- **Then** 展示 **产品推荐卡片流**。
- **And** 每个卡片包含：商品图片、名称、价格。
- **And** **关键特性**: 卡片醒目位置展示 **“推荐理由”标签**，文案必须回扣之前的诊断。
  - 示例：“因为你是[圆盘型]，这款的[大钢圈]能提供更好包裹”。
- **And** 展示服务保障标签：“支持 7 天无理由退换” (必须支持，以降低决策成本)。
- **And** **“推荐理由”标签**：使用 **`from-pink-500 to-rose-500`** 渐变背景，白字，以突出“商品推荐”的功能属性。
- **And** 价格文本使用 **主紫色 `#8B5CF6`** 加粗显示。

**技术实现 (Technical Notes)**:

- **UI 组件**: 开发 `ProductCard` 组件。
- **数据映射**: “推荐理由”可以是 n8n 返回的动态文本，也可以是前端根据 `suitable_shapes` + `tags` 拼接的模板文案。

---

### Story 4.3: 商品详情交互与模拟加购

**用户故事**:
作为一名 **用户**，
我想要 **点击卡片查看更多细节，并尝试购买**，
以便 **完成交易流程（或在 MVP 阶段表达购买意向）**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户对某款推荐内衣感兴趣。
- **When** 点击商品卡片。
- **Then** 弹出详情模态窗 (Modal) 或跳转详情页。
- **And** 展示更多实物图、包装细节（增加信任感）。
- **And** 底部展示“去购买”或“加入购物车”按钮。
- **And** 点击购买后，跳转到外部电商链接（一件代发源）或 记录点击行为并提示“演示模式：模拟加购成功”。

**技术实现 (Technical Notes)**:

- **交互**: 使用 Shadcn `Dialog` 或 `Drawer` 组件展示详情，保持上下文不中断。
- **数据埋点**: 记录“点击跳转/加购”事件，用于计算 **推荐采纳率**。

---

### Story 4.4: 供应链服务保障信息展示

**用户故事**:
作为一名 **注重服务体验的用户**，
我想要 **确认商家支持“7 天无理由退换”**，
以便 **即使买回来不合适，我也有退路，不用担心浪费钱**。

**验收标准 (Acceptance Criteria)**:

- **Given** 商品展示环节。
- **When** 用户浏览商品信息时。
- **Then** 在显眼位置（如价格旁或购买按钮上方）展示服务承诺 Tag。
- **And** 明确标注：
  - ✅ 7 天无理由退换。
  - ⚡️ 48 小时发货 / 一件代发。
- **And** 商品筛选逻辑必须在后端（Story 4.1）就过滤掉不支持退换的商品。

**技术实现 (Technical Notes)**:

- **数据校验**: 确保 Supabase `products` 表中所有上架商品的数据源都符合 DSR 评分标准和售后要求。

# Epic 5: 交付打磨与增长机制 (Refinement, Gamification & Launch)

**Epic 目标**: 完善内衣深度报告以作为社交货币促进裂变，植入游戏化增长机制，并进行上线前的性能优化与边界测试，确保产品准备好面对真实流量。

---

### Story 5.1: 内衣深度报告生成 (社交货币)

**用户故事**:
作为一名 **获得“顿悟”的用户**，
我想要 **一份精美的、可视化的“内衣深度报告”总结卡片**，
以便 **我可以保存到相册或分享给闺蜜，展示我的新发现（建立社交优越感）**。

**验收标准 (Acceptance Criteria)**:

- **Given** 诊断和推荐流程已全部完成。
- **When** 用户点击“生成报告”或流程自动结束。
- **Then** 展示 **报告总结页 (Report Screen)**。
- **And** 报告包含：
  - 用户的 3D 身体蓝图截图（带标注）。
  - 醒目的 **“新旧尺码对比”**：划掉旧尺码，高亮新尺码。
  - 核心标签（如“圆盘型”、“高鸡心杀手”）。
- **And** 提供“保存图片”或“分享给姐妹”按钮。
- **And** (可选 MVP+) 生成一张包含小程序码/URL 的海报图片，用于朋友圈传播。
- **And** 报告整体视觉风格使用 **`from-blue-500 to-purple-500`** 的“深度报告”专属渐变色调。
- **And** 核心结论文字使用最深色 `#030213` 确保可读性。
- **And** 分享按钮使用 **主品牌渐变 (Purple to Pink)**。

**技术实现 (Technical Notes)**:

- **UI 实现**: 使用 HTML-to-Image 库（如 `html2canvas` 或 `satori`）在客户端或服务端生成分享图。
- **数据埋点**: 记录“保存/分享”事件，作为核心增长指标。

---

### Story 5.2: 游戏化激励机制 (限时礼包)

**用户故事**:
作为一名 **完成测量的用户**，
我想要 **获得一个随机的优惠券或小礼品奖励**，
以便 **我有更强的动力去点击推荐商品并完成首次下单**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户浏览完推荐商品。
- **When** 页面停留一定时间或准备离开时。
- **Then** 弹出一个 **“惊喜盲盒”或“限时礼包”** 动效。
- **And** 提示文案模仿拼多多风格：“恭喜！你解锁了限时内衣津贴...”。
- **And** 奖励内容可以是：
  - 模拟的“满减券”（在模拟加购时抵扣）。
  - 或者真实的电商优惠码（如果已对接真实商家）。
- **And** 在整个流程中展示 **进度条 (Progress Bar)**，并提示“进度已达 80%”，利用沉没成本防止中途流失。

**技术实现 (Technical Notes)**:

- **状态管理**: 在 Zustand store 中维护 `progress` 状态，并在顶部导航栏实时渲染。
- **交互**: 简单的 Lottie 动画或 CSS 动画实现开箱效果。

---

### Story 5.3: 边界处理与安全护栏 (Guardrails)

**用户故事**:
作为一名 **运营人员**，
我想要 **Agent 能够礼貌地拒绝非内衣相关的话题**，
以便 **维持“专业内衣顾问”的人设，并防止 LLM 产生不可控的内容**。

**验收标准 (Acceptance Criteria)**:

- **Given** 用户在自由对话框中发送了无关内容（如“今天天气怎么样”或敏感话题）。
- **When** n8n 识别到意图属于 `off_topic`。
- **Then** “满月”回复预设话术：“我在全神贯注研究适合你的内衣，这种超纲题就别考我啦！咱们还是聊聊怎么让你找到天选内衣吧？”。
- **And** 不触发任何数据库查询或推荐逻辑。

**技术实现 (Technical Notes)**:

- **n8n Logic**: 在 LLM Chain 的 System Prompt 中明确界定话题边界。
- **Prompt 示例**: "You are Moon, an underwear expert. If the user asks about anything other than body measurement, lingerie, or breast health, politely steer the conversation back using this script..."

---

### Story 5.4: SEO 配置与移动端性能优化

**用户故事**:
作为一名 **开发人员**，
我想要 **配置好网站的 SEO 信息并优化加载速度**，
以便 **用户在微信分享时能看到漂亮的卡片，且打开页面流畅无白屏**。

**验收标准 (Acceptance Criteria)**:

- **Given** 项目准备上线。
- **When** 部署到 Vercel 并通过域名访问。
- **Then** 网页 `<head>` 包含正确的 Title ("满月 Moon - 你的内衣选购专家"), Description, Open Graph (OG) 图片。
- **And** **移动端适配测试通过**：在 iOS Safari 和 Android 微信浏览器中，布局无错位，3D 引导图加载迅速。
- **And** **冷启动优化**：首屏内容（欢迎语）不依赖 n8n 实时返回，而是作为静态资源或极速 API 返回。

**技术实现 (Technical Notes)**:

- **Next.js Metadata**: 在 `layout.tsx` 或 `page.tsx` 中使用 Metadata API 配置 OG tags。
- **Vercel**: 配置生产环境环境变量，确保存储在 Supabase 的图片资源已开启 CDN 加速。
