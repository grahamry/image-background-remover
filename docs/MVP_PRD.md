# MVP PRD: 极简 AI 抠图 SaaS（出海第一版）

## 一、 产品定位与核心跑通目标

- **产品形态：** 单页 Web 应用 (Single Page Application)。
- **核心目标：** 跑通“用户访问 -> 传图 -> API 抠图 -> 扣除额度 -> 提示充值”的完整商业闭环。
- **数据策略：** **图片零存储**。图片在前端转为 `Buffer/Blob`，直接通过 Next.js API Route 发给 Remove.bg，拿回结果直接展示并提供下载。不接任何 S3 或 OSS，省钱且规避隐私合规问题。

## 二、 核心用户流 (User Flow)

1. **游客状态：** 用户进入首页，看到一个巨大的“上传图片”拖拽框。
2. **强制登录（出海防刷策略）：** 用户点击上传或拖拽图片后，如果未登录，立刻弹出 Clerk 登录框（拦截白嫖）。
3. **扣除额度（Credit System）：** 登录成功后，系统查询 Supabase 中该用户的额度。
   - *额度 > 0：* 放行，前端显示“正在施展 AI 魔法 (Loading...)”。
   - *额度 = 0：* 拦截，弹出提示：“Free credits used up. Please upgrade (演示阶段可以直接给个假按钮)”。
4. **内存级抠图：** 前端将图片发给你的后端 API，后端调用 Remove.bg，将处理好的去背图片传回前端。
5. **展示与下载：** 页面显示前后对比图（Before/After），提供一个 `Download HD` 按钮，用户点击直接保存到本地。

## 三、 页面与功能拆解 (开发任务清单)

#### 1. 首页 (Landing Page / Dashboard 合一)

- **Header (导航栏):** 左侧 Logo，右侧放 Clerk 的 `<UserButton />`（显示头像）和当前的“剩余 Credit 数量”。
- **Hero Section (主视觉):** 一句痛点文案，例如 "Remove Backgrounds in 3 Seconds. Zero Data Stored."
- **Upload Component (核心交互):**
  - 支持点击选择文件和拖拽上传。
  - 限制只能上传 `.png`, `.jpg`, `.jpeg`。
  - **老手避坑提示：** Vercel 的免费 Serverless API 对请求体有 **4.5MB 的大小限制**。前端必须加校验，大于 4MB 的图片直接报错提示 "File too large (Max 4MB)"，防止后端崩溃。

#### 2. 后端 API 路由 (Next.js App Router: `app/api/remove-bg/route.ts`)

这是你整个 MVP 的心脏。它需要做三件事：

- **鉴权与扣费：** 校验 Clerk 的 `userId`，去 Supabase 查额度，扣除 1 点额度。
- **中转请求：** 接收前端发来的图片 `FormData`，提取为内存 `Buffer`，附带你的 Remove.bg API Key，发起 POST 请求到 `https://api.remove.bg/v1.0/removebg`。
- **返回结果：** 拿到 Remove.bg 返回的二进制图片数据，设置响应头 `Content-Type: image/png`，直接作为 Response 吐回给前端。

#### 3. 数据库结构 (Supabase - 极简表)

你只需要在 Supabase 里建一张极简的表 `users_credits`（其实你拉的那个模板里应该自带了类似的 user 表，稍微改改就行）：

- `id` (主键)
- `user_id` (对应 Clerk 里的 ID，String，唯一约束)
- `credits` (Integer，默认给 3，作为免费体验额度)

## 四、 技术栈与部署指引

- **前端框架：** Next.js (App Router) + Tailwind CSS。
- **鉴权：** Clerk (已就绪)。
- **数据库：** Supabase (已就绪) + Drizzle ORM。
- **AI 引擎：** Remove.bg API (去官网注册个号，每个月免费送 50 次 API 调用，足够你本地测试了)。
- **部署：**
  1. 代码推送到 GitHub。
  2. 登录 Vercel，Import 项目。
  3. 把本地 `.env.local` 里的所有环境变量（Clerk, Supabase, Remove.bg Key）全部复制到 Vercel 的 Environment Variables 设置里。
  4. 点击 Deploy，等待 3 分钟。
