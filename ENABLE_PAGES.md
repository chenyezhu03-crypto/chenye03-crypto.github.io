# GitHub Pages 已停用

应产品要求，**不再通过 GitHub Pages 对外发布**。

- 已删除自动部署 workflow（原 `Deploy GitHub Pages`）。
- CI 仅做 `npm run build` 与 travel 冒烟测试（`.github/workflows/ci.yml`）。

本地或自建部署见 [docs/LOCAL_DEPLOY.zh-CN.md](./docs/LOCAL_DEPLOY.zh-CN.md)。

若站点此前已上线，可在仓库 **Settings → Pages** 中将 Source 设为 **None**，避免继续对外提供旧版 gh-pages 内容。
