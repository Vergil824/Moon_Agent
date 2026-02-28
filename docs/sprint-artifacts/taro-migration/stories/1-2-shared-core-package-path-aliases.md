# Story 1.2: 共享 core 包与路径别名

Status: review

## Story

As a developer,
I want a shared `packages/core` with aliases,
so that 业务模块可跨端复用 api/schemas/stores/hooks/utils。

## Acceptance Criteria

1. **core 包结构初始化**: 在项目中创建 `packages/core`（或在 `moon_agent_taro` 内建立类似的共享目录结构），并定义清晰的入口导出，包含：API client 存根、Zod schemas、Zustand stores、自定义 hooks 及通用 utils。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.2]
2. **路径别名配置**: 配置 `tsconfig.json` 和 Taro 构建配置，支持通过 `@core/*`（如 `@core/api`）进行模块导入，且在 H5、微信小程序和 Taro RN 中均能正常解析。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.2]
3. **工作区/依赖配置**: 在 `package.json` 中完成必要的工作区 (Workspaces) 或路径映射配置，确保构建系统能正确处理跨目录依赖。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.2]
4. **循环依赖检查**: 确保核心包设计遵循单向依赖原则，避免在多端复用过程中产生循环依赖或未解析模块错误。 [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.2]

## Tasks / Subtasks

- [x] **创建共享目录结构** (AC: 1)
  - [x] 在 `moon_agent_taro/src/` 下创建 `core/` 目录（或在根目录创建 `packages/core`）。
  - [x] 创建以下子目录：`api/`, `schemas/`, `stores/`, `hooks/`, `utils/`。
  - [x] 在每个子目录下创建 `index.ts` 并完成初步导出。
- [x] **配置路径别名** (AC: 2)
  - [x] 更新 `tsconfig.json` 中的 `paths` 字段。
  - [x] 更新 `config/index.ts` 中的 `alias` 配置，确保 Taro 构建时能识别。
- [x] **依赖与构建验证** (AC: 3)
  - [x] 在 `src/pages/index/index.tsx` 中尝试使用别名导入模块。
  - [x] 分别运行 `npm run dev:h5` 和 `npm run dev:weapp` 验证构建是否报错。
- [x] **依赖架构优化** (AC: 4)
  - [x] 制定核心包内部的导入规范，禁止子模块间交叉引用。

## Dev Notes

- **现有实现参考 (moon-agent)**:
  - 核心 API 与 Store: `lib/core/api.ts`, `lib/core/store.ts`, `lib/core/supabaseClient.ts`
- **技术规范**:
  - **API**: 使用适配多端的请求封装（Story 1.3 将深入）。
  - **Schemas**: 使用 `zod` 进行类型定义与校验。
  - **Stores**: 使用 `zustand` 进行跨端状态管理。
- **路径建议**: 推荐在 `moon_agent_taro` 内部维护 `src/core`，以简化 Taro 4 的构建链路，除非有强烈的跨项目复用需求。
- **架构参考**: 借鉴 `moon-agent/lib/core/` 的设计，但需适配 Taro 的生命周期与环境。 [Source: docs/sprint-artifacts/taro-migration/epics.md#FR2]

### Project Structure Notes

- **目标路径**: `moon_agent_taro/src/core/`
- **配置文件**:
  - `moon_agent_taro/tsconfig.json`
  - `moon_agent_taro/config/index.ts`
- **命名规范**: 导出文件使用小写，目录结构扁平化。

### References

- [Source: docs/sprint-artifacts/taro-migration/epics.md#Story 1.2]
- [Source: docs/sprint-artifacts/architecture.md#2.1 全栈框架]
- [Source: docs/sprint-artifacts/architecture.md#2.3 数据层]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- H5 build with @core imports: SUCCESS (651 modules transformed)
- Weapp build with @core imports: SUCCESS (108 modules transformed)

### Completion Notes List

- **AC 1 (core 包结构初始化)**: Created `src/core/` with submodules: api/, schemas/, stores/, hooks/, utils/, and main index.ts entry point
- **AC 2 (路径别名配置)**: Updated tsconfig.json with baseUrl and paths (@core, @core/\*), added alias config in config/index.ts
- **AC 3 (依赖与构建验证)**: Tested @core imports in pages/index/index.tsx, verified H5 and weapp builds succeed
- **AC 4 (循环依赖检查)**: Created src/core/README.md documenting dependency rules and import conventions

### File List

**New Files:**

- `moon_agent_taro/src/core/index.ts` - Main entry point
- `moon_agent_taro/src/core/api/index.ts` - API client stubs
- `moon_agent_taro/src/core/schemas/index.ts` - Type definitions
- `moon_agent_taro/src/core/stores/index.ts` - Zustand stores
- `moon_agent_taro/src/core/hooks/index.ts` - Custom hooks
- `moon_agent_taro/src/core/utils/index.ts` - Utility functions
- `moon_agent_taro/src/core/README.md` - Architecture documentation

**Modified Files:**

- `moon_agent_taro/tsconfig.json` - Added baseUrl and paths for @core alias
- `moon_agent_taro/config/index.ts` - Added alias configuration
- `moon_agent_taro/src/pages/index/index.tsx` - Test @core imports
- `moon_agent_taro/package.json` - Added zustand dependency

## Change Log

- 2026-01-04: Story implementation completed (Claude Opus 4.5)
