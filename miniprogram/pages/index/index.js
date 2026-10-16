/** 部署后改为你的 H5 域名，例如 GitHub Pages 自定义域 */
const H5_BASE = 'https://chenyezhu03-crypto.github.io/travel'

Page({
  data: {
    url: H5_BASE,
  },
  onLoad(query) {
    let url = H5_BASE
    if (query.path) {
      const path = decodeURIComponent(query.path)
      url = H5_BASE.replace(/\/travel\/?$/, '') + path
    }
    this.setData({ url })
  },
})
