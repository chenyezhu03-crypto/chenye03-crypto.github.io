import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const OUT = '/opt/cursor/artifacts/screenshots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.brand-mark')
  await page.screenshot({ path: path.join(OUT, 'home-hero.png') })
  console.log('OK home')

  // profile
  await page.goto(BASE + '/profile')
  await page.locator('input[autocomplete="name"]').fill('张三')
  await page.locator('input[autocomplete="tel"]').fill('13800138000')
  await page.locator('input[autocomplete="email"]').fill('zhangsan@example.com')
  await page.getByPlaceholder('如：计算机 / 视觉传达').fill('计算机')
  await page.locator('input[type="number"]').fill('4')
  await page.getByRole('button', { name: '保存画像' }).click()
  await page.waitForSelector('.form-ok')
  console.log('OK profile')

  // sources: local only for stable e2e (disable remotive if flaky)
  await page.goto(BASE + '/sources')
  const checks = page.locator('.source-row input[type="checkbox"]')
  const count = await checks.count()
  for (let i = 0; i < count; i++) {
    const row = page.locator('.source-row').nth(i)
    const label = await row.innerText()
    const box = row.locator('input[type="checkbox"]')
    const checked = await box.isChecked()
    if (label.includes('国内演示') && !checked) await box.check()
    if (label.includes('Remotive') && checked) await box.uncheck()
    if (label.includes('JSON') && checked) await box.uncheck()
  }
  await page.getByRole('button', { name: '清空后全量' }).click()
  await page.waitForSelector('.report-box')
  await page.screenshot({ path: path.join(OUT, 'sources-report.png') })
  console.log('OK sources')

  // resumes page
  await page.goto(BASE + '/resumes')
  await page.waitForSelector('.resume-row')
  await page.screenshot({ path: path.join(OUT, 'resumes.png') })
  console.log('OK resumes')

  // jobs radar
  await page.goto(BASE + '/jobs')
  await page.waitForSelector('.job-row', { timeout: 20000 })
  await page.screenshot({ path: path.join(OUT, 'jobs-radar.png') })
  console.log('OK jobs')

  // single apply with auto resume
  await page.getByRole('link', { name: '智能投递' }).first().click()
  await page.waitForURL(/\/apply/)
  await page.waitForSelector('.intel-panel')
  await page.getByRole('button', { name: '确认投递' }).click()
  await page.waitForSelector('.success-panel')
  console.log('OK apply')

  // batch queue
  await page.goto(BASE + '/batch')
  await page.waitForSelector('.queue-row', { timeout: 20000 })
  await page.getByRole('button', { name: /投递选中/ }).click()
  await page.waitForSelector('.report-box', { timeout: 60000 })
  await page.screenshot({ path: path.join(OUT, 'batch-result.png') })
  console.log('OK batch')

  await page.goto(BASE + '/applications')
  await page.waitForSelector('.app-row')
  await page.screenshot({ path: path.join(OUT, 'my-applications.png') })
  console.log('OK applications')
  console.log('ALL_PASSED')
} catch (err) {
  await page.screenshot({
    path: path.join(OUT, 'e2e-failure.png'),
    fullPage: true,
  })
  console.error(err)
  process.exitCode = 1
} finally {
  await browser.close()
}
