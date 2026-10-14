# 国内岗位爬取说明

投简现在默认**只要中国岗位**。

## 当前数据源

1. **腾讯官招公开 API**（`careers.tencent.com`）
   - 列表 + 详情 `Requirement`（含学历/专业/经验/技能原文）
   - 脚本：`npm run crawl`
2. **BOSS 开源样本 CSV**（[jhcoco/bosszp](https://github.com/jhcoco/bosszp)）
   - 热门城市岗位，含学历/经验字段
3. **国内细 JD 样本**（本地生成）
   - 多城市多职能，专供条件透视演示

## GitHub 相关参考

| 项目 | 用途 |
| --- | --- |
| [boss-crawler-skill](https://github.com/zhansan379/boss-crawler-skill) | 详情 JD 抽学历/名校/技能 |
| [JobHunt-CLI](https://github.com/Eiliuy/JobHunt-CLI) | 大厂官招公开接口思路 |
| [jhcoco/bosszp](https://github.com/jhcoco/bosszp) | 开源国内岗位 CSV |

## 不做

不接需要扫码/Cookie 登录的 BOSS、智联、前程无忧账号爬虫。有自有抓取结果用「JSON 导入」。
