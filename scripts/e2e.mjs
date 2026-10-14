import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'
const OUT = '/opt/cursor/artifacts/screenshots'

await mkdir(OUT, { recursive: true })
await mkdir('/tmp', { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.brand-mark')
  await page.screenshot({
    path: path.join(OUT, 'home-hero.png'),
    fullPage: false,
  })
  console.log('OK home')

  await page.getByRole('link', { name: '浏览岗位' }).click()
  await page.waitForURL('**/jobs')
  await page.waitForSelector('.job-row')
  await page.screenshot({
    path: path.join(OUT, 'jobs-list.png'),
    fullPage: false,
  })
  console.log('OK jobs')

  await page.getByRole('link', { name: '投递' }).first().click()
  await page.waitForURL(/\/apply/)
  await page.waitForSelector('.apply-form')

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

  await page.getByRole('button', { name: '确认投递' }).click()
  await page.waitForSelector('.success-panel')
  await page.screenshot({
    path: path.join(OUT, 'apply-success.png'),
    fullPage: false,
  })
  console.log('OK apply')

  await page.getByRole('button', { name: '查看我的投递' }).click()
  await page.waitForURL('**/applications')
  await page.waitForSelector('.app-row')
  const text = await page.locator('.app-row').first().innerText()
  if (!text.includes('张三') && !text.includes('高级前端')) {
    throw new Error('Application row missing expected content: ' + text)
  }
  await page.screenshot({
    path: path.join(OUT, 'my-applications.png'),
    fullPage: false,
  })
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
