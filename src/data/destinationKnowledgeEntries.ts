import type { DestinationKnowledge } from '../lib/destinationKnowledge'

/** 已录入的完整知识库样例（其余目的地走 synthesize） */
export const KNOWLEDGE_BY_DESTINATION_ID: Record<string, DestinationKnowledge> = {
  singapore: {
    destinationId: 'singapore',
    visaForMainland: '中国公民持普通护照通常可免签入境 30 天（以 ICA 最新政策为准，从事工作/媒体等需另办签证）。',
    entryRequirements:
      '入境前 3 天内提交 SG Arrival Card；备返程机票、酒店订单、足够资金证明；禁止携带违禁品。',
    taboosAndSafety:
      '严禁 chewing gum 入境（医疗用途除外）；乱丢垃圾、吸烟区外吸烟罚款高；遵守多元宗教场所礼仪。',
    currencyAndPrices: '新加坡元 SGD；移动支付广泛，少量现金即可。餐饮人均 SGD 15–40，景点门票需预留税费。',
    bestSeason: '全年可游；6–8 月较热，11–1 月相对舒适。',
    hotspots: ['滨海湾金沙', '鱼尾狮公园', '圣淘沙', '牛车水', '樟宜机场'],
    localFood: ['海南鸡饭', '辣椒螃蟹', '叻沙', '肉骨茶', '咖椰吐司'],
    festivalsAndCulture: '春节、开斋节、屠妖节等多元节庆；留意公共假期人流。',
    pitfalls: '热门餐厅排队久需预约；地铁高峰拥挤；部分标价 ++ 需加服务税 GST。',
    difficultyLevel: 2,
    budgetRangeCny: '人均约 5k–12k/趟（不含机票）',
    updatedNote: '2026-Q1 整理 · 请以官方为准',
  },
  tokyo: {
    destinationId: 'tokyo',
    visaForMainland: '须提前办妥日本签证（单次/三年/五年等，按领区材料清单准备，以使馆通知为准）。',
    entryRequirements:
      '护照、签证页、入境卡/VJW 在线申报；可能询问行程与住宿；遵守携带品规定。',
    taboosAndSafety: '电车内勿大声通话；垃圾需分类；部分场所禁拍照；注意地震防灾提示。',
    currencyAndPrices: '日元 JPY；现金仍常用，Suica 等交通卡便利。餐饮人均 ¥1000–3000。',
    bestSeason: '3–4 月樱花、10–11 月红叶；夏季炎热，冬季较干冷。',
    hotspots: ['浅草寺', '上野/秋叶原', '新宿御苑', 'teamLab', '富士山一日'],
    localFood: ['寿司', '拉面', '天妇罗', '居酒屋', '便利店便当'],
    festivalsAndCulture: '花见、祭典、动漫文化；黄金周与新年住宿紧张。',
    pitfalls: '热门餐厅需预约；JR/地铁换乘复杂；退税规则以店铺为准。',
    difficultyLevel: 3,
    budgetRangeCny: '人均约 8k–18k/趟（不含机票）',
    updatedNote: '2026-Q1 整理 · 请以官方为准',
  },
  chengdu: {
    destinationId: 'chengdu',
    visaForMainland: '国内旅行：居民身份证即可；外籍人士按现行入境政策。',
    entryRequirements: '高铁/航空实名；部分景区（大熊猫基地等）建议提前预约。',
    taboosAndSafety: '饮食偏辣，肠胃敏感者注意；冬季湿冷；保管财物。',
    currencyAndPrices: '人民币；消费中等偏低，火锅人均约 80–150 元。',
    bestSeason: '3–5 月、9–11 月较舒适；夏季闷热。',
    hotspots: ['大熊猫基地', '宽窄巷子', '武侯祠', '都江堰/青城山'],
    localFood: ['火锅', '串串', '担担面', '兔头', '钟水饺'],
    festivalsAndCulture: '川剧变脸、茶馆文化；春节人流大。',
    pitfalls: '网红店排队久；周边一日游勿信低价无资质团。',
    difficultyLevel: 1,
    budgetRangeCny: '人均约 2k–5k/趟',
    updatedNote: '2026-Q1 整理',
  },
}
