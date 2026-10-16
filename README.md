# 全球中文旅行文旅（主站）+ 投简

**主产品 · 文旅小程序 Web 版**：盲盒抽签、中国护照知识库、行程/Word/测评、社区与 V1–V6 模块原型。

| 入口 | 说明 |
|------|------|
| 文旅 Web | 本地 `npm run dev` → `/travel`（**不在 GitHub Pages 公开发布**） |
| 全部功能 | `/travel/hub` |
| 部署说明 | [`docs/LOCAL_DEPLOY.zh-CN.md`](./docs/LOCAL_DEPLOY.zh-CN.md) |
| 微信小程序壳 | [`miniprogram/README.md`](./miniprogram/README.md) |

---

## 投简 · 条件透视的智能简历代投

投简不是「黑盒海投机器人」，而是把岗位条件看清楚、把投递材料写对位的前端工作台。

## 产品特色

- **多源岗位汇聚**：演示级检索流水线，把官网 / 平台样本 JD 与国考、上海市考公务员职位样本汇聚到本地
- **条件透视**：从 JD / 职位表抽取学历、学位、专业、基层经历、政治面貌、经验、性别标注等结构字段
- **可解释匹配**：对照求职画像输出通过 / 接近 / 缺口与匹配分
- **自适应投递包**：同一画像面对不同岗位，自动改写自荐角度与强调点

> 演示数据保存在浏览器 `localStorage`（**2027 国考全量职位表**约 1.9 万条在 `public/data/guokao2027-positions.json`，运行时按需加载，不写入 localStorage）。更新 Excel 后可运行 `npm run import:guokao -- /path/to/27国考岗位表.xlsx` 重新生成 JSON。

> 真实抓取第三方需登录/反爬的平台不在本仓库范围内；企业社招样本在 `src/data/rawFeeds.ts`。

## 本地开发

**公考选岗助手（推荐）：**

```bash
npm install
npm run pick
```

浏览器会自动打开 `/pick`；同一 WiFi 下可用终端里打印的局域网地址。详见 [LOCAL.md](./LOCAL.md)。

完整工作台：

```bash
npm install
npm run dev
```

## 构建与自测

```bash
npm run build
npm run preview
npm run test:e2e
```

构建产物在 `dist/`，可直接用于 GitHub Pages。
