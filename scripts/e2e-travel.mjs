import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

try {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: /纠结去哪/ })
  console.log('OK portal home')

  await page.getByRole('link', { name: '全部功能' }).first().click()
  await page.waitForURL('**/travel/hub**')
  console.log('OK hub from portal')

  await page.getByRole('link', { name: /全球盲盒抽签/ }).click()
  await page.waitForURL('**/travel/spin**')
  console.log('OK spin')

  await page.goto(`${BASE}/travel/ugc`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: '攻略创作 & 交易' })
  console.log('OK ugc')

  console.log('TRAVEL_SMOKE_PASSED')
} catch (err) {
  console.error(err)
  process.exitCode = 1
} finally {
  await browser.close()
}
