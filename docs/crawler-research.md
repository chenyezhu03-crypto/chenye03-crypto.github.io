# 国内岗位爬取说明

投简现在默认**只要中国岗位**。

## 当前数据源

1. **腾讯官招**（`careers.tencent.com`）列表 + 详情任职要求
2. **字节跳动官招**（`jobs.bytedance.com`，CSRF 后公开搜索，社招+校招）
3. **京东官招**（`zhaopin.jd.com` 公开列表）
4. **美团官招**（`zhaopin.meituan.com` 列表 + 详情）
5. **网易官招**（`hr.163.com` 社招/校招分页）
6. **滴滴官招**（`talent.didiglobal.com` 列表 + 详情）
7. **飞书 ATS 租户官招**（公开 CSRF + search）：小米、蔚来、理想汽车、小鹏、智谱 AI、智元机器人、商汤、莉莉丝
8. **BOSS 开源样本 CSV**（[jhcoco/bosszp](https://github.com/jhcoco/bosszp)）
9. **国内细 JD 样本**（本地，条件透视演示）

脚本：`npm run crawl`

## 还能扩但暂未稳定接入

| 来源 | 现状 |
| --- | --- |
| 阿里 / 快手 / 百度 / 小红书 / B 站 / 拼多多 | 需签名、登录或接口常变 |
| BOSS / 智联 / 前程无忧主站 | 强反爬，需登录态，本仓库不接 |
| 更多飞书/Moka 租户 | 可按 job-pro 适配器继续加 host |

## GitHub 相关参考

| 项目 | 用途 |
| --- | --- |
| [boss-crawler-skill](https://github.com/zhansan379/boss-crawler-skill) | 详情 JD 抽学历/名校/技能 |
| [JobHunt-CLI](https://github.com/Eiliuy/JobHunt-CLI) | 大厂官招公开接口思路 |
| [job-pro](https://github.com/HA7CH/job-pro) | 多企业适配器端点清单 |
| [jhcoco/bosszp](https://github.com/jhcoco/bosszp) | 开源国内岗位 CSV |

## 不做

不接需要扫码/Cookie 登录的 BOSS、智联、前程无忧账号爬虫。有自有抓取结果用「JSON 导入」。
