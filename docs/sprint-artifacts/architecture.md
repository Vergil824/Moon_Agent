# **架构设计文档 \- 满月 Moon (内衣推荐智能 Agent)**

状态: 拟定 (Draft)  
作者: Winston (AI Architect)  
日期: 2025-12-12  
版本: v1.4 (Product Data Strategy Refined)

## **1\. 执行摘要 (Executive Summary)**

“满月 Moon” 是一个基于 AI 的内衣推荐智能体，以移动端网页 (H5) 形式运行。  
MVP 阶段采用 Next.js 全栈框架，结合 n8n 进行 AI 编排。这种架构既保证了 MVP 的极速交付，又利用 Next.js 的服务端能力为未来的业务逻辑扩展预留了“BFF (Backend for Frontend)”层，避免了纯前端 (SPA) 架构在后期面临的安全性与 SEO 瓶颈。

## **2\. 技术栈选型 (Technology Stack)**

### **2.1 全栈框架 (Fullstack Web)**

- **核心框架:** **Next.js 14+ (App Router)**
  - 选择理由: 1\. 混合渲染 (SSR/CSR): 即使是 H5，SSR 也能显著提升首屏加载速度 (LCP) 和 SEO（微信分享卡片）。  
     2\. API Routes: 允许在本项目内直接编写轻量级后端逻辑（如支付回调处理、数据清洗），无需额外部署后端服务器。
- **UI 框架:** **Tailwind CSS** \+ **Shadcn/UI** \+ **Framer Motion** (动画)
  - _选择理由:_ 移动端体验需要丝滑的动效（气泡弹出、卡片切换），Framer Motion 与 Next.js 结合完美。
- **状态管理:** **Zustand** (Client Side) \+ **React Query** (Server Side Data)
  - _选择理由:_ React Query 负责缓存 API 数据，Zustand 负责全局 UI 状态（如：侧边栏开关、当前对话模式）。
- **部署托管:** **Vercel** (零配置部署 CI/CD)

### **2.2 逻辑编排与 AI (AI Orchestration)**

- **核心引擎:** **n8n** (Workflow Automation)
  - _职责:_ 处理复杂的长流程交互（LLM 对话状态流转、多模态处理）。
- **LLM 服务:** 通过 n8n 统一管理，Next.js 后端代理调用，**前端不直接接触 LLM Key**。

### **2.3 数据层 (Data Persistence)**

- **数据库:** **Supabase (PostgreSQL)**
  - _决策关键点:_ **推荐系统的核心在于“精准过滤”，而非“模糊检索”。** 因此，商品数据必须存储在关系型数据库中，而非仅依赖 Dify 知识库。
  - _职责:_
    1. **Products (核心商品表):**
       - 必须包含字段: id, name, price, stock_status, size_available (JSONB), suitable_shapes (Array), tags (Array).
       - _理由:_ 只有 SQL 才能高效处理 "Size=75C AND Stock\>0" 这样的硬性电商逻辑。
    2. **Users (用户画像):**
       - 字段: measurements (上下胸围), body_shape (圆盘/纺锤), pain_points (Array).
    3. **Chat Sessions:**
       - chat_sessions & chat_messages 用于 n8n 记忆上下文。
    4. **pgvector (可选增强):**
       - 仅用于辅助排序。例如在过滤出 10 款合适尺码的内衣后，根据用户描述的“风格偏好”进行向量距离排序。

## **3\. 系统架构图 (System Architecture)**

graph TD  
 User\[用户 (Mobile Browser)\] \<--\> |HTTPS| NextClient\[Next.js Client (UI)\]

    subgraph "Next.js Server (Vercel)"
        NextClient \<--\> |Server Actions / API Routes| NextServer\[Next.js API Logic\]
        NextServer \-.-\> |隐藏 Key / 鉴权| Supabase\_Auth\[Supabase Auth\]
    end

    subgraph "Logic & Automation (n8n)"
        NextServer \--\> |1. 转发对话请求 (Webhook)| N8N\_Hook\[n8n Webhook\]
        N8N\_Hook \--\> Guardrails\[意图识别\]
        Guardrails \--\> LLM\_Chain\[LLM 处理\]

        LLM\_Chain \--\> |提取参数: 75C, 圆盘| Param\_Extract\[参数提取\]
        Param\_Extract \--\> |SQL 精准查询| Rec\_Engine\[Supabase 选品\]
    end

    subgraph "Data Layer (Supabase)"
        Rec\_Engine \<--\> |SQL: WHERE size='75C'| DB\[(PostgreSQL Products)\]
        NextClient \<--\> |直接获取图片/静态资源| Storage\[Supabase Storage\]
    end

    Rec\_Engine \--\> |2. 返回商品 JSON 列表| NextServer
    NextServer \--\> |3. 渲染商品卡片| NextClient

