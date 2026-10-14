# 岗位爬取与条件抽取：开源参考

你提到的「人家 App / 小程序怎么挖」，GitHub 上常见做法如下。投简对齐的是**解析层**，不接需登录的 BOSS/智联账号爬虫。

## 相关仓库 / Skill

| 项目 | 做法 | 我们借鉴什么 |
| --- | --- | --- |
| [boss-crawler-skill](https://github.com/zhansan379/boss-crawler-skill) | 详情 JD 为准；抽学历/经验/薪资/技能；985/211/双一流当硬门槛 | 权威 JD 抽取、名校硬门槛、必须/优先区分 |
| [agent-hunt](https://github.com/LLM-X-Factorer/agent-hunt) | 多平台采集 + LLM 结构化（学历/经验/技能/行业） | 双语字段、结构化 schema |
| [FindJobs-Agent](https://github.com/he-yufeng/FindJobs-Agent) | 企业官网爬虫 + LLM 抽学历/专业/技能分 | 技能重要性、匹配流水线 |
| [eatmoreduck/boss-zhipin-scraper](https://github.com/eatmoreduck/boss-zhipin-scraper) | Chrome CDP + 详情页 | 需登录态，本仓库不集成 |
| [job-posting-structure](https://github.com/NLxResearchHub/job-posting-structure) | required vs preferred 教育/专业/经验 | schema 分层 |

## 投简当前策略

1. **公开源爬取**：Remotive / Arbeitnow / Himalayas → `npm run crawl`
2. **国内细 JD 样本**：按 BOSS/智联详情文风写全学历、专业、经验、性别标注、必备/加分技能
3. **规则透视引擎**：`src/lib/jdParser.ts` 抽必须/优先/名校/技能/语言/办公方式
4. **可替换**：以后可把 LLM 解析接到同一 `StructuredRequirements` schema

## 不做什么

不集成需要 Cookie/扫码登录的 BOSS、智联、前程无忧账号爬虫（违规风险高、易失效）。若你有自有抓取结果，用「数据源 → JSON 导入」即可。
