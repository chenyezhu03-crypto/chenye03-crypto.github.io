# 本地运行与自建部署（不用 GitHub Pages）

产品**不在 GitHub 上对外发布**。代码可以私有托管，站点由你自己部署。

## 一键打开（Mac 可双击）

- **`启动全球中文旅行文旅.command`** — 开发模式，自动打开浏览器  
- **`生成旅行网页.command`** — **直接生成** `dist/` 静态站并预览  

或终端：

```bash
npm install
npm run travel          # 开发，热更新
npm run travel:build    # 生成 dist/ + 预览（= 直接生成网页文件）
```

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址：

- **`/`** — 官网单页（介绍 + 入口按钮）
- **`/travel`** — 应用内首页（盲盒 / 攻略流程）
- **`/travel-portal.html`** — 纯静态单页（`public/`，无需 React 路由时可单独部署）

## 生产构建

```bash
npm run build
```

静态文件在 `dist/`，可放到任意静态服务器（Nginx、OSS、微信云托管、自己的 VPS）。

本地预览构建结果：

```bash
npm run preview
```

## 微信小程序

1. 构建 H5 并部署到你**已备案**的 HTTPS 域名。
2. 修改 `miniprogram/pages/index/index.js` 里的 `H5_BASE` 为该域名下的 `/travel`。
3. 微信开发者工具导入 `miniprogram/`，配置 web-view 合法域名。

## 冒烟测试

```bash
npm run build && npm run preview -- --port 4173 &
BASE_URL=http://127.0.0.1:4173 npm run test:e2e:travel
```
