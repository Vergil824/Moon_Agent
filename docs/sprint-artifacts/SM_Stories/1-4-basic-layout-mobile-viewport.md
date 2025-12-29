# Story 1.4: 品牌化基础布局与移动端导航

Status: Ready for Review

## Story

作为一名 **前端开发人员**，
我想要 **根据 Figma 设计实现品牌化的全局布局（包含顶部标题栏、底部导航栏和渐变背景容器）**，
以便 **为用户提供统一、沉浸式的“闺蜜式”导购视觉体验**。

## Acceptance Criteria

1. **全局容器 (Global Container):**

   - 实现全屏高度容器，背景使用 Figma 指定的渐变色：`bg-gradient-to-b from-[#fff5f7] to-[#faf5ff]`。
   - 确保在 iOS Safari 和微信浏览器中无滚动条抖动，隐藏水平溢出 (`overflow-x-hidden`)。

2. **顶部标题栏 (ChatHeader):**

   - 固定在顶部 (`sticky` 或 `absolute`)。
   - 背景色为纯白，带下边框 `border-[#e5e7eb]`。
   - 标题文字“满月 Moon”使用 `text-[#8b5cf6]`，字体大小 `18px`，加粗。
   - 包含底部阴影 `shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]`。

3. **底部导航栏 (BottomNav):**

   - 固定在底部，具有圆角顶部 (`rounded-tl-[15px] rounded-tr-[15px]`)。
   - 背景色为纯白，带顶部阴影 `shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]`。
   - 包含三个功能按钮（首页/对话、发现/订单、个人中心）。
   - 当前激活项（如首页）背景为 `bg-[#faf5ff]`，图标颜色匹配设计。

4. **响应式与适配:**
   - 适配 iPhone 14/15 等现代移动端视口 (393px 宽度)。
   - 确保底部导航栏避开移动端系统的“安全区域”(Safe Area)。

## Tasks / Subtasks

- [x] **视觉组件开发**
  - [x] 创建 `components/layout/ChatHeader.tsx`。
  - [x] 创建 `components/layout/BottomNav.tsx`。
  - [x] 更新 `app/layout.tsx` 以集成这些全局组件。
- [x] **样式与主题配置**
  - [x] 在 `tailwind.config.ts` 中添加自定义颜色（如 `brand-purple: #8b5cf6`）。
  - [x] 在 `globals.css` 中定义全局渐变类。
- [x] **交互基础**
  - [x] 使用 `next/link` 配置底部导航栏的路由跳转。
  - [x] 在 Zustand Store (`lib/store.ts`) 中记录当前的活动导航项。
- [x] **测试与验证**
  - [x] 验证在不同移动端模拟器下的布局表现。
  - [x] 确保 `viewport` 元数据禁止缩放以维持 H5 体验。

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Layout Hierarchy:** 充分利用 Next.js 的 `layout.tsx` 进行组件嵌套。
- **Styling:** 严格遵守 Figma 中的 Tailwind 颜色值和阴影参数。
- **Safe Areas:** 使用 `pb-[env(safe-area-inset-bottom)]` 处理底部适配。

### Technical Notes

- **Framer Motion:** 导航栏切换或页面加载时可添加轻微的淡入效果。
- **Lucide React:** 图标可使用 Lucide 库中的替代品，或直接导出 Figma 的 SVG。

### Project Structure Notes

- `moon-agent/components/layout/` (新目录，用于存放布局组件)
- `moon-agent/app/layout.tsx` (更新)
- `moon-agent/lib/store.ts` (更新)

### References

- [Source: docs/sprint-artifacts/stories.md#Story 1.4]
- [Figma Design: node-id=152:21](https://www.figma.com/design/tGvBvraowaAzvL1OSlaAAo/Cheng?node-id=152-21)
- [Source: docs/sprint-artifacts/architecture.md#2.1 全栈框架]

## Dev Agent Record

### Context Reference

- Story: docs/sprint-artifacts/SM_Stories/1-4-basic-layout-mobile-viewport.md
- Architecture: docs/sprint-artifacts/architecture.md

### Agent Model Used

Claude Opus 4.5 (Amelia Dev Agent)

### Completion Notes List

- ✅ Created ChatHeader component with sticky positioning, brand title "满月 Moon", and design-spec shadow
- ✅ Created BottomNav component with fixed bottom positioning, rounded top corners, safe area padding, and 3 navigation items
- ✅ Updated app/layout.tsx to integrate ChatHeader and BottomNav globally with proper flex layout
- ✅ Added useNavigationStore to Zustand for tracking active navigation tab
- ✅ Added brand-purple color alias to tailwind.config.ts
- ✅ Added global gradient classes (bg-page-gradient, header-shadow, nav-shadow) to globals.css
- ✅ Viewport metadata already configured with userScalable: false, maximumScale: 1
- ✅ All 32 tests passing for Story 1.4 components and store

### File List

- moon-agent/components/layout/ChatHeader.tsx (new)
- moon-agent/components/layout/ChatHeader.test.tsx (new)
- moon-agent/components/layout/BottomNav.tsx (new)
- moon-agent/components/layout/BottomNav.test.tsx (new)
- moon-agent/components/layout/index.ts (new)
- moon-agent/app/layout.tsx (modified)
- moon-agent/app/chat/page.tsx (modified - removed duplicate ChatHeader)
- moon-agent/app/chat/page.test.tsx (modified - updated tests for new layout architecture)
- moon-agent/lib/store.ts (modified)
- moon-agent/lib/store.test.ts (modified)
- moon-agent/tailwind.config.ts (modified)
- moon-agent/app/globals.css (modified)

### Change Log

- 2025-12-26: Story 1.4 implementation complete - Brand layout with ChatHeader, BottomNav, and navigation state management
- 2025-12-26: Removed duplicate ChatHeader from chat/page.tsx to use global layout
- 2025-12-26: Fixed ChatInput positioning - now fixed above BottomNav with gradient background
- 2025-12-26: Updated BottomNav per Figma design - icon-only buttons (MessageCircle, ShoppingCart, User), removed text labels
