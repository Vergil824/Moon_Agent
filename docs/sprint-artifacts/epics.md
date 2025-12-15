满月 Moon - Epic 结构规划方案
基于 PRD v1.1, Architecture v1.4, UX v2.0

1. Epic 1: 基础设施与核心数据层搭建 (Foundation & Core Data Layer)
用户价值: 为应用提供稳定运行的基础环境，确保数据可存取，AI 流程可连通。 PRD 覆盖: 非功能需求（响应速度、隐私保护）、数据存储基础。 技术上下文:

初始化 Next.js 14+ 项目 (Tailwind/Shadcn)。

配置 Supabase 数据库 (Products, Users, Chat Sessions 表结构设计)。

搭建 n8n 基础 Webhook 回路与鉴权。

实现 Next.js API Route (BFF) 转发层。 UX 上下文: 确定全局主题色 (Violet Gradient) 与字体系统。


2. Epic 2: 沉浸式对话与测量引导 (Immersive Chat & Measurement Flow)
用户价值: 用户可以与“满月”建立连接，并在专业的视觉引导下准确输入身体数据。 PRD 覆盖: 节点一（欢迎与破冰）、节点二（尺码采集）、节点三（辅助信息）。 技术上下文:

开发 ChatInterface 组件 (流式打字机效果)。

实现 MeasureGuide 组件 (集成 3D 循环动画资产)。

对接 n8n 进行意图识别与参数提取 (LLM Chain)。 UX 上下文: 实现“对话气泡引导 + 底部操作卡片”布局，测量步骤的 3D 动效展示。

3. Epic 3: 智能诊断与可视化反馈 (Diagnosis Engine & Visualization)
用户价值: 用户能够直观地了解自己的胸型和痛点，并获得可视化的身体分析结果（Aha Moment）。 PRD 覆盖: 节点四（胸型诊断）、节点五（痛点诊断）、节点六（报告生成 - 3D 模型部分）。 技术上下文:

开发 SelectCards 组件 (胸型选择) 和 Grid 组件 (痛点多选)。

实现 3D 身体蓝图 (3D Model Screen) 的前端渲染与数据标注。---这里可以先暂时用一个placeholder代替

n8n 处理复杂的诊断逻辑并返回结构化分析数据。 UX 上下文: 抽象 3D 图标应用，痛点选择交互，加载页面的安抚性文案。

4. Epic 4: 推荐算法与选品闭环 (Recommendation Algorithm & Product Display)
用户价值: 用户获得真正匹配其数据的商品推荐，并能查看详情。 PRD 覆盖: 节点六（报告生成 - 数据部分）、推荐匹配算法逻辑、供应链逻辑。 技术上下文:

n8n 实现 SQL 生成逻辑 (SELECT * FROM products WHERE...)。

Supabase products 表数据填充与查询优化。

开发 ProductCard 组件与推荐列表流。

模拟加购/跳转逻辑。 UX 上下文: 推荐理由的动态展示 (“因为你是圆盘型...”)，新旧尺码对比展示。

5. Epic 5: 交付打磨与增长机制 (Refinement, Gamification & Launch)
用户价值: 获得完整的内衣深度报告作为社交货币，确信平台的可靠性。 PRD 覆盖: 游戏化与增长机制（限时礼包）、非功能需求（SEO、移动端适配）、边界处理。 技术上下文:

生成并美化最终诊断报告卡片。

SEO Metadata 配置 (Open Graph)。

移动端兼容性测试与 Vercel 部署调优。

边界情况 (Guardrails) 测试与优化。