// Renders a local review build (VITE_PREVIEW=1) so changes can be checked before they go live.
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = 'http://localhost:4173/makwad'
mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const logs = []
async function page(viewport, mobile = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, locale: 'ar-SA', colorScheme: 'light' })
  const p = await ctx.newPage()
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`) })
  p.on('pageerror', (e) => logs.push('[pageerror] ' + e.message))
  return p
}
const settle = async (p, ms = 1200) => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(ms) }
const shot = async (p, name, opts = {}) => { try { await p.screenshot({ path: `shots/${name}.png`, ...opts }) } catch (e) { logs.push(`[shot ${name}] ${e.message}`) } }
const step = async (name, fn) => { try { await fn() } catch (e) { logs.push(`[step ${name}] ${e.message}`) } }

// Dashboard (sample data)
const d = await page({ width: 1440, height: 900 })
for (const tab of ['overview', 'finance']) {
  await step(tab, async () => {
    await d.goto(`${BASE}/preview?tab=${tab}`, { waitUntil: 'networkidle' }); await settle(d)
    await shot(d, `dash-${tab}`, { fullPage: tab !== 'leads' && tab !== 'projects' })
  })
}
await step('pricing-open', async () => {
  await d.goto(`${BASE}/preview?tab=pricing`, { waitUntil: 'networkidle' }); await settle(d)
  await d.locator('.pr-toggle').first().click(); await d.waitForTimeout(400)
  await d.locator('.pr-opt input[aria-label="السعر"]').first().fill('1800'); await d.waitForTimeout(300)
  await shot(d, 'dash-pricing-edit', { fullPage: true })
})
await step('quote-new', async () => {
  await d.goto(`${BASE}/preview?tab=quotes`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('button', { name: '+ عرض سعر جديد' }).click(); await d.waitForTimeout(400)
  await d.locator('#q-lead').selectOption({ label: 'سارة القحطاني · مؤسسة الريان' })
  const add = d.locator('.q-add select')
  await add.selectOption({ index: 5 }); await add.selectOption({ index: 8 }); await add.selectOption({ index: 10 })
  await d.locator('#q-disc').fill('500'); await d.getByText('إضافة ضريبة القيمة المضافة 15%').click()
  await d.waitForTimeout(400)
  await shot(d, 'dash-quote-form', { fullPage: true })
})
await step('quote-pdf', async () => {
  await d.goto(`${BASE}/preview?tab=quotes`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('button', { name: 'PDF' }).first().click(); await d.waitForTimeout(800)
  await shot(d, 'dash-quote-pdf')
  await d.emulateMedia({ media: 'print' }); await d.waitForTimeout(300)
  await d.pdf({ path: 'shots/quote-MK-2026-004.pdf', format: 'A4', printBackground: true }).catch((e) => logs.push('[pdf] ' + e.message))
  await d.emulateMedia({ media: 'screen' })
})
await step('lead-open', async () => {
  await d.goto(`${BASE}/preview?tab=leads`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('button', { name: 'التفاصيل' }).first().click(); await d.waitForTimeout(400)
  await shot(d, 'dash-lead-open')
})
await step('finance-tabs', async () => {
  await d.goto(`${BASE}/preview?tab=finance`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('tab', { name: 'الفواتير والدفعات' }).click(); await d.waitForTimeout(400)
  await d.locator('.fin .panel').last().screenshot({ path: 'shots/dash-finance-invoices.png' })
  await d.getByRole('tab', { name: 'ربحية المشاريع' }).click(); await d.waitForTimeout(400)
  await d.locator('.fin .panel').last().screenshot({ path: 'shots/dash-finance-profit.png' })
  await d.getByRole('button', { name: '+ مصروف' }).click(); await d.waitForTimeout(300)
  await d.locator('.fin .cp').screenshot({ path: 'shots/dash-finance-form.png' })
})
await step('mobile-finance', async () => {
  const mm = await page({ width: 390, height: 844 }, true)
  await mm.goto(`${BASE}/preview?tab=finance`, { waitUntil: 'networkidle' }); await settle(mm)
  await mm.screenshot({ path: 'shots/dash-mobile-finance.png', fullPage: true })
})
await step('invoice', async () => {
  await d.goto(`${BASE}/preview?tab=projects`, { waitUntil: 'networkidle' }); await settle(d)
  await d.locator('.inv-links .linkish').first().click(); await d.waitForTimeout(800)
  await shot(d, 'dash-invoice')
})
await step('coupon-new', async () => {
  await d.goto(`${BASE}/preview?tab=pricing`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('button', { name: '+ كود خصم جديد' }).click(); await d.waitForTimeout(300)
  await d.locator('#cp-code').fill('RAMADAN25'); await d.locator('#cp-val').fill('25')
  await d.locator('.cp').screenshot({ path: 'shots/dash-coupons.png' })
})
await step('client-quote', async () => {
  await d.goto(`${BASE}/preview?tab=asclient`, { waitUntil: 'networkidle' }); await settle(d)
  await d.getByRole('button', { name: 'عرض التفاصيل' }).first().click(); await d.waitForTimeout(800)
  await shot(d, 'dash-client-quote')
})
const m = await page({ width: 390, height: 844 }, true)
await step('mobile', async () => {
  await m.goto(`${BASE}/preview?tab=overview`, { waitUntil: 'networkidle' }); await settle(m)
  await shot(m, 'dash-mobile-overview')
  await m.goto(`${BASE}/preview?tab=quotes`, { waitUntil: 'networkidle' }); await settle(m)
  await shot(m, 'dash-mobile-quotes')
})

// Public site from the same build
const s = await page({ width: 1366, height: 860 })
await step('site', async () => {
  await s.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await settle(s, 2000)
  await shot(s, 'site-hero')
  for (const id of ['services', 'plans', 'estimate']) {
    const el = s.locator('#' + id); await el.scrollIntoViewIfNeeded(); await s.waitForTimeout(500)
    await el.screenshot({ path: `shots/site-${id}.png` })
  }
  await s.locator('#services').getByRole('button', { name: /احسب السعر/ }).nth(3).click(); await s.waitForTimeout(900)
  await s.locator('#estimate .est-feats label').nth(0).click(); await s.locator('#estimate .est-feats label').nth(2).click(); await s.waitForTimeout(300)
  await s.locator('#estimate').screenshot({ path: 'shots/site-estimate-ai.png' })
  await s.locator('.est-coupon input').fill('NOPE'); await s.locator('.est-coupon button').click(); await s.waitForTimeout(1500)
  await s.locator('#estimate .est-result').screenshot({ path: 'shots/site-coupon-bad.png' })
})
await step('site-mobile', async () => {
  await m.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await settle(m, 2000)
  await shot(m, 'site-mobile-hero')
  await m.locator('#estimate').scrollIntoViewIfNeeded(); await m.waitForTimeout(600)
  await shot(m, 'site-mobile-estimate')
})

writeFileSync('shots/console.txt', logs.join('\n') || 'no errors')
await browser.close()
