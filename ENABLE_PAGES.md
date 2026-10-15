# 在线打开（和本地 http://127.0.0.1:4173/jobs 一样）

部署成功后，在浏览器直接访问（**无需 npm**）：

| 页面 | 地址 |
|------|------|
| 选岗助手 | **https://chenyezhu03-crypto.github.io/pick** |
| 岗位雷达 | **https://chenyezhu03-crypto.github.io/jobs** |
| 首页 | **https://chenyezhu03-crypto.github.io/** |

## 首次若显示 404（只需设置一次）

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **Deploy from a branch**
3. **Branch** 选 **`gh-pages`**，文件夹 **`/ (root)`**，保存
4. 等 1～3 分钟再刷新上面的链接

推送 `main` 后，Actions 会自动把网站发布到 `gh-pages` 分支。
