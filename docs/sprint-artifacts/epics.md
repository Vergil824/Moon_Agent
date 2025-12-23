---
stepsCompleted:
  - step-01-validate-prerequisites
inputDocuments:
  - docs/sprint-artifacts/prd.md
  - docs/sprint-artifacts/architecture.md
  - docs/sprint-artifacts/UX.md
---

# 撑撑姐 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 撑撑姐, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: 欢迎与破冰对话：建立“满月 Moon”人设，引导用户开始测量流程。
FR2: 身体数据采集（尺码）：通过交互式引导获取上下胸围数据，支持分支逻辑（已知/不知道）。
FR3: 测量视觉引导：展示 3D 灰模动画（直立测下围、90 度弯腰测上围）。
FR4: 辅助信息采集：收集身高、体重、腰围，用于 BMI 计算及算法纠偏。
FR5: 胸型诊断交互：通过抽象 3D 图标引导用户选择最接近的胸型（圆盘、纺锤、半球）。
FR6: 痛点诊断交互：展示带插画的卡片式多选网格，识别核心痛点（压胸、空杯、跑杯等）。
FR7: 对话意图识别与参数提取：利用 LLM 提取用户输入的数据（如上围 88 下围 73）。
FR8: 智能推荐算法：基于上下胸围差计算初始尺码，结合身高/体重/胸型/痛点进行 SQL 过滤。
FR9: 选品逻辑：仅推荐支持一件代发、7 天无理由退换且高 DSR 评分的商品。
FR10: 3D 身体蓝图报告：生成哑光灰色 3D 人台模型，标注关键分析点（如底盘宽、真实尺码）。
FR11: 游戏化与增长机制：生成深度报告作为社交货币，包含限时礼包和进度提示。
FR12: 边界对话处理（Guardrails）：识别非内衣相关话题并优雅回绝。

### NonFunctional Requirements

NFR1: 隐私保护：身体数据需加密存储，仅用于推荐计算。
NFR2: 响应性能：对话响应 1-2 秒内完成，加载动效需流畅无白屏。
NFR3: 移动端适配：重点优化微信 H5 环境下的 3D 资源加载与 UI 布局。
NFR4: BFF 架构安全性：通过 Next.js API Route 转发，隐藏 n8n Webhook 和 LLM Key。

### Additional Requirements

- **项目启动模板**: 使用 Next.js 14+ (App Router) 结合 Tailwind CSS 和 Shadcn/UI。
- **状态管理**: Zustand (客户端) 与 React Query (服务器端数据同步)。
- **后端架构**: n8n 负责逻辑编排，Supabase PostgreSQL 存储商品、用户画像和对话会话。
- **UI/UX 规范**: 紫罗兰渐变色系 (#A855F7 到 #7C3AED)，卡片式层级设计。
- **动画实现**: Framer Motion 负责丝滑动效，GIF/WebP 序列帧作为 3D 降级方案。
- **数据库设计**: 商品表必须支持 JSONB (size_available) 和 Array (suitable_shapes) 字段。

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
