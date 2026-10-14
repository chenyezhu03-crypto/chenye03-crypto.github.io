import { chromium } from 'playwright'
import { setTimeout as sleep } from 'node:timers/promises'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized', '--disable-infobars'],
  slowMo: 80,
})

const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  locale: 'zh-CN',
})
const page = await context.newPage()

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await sleep(1200)

await page.getByRole('link', { name: '浏览岗位' }).click()
await page.waitForURL('**/jobs')
await sleep(900)

await page.locator('input[type="search"]').fill('前端')
await sleep(700)
await page.locator('input[type="search"]').fill('')
await sleep(500)

await page.getByRole('link', { name: '投递' }).first().click()
await page.waitForURL(/\/apply/)
await sleep(600)

await page.locator('input[autocomplete="name"]').fill('张三')
await page.locator('input[autocomplete="tel"]').fill('13800138000')
await page.locator('input[autocomplete="email"]').fill('zhangsan@example.com')
await page.getByPlaceholder('如：本科 · 计算机').fill('本科 · 计算机')
await page.getByPlaceholder('如：3 年').fill('3 年')
await page
  .getByPlaceholder('用几句话说明你为什么适合这个岗位。')
  .fill('我对前端工程化与设计系统有实践经验，希望加入云枢科技。')

await page.setInputFiles('input[type="file"]', {
  name: 'zhangsan-resume.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 demo resume'),
})
await sleep(600)

await page.getByRole('button', { name: '确认投递' }).click()
await page.waitForSelector('.success-panel')
await sleep(1000)

await page.getByRole('button', { name: '查看我的投递' }).click()
await page.waitForURL('**/applications')
await page.waitForSelector('.app-row')
await sleep(1500)

await browser.close()
console.log('DEMO_DONE')
