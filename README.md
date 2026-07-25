# chenye03-crypto.github.io

个人站点仓库，附带实用小工具。

## 网页：肺科医院公开预约信息

打开仓库根目录的 [`index.html`](./index.html)（GitHub Pages 合并后也可访问站点首页）。

本地预览：

```bash
python -m http.server 8765
# 浏览器打开 http://127.0.0.1:8765/
```

## 爬虫 CLI

见 [`shsfkyy_appointment_crawler/README.md`](./shsfkyy_appointment_crawler/README.md)。

```bash
pip install -r shsfkyy_appointment_crawler/requirements.txt
python -m shsfkyy_appointment_crawler --print-summary
```

说明：只采集公开预约须知 / 科室 / 医生目录，**不做抢号或自动挂号**。
