# 订单管理系统

基于 Vue 3 + Vite + Element Plus + Supabase 的简易订单管理系统。

## 功能

- 用户注册 / 登录（Supabase Auth）
- 订单增删改查
- 订单状态管理（待处理 / 已完成 / 已取消）

## 本地开发

1. 复制 `.env` 并填入你的 Supabase 项目信息：
   ```
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的anon_key
   ```

2. 在 Supabase SQL 编辑器中执行 `supabase-setup.sql` 创建 orders 表。

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署

- 前端：推送到 GitHub 后，在 Vercel 中 Import 该仓库即可自动部署。
- 环境变量：在 Vercel 项目设置中配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。
