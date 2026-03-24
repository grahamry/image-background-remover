# SaaS Boilerplate

Next.js SaaS 模板，支持多租户、认证、计费、国际化等功能。

## 开发命令

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 启动开发服务器（Next.js + Spotlight） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm lint:fix` | 自动修复代码问题 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm db:generate` | 生成数据库迁移 |
| `pnpm db:migrate` | 执行数据库迁移 |
| `pnpm db:studio` | 打开 Drizzle Studio |

## 架构概览

- **app/**：Next.js App Router 页面和路由
- **components/**：可复用 UI 组件（基于 Radix UI + Shadcn）
- **features/**：业务功能模块（auth、billing、dashboard、landing、sponsors）
- **hooks/**：自定义 React Hooks
- **libs/**：工具库和配置
- **models/**：数据库 Schema 和 Drizzle ORM
- **locales/**：国际化（i18n）配置
- **types/**：TypeScript 类型定义
- **utils/**：通用工具函数

核心流程：
- 用户认证 → Clerk
- 数据库操作 → Drizzle ORM（PostgreSQL）
- 国际化 → next-intl
- 样式 → Tailwind CSS + Radix UI

## 代码规范

- TypeScript 严格模式（strict: true）
- ESLint + Prettier（@antfu/eslint-config）
- 提交规范：Conventional Commits（commitlint + cz）
- 测试：Vitest（单元）+ Playwright（E2E）
- Storybook：组件文档和测试

## 技术栈

- **框架**：Next.js 14 + React 18
- **样式**：Tailwind CSS 3 + Radix UI + Shadcn
- **数据库**：Drizzle ORM + PostgreSQL
- **认证**：Clerk
- **国际化**：next-intl
- **监控**：Sentry + Logtail
- **测试**：Vitest + React Testing Library + Playwright
- **代码质量**：ESLint + Husky + lint-staged

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公钥 |
| `CLERK_SECRET_KEY` | Clerk 密钥 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk 登录 URL |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk 注册 URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公钥 |
| `STRIPE_SECRET_KEY` | Stripe 密钥 |
| `SENTRY_AUTH_TOKEN` | Sentry 认证令牌 |
| `LOGTAIL_SOURCE_TOKEN` | Logtail 源令牌 |
