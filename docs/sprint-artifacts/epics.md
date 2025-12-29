# 满月 Moon - Epic Breakdown

## Overview

本项目旨在通过 AI Agent 解决女性内衣选购痛点，从身体诊断到商品推荐再到支付购买，提供全链路的“闺蜜式”导购体验。

## Epic List

- **Epic 1: 基础设施与用户账号系统 (Infrastructure & Auth)**: 环境搭建、数据库设计、BFF 连通性、微信社交登录。
- **Epic 2: 沉浸式对话与测量引导 (Immersive Chat & Measurement)**: 对话 UI、3D 动画测量引导、辅助数据采集。
- **Epic 3: 智能诊断引擎与可视化 (Diagnosis & Visualization)**: 胸型与痛点诊断、n8n 诊断计算、加载进度反馈。
- **Epic 4: 推荐算法与商城闭环 (Recommendation & Shopping)**: 精准 SQL 推荐、购物车管理、支付宝集成。
- **Epic 5: 用户中心与售后体系 (User Profile & Post-Sales)**: 订单追踪、售后申请、个人信息管理。

## Epic Detail

### Epic 1: 基础设施与用户账号系统

目标：确立技术栈（Next.js + Supabase + n8n），实现微信登录，为用户提供个性化数据持久化基础。

- Story 1.1: Next.js + Shadcn 初始化
- Story 1.2: Supabase 数据表设计
- Story 1.3: BFF 层与 n8n 连通
- Story 1.4: 底部导航栏与基础布局
- Story 1.5: 微信社交登录集成

### Epic 2: 沉浸式对话与测量引导

目标：建立“满月”人设，通过自然的 UI 交互和视觉引导获取精确的身体数据。

- Story 2.1: 对话界面优化
- Story 2.2: 3D 测量引导组件
- Story 2.3: 身高体重滑块
- Story 2.5: Zustand 聊天记录持久化
- Story 2.6: 全局流式对话管理与背景追更 (解决跨页中断问题)

### Epic 4: 推荐算法与商城闭环

目标：将诊断结果转化为购买力，打通从“想买”到“支付完成”的闭环。

- Story 4.1: n8n 推荐逻辑 (SQL)
- Story 4.2: 推荐理由动态展示
- Story 4.3: 购物车页面开发
- Story 4.4: 确认订单页面开发
- Story 4.5: 支付宝/微信支付集成

### Epic 5: 用户中心与售后体系

目标：提升复购率与信任感，提供完善的售后保障。

- Story 5.5: 个人中心与订单列表
- Story 5.6: 退换货流程支持
