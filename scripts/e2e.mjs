import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const OUT = '/opt/cursor/artifacts/screenshots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.brand-mark')
  await page.screenshot({ path: path.join(OUT, 'home-hero.png') })
  console.log('OK home')

  await page.getByRole('link', { name: '完善求职画像' }).click()
  await page.waitForURL('**/profile')
  await page.locator('input[autocomplete="name"]').fill('张三')
  await page.locator('input[autocomplete="tel"]').fill('13800138000')
  await page.locator('input[autocomplete="email"]').fill('zhangsan@example.com')
  await page.getByPlaceholder('如：计算机 / 视觉传达').fill('计算机')
  await page.getByRole('spinbutton', { name: '工作年限', exact: true }).fill('3')
  await page.getByRole('button', { name: '保存画像' }).click()
  await page.waitForSelector('.form-ok')
  await page.screenshot({ path: path.join(OUT, 'profile-saved.png') })
  console.log('OK profile')

  await page.getByRole('link', { name: '去岗位雷达' }).click()
  await page.waitForURL('**/jobs')
  await page.waitForSelector('.job-row')
  await page.getByRole('button', { name: '重新汇聚岗位' }).click()
  await page.waitForSelector('.job-row')
  await page.screenshot({ path: path.join(OUT, 'jobs-radar.png') })
  console.log('OK jobs')

  await page.getByRole('link', { name: '智能投递' }).first().click()
  await page.waitForURL(/\/apply/)
  await page.waitForSelector('.apply-form')
  await page.waitForSelector('.intel-panel')
  await page.setInputFiles('input[type="file"]', {
    name: 'zhangsan-resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 demo resume'),
  })
  await page.getByRole('button', { name: '确认投递' }).click()
  await page.waitForSelector('.success-panel')
  await page.screenshot({ path: path.join(OUT, 'apply-success.png') })
  console.log('OK apply')

  await page.getByRole('button', { name: '查看我的投递' }).click()
  await page.waitForURL('**/applications')
  await page.waitForSelector('.app-row')
  const text = await page.locator('.app-row').first().innerText()
  if (!text.includes('匹配') && !text.includes('角度')) {
    throw new Error('Application missing intel fields: ' + text)
  }
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
