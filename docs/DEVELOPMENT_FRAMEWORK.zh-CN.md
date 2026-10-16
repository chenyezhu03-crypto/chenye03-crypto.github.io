# 全球中文旅行文旅 · 产品框架（AI 协助整理）

> **来源说明**：本文档由「创始人想法 + AI 归纳」生成，供开发和迭代参考，  
> 不等于已全部实现。代码真相：`src/platform/manifest.ts`  
> 当前仓库 = **Web 原型**，优先把 **V1 跑通** 再谈 V2+。

> 与代码同步：`src/platform/refundRules.ts`  
> 扩展顺序建议 **V1 → V6**，但可随时按业务砍 scope。

## 总定位（固定）

- **名称**：全球中文旅行文旅小程序（Web 原型：`/travel`）
- **人群**：中国大陆用户 · 仅中文 · 不出海版 · 不做多语言
- **视角**：中国护照出境/境内旅行
- **属性**：工具引流 + 内容自生长 + 文化品牌 + 多元变现 + 长期 IP

## V1（进行中）— 工具 + 付费

| 模块 | 路由/代码 | 状态 |
|------|-----------|------|
| 全球盲盒抽签 | `/travel/spin`, `/travel/region` | 原型 |
| 目的地知识库 | `destinationKnowledge.ts`, 目的地详情页 | 原型 |
| AI 多目的地行程 | `/travel/custom`, `buildCustomTripGuide` | 原型 |
| 免费大纲预览 | `preview` 套餐, `/travel/guide` | 原型 |
| ¥5.99 适配测评 | `/travel/assessment` | 原型 |
| ¥19.99 Word 导出 | `premium` 套餐, `guidePaywall` | 原型 |
| 会员 | `/travel/mine`, `/travel/pricing` | 占位 |
| 退款/重生成 | `refundRules.ts` | 已写死 |
| 免责声明 | `PlatformDisclaimer` | 全局 |

**总入口**：`/travel/hub` · `platform/moduleRegistry.ts`

## V2 — UGC + 24h 状态 → `/travel/ugc`, 社区「24h动态」

## V2.5 — 频道社群 → `/travel/channels`

## V3 — 直播连麦 → `/travel/live`

## V3.5 — 季度四大赛事 → `/travel/contests`

## V4 — 助农/非遗/主题季 → `/travel/eco`

## V5 — 持证地陪撮合 → `/travel/guides`

## V6 — IP 宇宙（环环）→ `/travel/ip`

## 盈利模式（代码常量 `PLATFORM_FEES` + `V1_PRICING`）

1. 5.99 测评  
2. 19.99 Word  
3. 会员  
4–12. 见 `manifest.ts`（V2+）

## 绝对规则

见 `ABSOLUTE_RULES` in `manifest.ts`。

## AI 开发指引

1. 改价格/规则 → 只改 `src/platform/manifest.ts`  
2. 新增目的地知识 → `src/data/destinationKnowledgeEntries.ts`  
3. 新功能先挂 `RELEASE_PHASES` 状态，勿跳版本  
4. 所有付费路径：**先预览、后解锁**
