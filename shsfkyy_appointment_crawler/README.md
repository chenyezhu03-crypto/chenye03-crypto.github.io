# 上海市肺科医院公开预约信息爬虫

采集**同济大学附属上海市肺科医院（上海市肺科医院）**的公开预约相关信息：

- 预约须知（渠道、放号时间、规则）
- 科室列表
- 医生目录（姓名 / 职称 / 科室 / 参考问诊价）
- 可选：聚合站上的出诊备注

## 重要说明

| 能做 | 不能做 |
| --- | --- |
| 抓公开预约攻略与医生目录 | 官方实时号源抢号 |
| 导出 JSON / CSV 方便查阅 | 绕过 WAF / 验证码 |
| 低频、带间隔的礼貌请求 | 自动挂号下单 |

官方渠道（医院官网、上海医联 `yuyue.shdc.org.cn`、微信/支付宝）通常有反爬与登录校验；本工具**不**实现这些流程。实际挂号请使用：

1. 微信公众号「上海市肺科医院」/「上海市肺科医院订阅号」（约每日 7:00 放号）
2. 支付宝「上海市肺科医院」小程序
3. 上海医联预约平台 <https://yuyue.shdc.org.cn/>（约每日 7:30 放号）
4. 电话：400-820-3137

数据来源为公开聚合信息（有来医生等），可能滞后，**以医院官方渠道为准**。

## 安装

```bash
pip install -r shsfkyy_appointment_crawler/requirements.txt
```

## 使用

在仓库根目录执行：

```bash
# 基础：预约须知 + 科室 + 医生目录
python -m shsfkyy_appointment_crawler --print-summary

# 更快：不遍历科室页
python -m shsfkyy_appointment_crawler --list-only

# 附带前 N 位医生的出诊备注（仍非官方实时号源）
python -m shsfkyy_appointment_crawler --with-schedule --schedule-limit 10
```

输出默认写入 `./output/`：

- `appointment_info.json` — 完整结果
- `departments.csv` — 科室表
- `doctors.csv` — 医生表

## 合规建议

- 仅供个人查阅 / 研究，勿高频刷接口
- 勿用于黄牛抢号或转售号源
- 遵守目标站点服务条款与当地法规