## **4\. 关键模块设计 (Key Technical Modules)**

### **4.1 对话交互协议 (Next.js BFF Pattern)**

为了安全性（不暴露 n8n Webhook URL）和未来扩展性，前端不直接请求 n8n，而是通过 Next.js API Route 中转。

**File: app/api/chat/route.ts**

// 伪代码示例：BFF 层逻辑  
export async function POST(req: Request) {  
 const { message, userId } \= await req.json();

// 1\. 业务逻辑扩展点：可以在这里检查用户是否被封禁，或者是否有足够的积分  
 if (await isUserBanned(userId)) {  
 return Response.json({ error: "Access Denied" }, { status: 403 });  
 }

// 2\. 安全调用 n8n (Webhook URL 存储在环境变量，前端不可见)  
 const n8nResponse \= await fetch(process.env.N8N_WEBHOOK_URL, {  
 method: 'POST',  
 body: JSON.stringify({ message, userId }),  
 headers: { 'Content-Type': 'application/json' }  
 });

// 3\. 业务逻辑扩展点：对 n8n 返回的数据进行清洗或格式化  
 const data \= await n8nResponse.json();

return Response.json(data);  
}

### **4.2 推荐算法的分层实现 (Evolution Strategy)**

- **MVP 阶段 (n8n \+ SQL):**
  - **逻辑:**
    1. 用户说：“我测完了，上围 88 下围 73，圆盘型”。
    2. n8n LLM 节点提取 JSON: { "upper": 88, "under": 73, "shape": "round" }。
    3. n8n Postgres 节点执行查询: SELECT \* FROM products WHERE 'round' \= ANY(suitable_shapes) AND sizes ? '75C'.
    4. n8n 将结果返回给前端。
  - **Dify 的位置:** Dify 可以作为一个辅助工具，如果用户问“什么是圆盘型”，n8n 可以调用 Dify 知识库回答定义问题，**但不参与选品**。
- **V2 阶段 (Next.js 接管):**
  - 当推荐规则变得极其复杂（涉及到库存锁定、优惠券计算）时，将这部分逻辑迁移到 app/api/recommend/route.ts 中，使用 Prisma 或 Drizzle ORM 进行精准控制。
  - n8n 退化为纯粹的 "意图识别" 和 "聊天陪伴" 角色。

### **4.3 3D 展示降级方案 (MVP)**

- **技术:** 使用 Next.js 的 \<Image /\> 组件加载优化后的 GIF/WebP 序列帧。
- **资源管理:** 所有视觉素材存放在 public/assets/3d-guides/ 或 Supabase CDN。
- **预加载:** 使用 \<link rel="preload"\> 预加载关键测量步骤的图片，确保对话到该步骤时秒开，无白屏。

## **5\. 开发里程碑 (Milestones \- Next.js 版)**

1. **Day 1: 骨架搭建**
   - npx create-next-app@latest moon-agent (TypeScript, Tailwind, App Router)。
   - 集成 shadcn/ui 。
   - 配置 Supabase Client。
2. **Day 2-3: 核心对话组件**
   - 开发 ChatInterface 组件 (支持流式文本打字机效果)。
   - 开发 MeasureGuide 组件 (步骤条 \+ 视觉引导)。
   - 编写 app/api/chat/route.ts 打通 n8n。
3. **Day 4-5: 业务闭环**
   - **关键:** 在 Supabase 创建 products 表并录入数据（不要只放在 Dify）。
   - n8n 调试推荐 SQL。
   - 前端 ProductCard 组件开发，实现点击跳转/模拟加购。
4. **Day 6-7: 细节打磨 & 上线**
   - SEO 配置 (metadata 导出)。
   - Vercel 部署与环境变量配置。
   - 真机测试 (iOS Safari / 微信内置浏览器)。

## **6\. 风险评估 (Risks)**

- **Vercel 访问速度:** 在国内某些网络环境下，Vercel 分配的域名可能访问较慢。
  - _对策:_ 考虑绑定自定义域名，并使用国内 CDN (如 Cloudflare 或 阿里云 CDN) 加速静态资源。
- **Cold Start (冷启动):** Serverless Functions (API Routes) 如果长时间无访问会休眠。
  - _对策:_ 保持逻辑轻量；MVP 阶段用户量不大，几百毫秒的冷启动延迟用户通常无感 (此时前端显示“对方正在输入...”)。

