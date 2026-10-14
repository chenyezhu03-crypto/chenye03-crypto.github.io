import { chromium } from 'playwright'
import { setTimeout as sleep } from 'node:timers/promises'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized', '--disable-infobars'],
  slowMo: 70,
})

const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  locale: 'zh-CN',
})
const page = await context.newPage()

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await sleep(1000)

await page.getByRole('link', { name: '完善求职画像' }).click()
await page.waitForURL('**/profile')
await page.locator('input[autocomplete="name"]').fill('张三')
await page.locator('input[autocomplete="tel"]').fill('13800138000')
await page.locator('input[autocomplete="email"]').fill('zhangsan@example.com')
await page.getByPlaceholder('如：计算机 / 视觉传达').fill('计算机')
await page.locator('textarea').fill('主导过设计系统落地，熟悉中后台复杂表单与性能优化。')
await page.getByRole('button', { name: '保存画像' }).click()
await sleep(700)

await page.getByRole('link', { name: '去岗位雷达' }).click()
await page.waitForURL('**/jobs')
await page.getByRole('button', { name: '重新汇聚岗位' }).click()
await sleep(800)
await page.locator('.filters-dense .field').filter({ hasText: '学历门槛' }).locator('select').selectOption('本科')
await sleep(600)

await page.getByRole('link', { name: '智能投递' }).first().click()
await page.waitForURL(/\/apply/)
await page.waitForSelector('.intel-panel')
await sleep(900)
await page.setInputFiles('input[type="file"]', {
  name: 'zhangsan-resume.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 demo resume'),
})
await sleep(500)
await page.getByRole('button', { name: '确认投递' }).click()
await page.waitForSelector('.success-panel')
await sleep(900)
await page.getByRole('button', { name: '查看我的投递' }).click()
await page.waitForSelector('.app-row')
await sleep(1400)

await browser.close()
console.log('DEMO_DONE')
