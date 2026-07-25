# chenye03-crypto.github.io

个人站点仓库，附带实用小工具。

## 上海市肺科医院公开预约信息爬虫

见 [`shsfkyy_appointment_crawler/README.md`](./shsfkyy_appointment_crawler/README.md)。

```bash
pip install -r shsfkyy_appointment_crawler/requirements.txt
python -m shsfkyy_appointment_crawler --print-summary
```

说明：只采集公开预约须知 / 科室 / 医生目录，**不做抢号或自动挂号**。
