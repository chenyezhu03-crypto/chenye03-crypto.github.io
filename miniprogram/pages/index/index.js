/** 改为你自建 HTTPS 域名，例如 https://travel.example.com/travel */
const H5_BASE = 'https://YOUR-DOMAIN.example/travel'

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
