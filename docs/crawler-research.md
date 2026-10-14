# 国内岗位爬取说明

投简现在默认**只要中国岗位**。

## 当前数据源

1. **腾讯官招**（`careers.tencent.com`）列表 + 详情任职要求
2. **字节跳动官招**（`jobs.bytedance.com`，CSRF 后公开搜索，社招+校招）
3. **京东官招**（`zhaopin.jd.com` 公开列表）
4. **BOSS 开源样本 CSV**（[jhcoco/bosszp](https://github.com/jhcoco/bosszp)）
5. **国内细 JD 样本**（本地，条件透视演示）

脚本：`npm run crawl`

## 还能扩但暂未稳定接入

| 来源 | 现状 |
| --- | --- |
| 美团 / 阿里 / 小米 / 快手 / 网易 | 需签名、登录或接口常变 |
| BOSS / 智联 / 前程无忧主站 | 强反爬，需登录态，本仓库不接 |
| 更多大厂官招 | 可按 JobHunt / job-pro 思路继续加适配器 |

## GitHub 相关参考

| 项目 | 用途 |
| --- | --- |
| [boss-crawler-skill](https://github.com/zhansan379/boss-crawler-skill) | 详情 JD 抽学历/名校/技能 |
| [JobHunt-CLI](https://github.com/Eiliuy/JobHunt-CLI) | 大厂官招公开接口思路 |
| [jhcoco/bosszp](https://github.com/jhcoco/bosszp) | 开源国内岗位 CSV |

## 不做

不接需要扫码/Cookie 登录的 BOSS、智联、前程无忧账号爬虫。有自有抓取结果用「JSON 导入」。
