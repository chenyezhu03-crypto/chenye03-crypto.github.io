import { chromium } from 'playwright'
import { setTimeout as sleep } from 'node:timers/promises'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--start-maximized', '--disable-infobars'],
  slowMo: 55,
})

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'zh-CN',
})
const page = await context.newPage()

await page.goto(BASE + '/profile', { waitUntil: 'networkidle' })
await page.locator('input[autocomplete="name"]').fill('张三')
await page.locator('input[autocomplete="tel"]').fill('13800138000')
await page.locator('input[autocomplete="email"]').fill('zhangsan@example.com')
await page.getByPlaceholder('如：计算机 / 视觉传达').fill('计算机')
await page.locator('input[type="number"]').fill('4')
await page.getByRole('button', { name: '保存画像' }).click()
await sleep(600)

await page.goto(BASE + '/sources')
const checks = page.locator('.source-row')
const n = await checks.count()
for (let i = 0; i < n; i++) {
  const row = checks.nth(i)
  const label = await row.innerText()
  const box = row.locator('input[type="checkbox"]')
  const checked = await box.isChecked()
  if (label.includes('国内演示') && !checked) await box.check()
  if (label.includes('Remotive') && checked) await box.uncheck()
  if (label.includes('JSON') && checked) await box.uncheck()
}
await page.getByRole('button', { name: '清空后全量' }).click()
await page.waitForSelector('.report-box')
await sleep(800)

await page.goto(BASE + '/resumes')
await sleep(900)

await page.goto(BASE + '/jobs')
await page.waitForSelector('.job-row')
await sleep(900)

await page.goto(BASE + '/batch')
await page.waitForSelector('.queue-row')
await sleep(700)
await page.getByRole('button', { name: /投递选中/ }).click()
await page.waitForSelector('.report-box', { timeout: 60000 })
await sleep(1200)

await page.goto(BASE + '/applications')
await page.waitForSelector('.app-row')
await sleep(1400)

await browser.close()
console.log('DEMO_DONE')
