# Story 1.2: Supabase 数据库表结构设计与部署

Status: ready-for-dev

## Story

作为一名 **后端开发人员**，
我想要 **在 Supabase 中创建 Users, Products 和 Chat Sessions 表**，
以便 **持久化存储用户画像、商品信息和对话历史，支持推荐算法运行**。

## Acceptance Criteria

- **Given** 拥有 Supabase 项目访问权限。
- **When** 执行 SQL 建表脚本。
- **Then** `products` 表创建成功，包含字段：`id`, `name`, `price`, `stock_status`, `size_available` (JSONB), `suitable_shapes` (Array), `tags` (Array)。
- **And** `users` 表创建成功，包含字段：`measurements` (JSONB), `body_shape`, `pain_points` (Array)。
- **And** `chat_sessions` 表创建成功，用于存储对话上下文。
- **And** 简单的 RLS (Row Level Security) 策略已启用（如：允许公开读取商品，仅用户本人读写自己的数据）。

## Tasks / Subtasks

- [ ] 参考 `architecture.md` 设计数据库 Schema。
- [ ] 编写 SQL 迁移脚本 (Migrations) 创建 `products`, `users`, `chat_sessions` 表。
- [ ] 为各表配置 Row Level Security (RLS) 策略。
  - `products`: Public Read-Only.
  - `users`: Authenticated User Read/Write Own Data.
  - `chat_sessions`: Authenticated User Read/Write Own Data.
- [ ] 插入 3-5 条测试商品数据（覆盖不同胸型）用于开发测试。
- [ ] 生成 TypeScript 类型定义 (`database.types.ts`) 并集成到项目中。

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Data Persistence:** Supabase (PostgreSQL).
- **Core Tables:**
  - `Products`: JSONB for flexible size availability, Arrays for matching logic.
  - `Users`: JSONB for measurements to allow schema evolution.
- **Security:** RLS is mandatory for all user-specific data.

### Project Structure Notes

- SQL migrations should be stored in `supabase/migrations` if using Supabase CLI, or documented in `docs/db-schema.sql`.
- Type definitions should be generated using `supabase gen types` and stored in `moon-agent/types/supabase.ts` or similar.

### References

- [Source: docs/sprint-artifacts/epics.md#Story 1.2]
- [Source: docs/sprint-artifacts/architecture.md#2.3 数据层 (Data Persistence)]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- supabase/migrations/ (optional)
- moon-agent/types/supabase.ts
