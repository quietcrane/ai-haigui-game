# AI海龟汤 - 部署指南

## 概述

本文档详细介绍如何将 AI海龟汤游戏 部署到生产环境。

## 技术架构

┌─────────────────┐     ┌─────────────────┐
│   用户浏览器    │────▶│   前端 (Vite)   │
│   (静态页面)    │◀────│   (托管在 CDN)  │
└─────────────────┘     └─────────────────┘
                               │
                               ▼ (API 请求)
                        ┌─────────────────┐
                        │  后端 (Express) │
                        │   (Node.js)     │
                        └─────────────────┘
                               │
                               ▼ (AI 调用)
                        ┌─────────────────┐
                        │  DeepSeek API   │
                        └─────────────────┘

---

## 环境要求

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 推荐使用 LTS 版本 |
| npm | >= 9.0.0 | 随 Node.js 一起安装 |

---

## 项目结构

```
ai-haigui-game/
├── src/                    # 前端源代码
│   ├── api/               # API 调用
│   ├── components/        # React 组件
│   ├── data/              # 故事数据
│   ├── pages/             # 页面组件
│   └── ...
├── server/                # 后端服务
│   ├── index.js          # Express 服务入口
│   ├── .env              # 环境变量（敏感）
│   └── package.json      # 后端依赖
├── dist/                  # 前端构建产物
├── .env                   # 前端环境变量
├── .env.example          # 前端环境变量示例
├── vite.config.ts        # Vite 配置
└── package.json          # 前端依赖
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai-haigui-game
```

### 2. 安装依赖

```bash
# 前端依赖
npm install

# 后端依赖
cd server
npm install
```

### 3. 配置环境变量

#### 后端配置（必须）

创建 `server/.env` 文件：

```env
# 后端端口
PORT=3000

# DeepSeek API Key（必须）
DEEPSEEK_API_KEY=sk-your-api-key-here

# API 配置（可选，有默认值）
API_BASE_URL=https://api.deepseek.com
MODEL=deepseek-chat
```

> ⚠️ **重要**：API Key 必须从 [DeepSeek 开放平台](https://platform.deepseek.com) 获取

### 4. 本地开发

```bash
# 终端1 - 启动后端
cd server
npm run dev

# 终端2 - 启动前端
npm run dev
```

访问 http://localhost:5173 测试游戏。

### 5. 构建生产版本

```bash
npm run build
```

构建完成后，`dist/` 目录包含所有静态文件。

---

## 部署选项

### 选项 A：Vercel（推荐）

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录：
```bash
vercel login
```

3. 部署：
```bash
vercel
```

按照提示完成部署。

#### 注意事项

部署到 Vercel 时，需要修改 `vite.config.ts`（删除代理配置）：

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 删除 server.proxy 配置
})
```

同时修改 `src/api/api.ts` 中的 API 地址：

```typescript
// 改为直接调用后端地址（需要单独部署后端）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-backend.com'
```

---

### 选项 B：Netlify

1. 登录 Netlify
2. 拖拽 `dist` 文件夹到部署区域
3. 完成！

---

### 选项 C：自建服务器

#### 前端部署

```bash
# 构建
npm run build

# 使用 Nginx
# 将 dist/ 目录内容复制到 Nginx html 目录
```

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 后端部署

```bash
cd server
npm install
npm start
```

使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start index.js --name haigui-server
```

---

## 环境变量说明

### 前端环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 否 | `http://localhost:3000` | 后端 API 地址 |

### 后端环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | `3000` | 服务端口 |
| `DEEPSEEK_API_KEY` | 是 | - | DeepSeek API Key |
| `API_BASE_URL` | 否 | `https://api.deepseek.com` | API 端点 |
| `MODEL` | 否 | `deepseek-chat` | 模型名称 |

---

## 故障排除

### 1. 前端无法连接后端

**症状**：`Failed to fetch` 错误

**解决方案**：
1. 确认后端服务正在运行
2. 检查防火墙/安全组是否开放端口
3. 如果使用云服务器，确认端口已放行

### 2. AI 返回答案不准确

**症状**：AI 回答"是/否/无关"以外的答案

**解决方案**：
1. 检查 `server/index.js` 中的 Prompt 是否正确
2. 调整 `temperature` 参数（建议 0.1-0.3）
3. 查看后端日志中的 AI 原始回复

### 3. 构建失败

**症状**：`npm run build` 报错

**解决方案**：
1. 确保 Node.js 版本 >= 18
2. 删除 `node_modules` 重新安装：
```bash
rm -rf node_modules
npm install
```

---

## 相关文档

- [技术设计](./TECH_DESIGN.md)
- [产品需求](./PRD.md)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Vercel 部署文档](https://vercel.com/docs)

---

## License

MIT