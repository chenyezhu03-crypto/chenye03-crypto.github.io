# chenye03-crypto.github.io

个人站点仓库，附带实用小工具。

## 网页：肺科医院公开预约信息

打开仓库根目录的 [`index.html`](./index.html)：

- 放号倒计时 + 浏览器提醒 / 日历提醒
- 一键跳转医联预约页、电话预约；微信/支付宝复制名称快速搜索
- 科室医生检索

本地预览：

```bash
python web/build.py          # 从 data/appointment.json 重新生成页面
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
