# 国内岗位爬取说明

投简现在默认**只要中国岗位**。

## 当前数据源

1. **腾讯官招**（`careers.tencent.com`）
2. **字节跳动官招**（`jobs.bytedance.com`）
3. **京东官招**（`zhaopin.jd.com`）
4. **美团官招**（`zhaopin.meituan.com`）
5. **网易官招**（`hr.163.com`）
6. **滴滴官招**（`talent.didiglobal.com`）
7. **阿里官招**（`campus-talent.alibaba.com`，CSRF + batch）
8. **蚂蚁集团官招**（`talent.antgroup.com` / `hrcareersweb.antgroup.com`）
9. **百度官招**（`talent.baidu.com`，form POST）
10. **米哈游官招**（`jobs.mihoyo.com` / `ats.openout.mihoyo.com`）
11. **顺丰官招**（校招 `campus.sf-express.com` + 社招 `hr.sf-express.com`）
12. **科大讯飞官招**（`iflytek.zhiye.com`）
13. **携程官招**（`careers.ctrip.com`）
14. **飞书 ATS 租户**：小米、蔚来、理想汽车、小鹏、智谱 AI、智元机器人、商汤、莉莉丝
15. **BOSS 开源样本 CSV**（[jhcoco/bosszp](https://github.com/jhcoco/bosszp)）
16. **国内细 JD 样本**（本地）

脚本：`npm run crawl`

## 还能扩但暂未稳定接入

| 来源 | 现状 |
| --- | --- |
| 快手 / 小红书 / B 站 / 拼多多 | 需登录、签名或接口 403 |
| 华为官招 | 公开列表目前几乎空/参数常变 |
| BOSS / 智联 / 前程无忧主站 | 强反爬，需登录态，本仓库不接 |

## GitHub 相关参考

| 项目 | 用途 |
| --- | --- |
| [boss-crawler-skill](https://github.com/zhansan379/boss-crawler-skill) | 详情 JD 抽学历/名校/技能 |
| [JobHunt-CLI](https://github.com/Eiliuy/JobHunt-CLI) | 大厂官招公开接口思路 |
| [job-pro](https://github.com/HA7CH/job-pro) | 多企业适配器端点清单 |
| [jhcoco/bosszp](https://github.com/jhcoco/bosszp) | 开源国内岗位 CSV |

## 不做

不接需要扫码/Cookie 登录的 BOSS、智联、前程无忧账号爬虫。有自有抓取结果用「JSON 导入」。
