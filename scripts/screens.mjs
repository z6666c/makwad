// Captures screenshots of the live site for review. Runs in GitHub Actions on the "shots" branch.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = 'https://z6666c.github.io/satr'
mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })

async function page(viewport, mobile = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, locale: 'ar-SA', colorScheme: 'light' })
  return ctx.newPage()
}
async function settle(p) {
  await p.evaluate(() => document.fonts.ready)
  await p.addStyleTag({ content: '.shot-clean .site-header{position:static!important}' })
  await p.waitForTimeout(1500)
}

const d = await page({ width: 1366, height: 860 })
await d.goto(BASE + '/', { waitUntil: 'networkidle' }); await settle(d)
await d.screenshot({ path: 'shots/01-hero.png' })
await d.evaluate(() => document.documentElement.classList.add('shot-clean'))
for (const [id, name] of [['estimate', '02-estimator'], ['work', '03-work'], ['why', '04-why'], ['contact', '06-contact']]) {
  const el = d.locator('#' + id)
  await el.scrollIntoViewIfNeeded(); await d.waitForTimeout(600)
  await el.screenshot({ path: `shots/${name}.png` })
}
// Use the estimator: pick options and send them to the contact form
await d.locator('#estimate').scrollIntoViewIfNeeded()
await d.getByText('جوال وويب', { exact: true }).first().click()
await d.getByText('لوحة تحكم للإدارة').click()
await d.getByText('خرائط وتتبع مباشر').click()
await d.waitForTimeout(400)
await d.locator('#estimate').screenshot({ path: 'shots/02b-estimator-choices.png' })
await d.getByRole('button', { name: 'اطلب عرضاً بهذه التفاصيل' }).click()
await d.waitForTimeout(1500)
await d.locator('#contact').screenshot({ path: 'shots/05-contact-prefilled.png' })

const l = await page({ width: 1366, height: 860 })
await l.goto(BASE + '/login', { waitUntil: 'networkidle' }); await settle(l)
await l.screenshot({ path: 'shots/07-login.png' })
await l.goto(BASE + '/privacy', { waitUntil: 'networkidle' }); await settle(l)
await l.screenshot({ path: 'shots/08-privacy.png' })

const m = await page({ width: 390, height: 844 }, true)
await m.goto(BASE + '/', { waitUntil: 'networkidle' }); await settle(m)
await m.screenshot({ path: 'shots/09-mobile-hero.png' })
await m.evaluate(() => window.scrollTo(0, 700)); await m.waitForTimeout(500)
await m.screenshot({ path: 'shots/09b-mobile-hero-2.png' })
await m.locator('#estimate').scrollIntoViewIfNeeded(); await m.waitForTimeout(600)
await m.screenshot({ path: 'shots/10-mobile-estimator.png' })
await m.locator('#work').scrollIntoViewIfNeeded(); await m.waitForTimeout(600)
await m.screenshot({ path: 'shots/11-mobile-work.png' })

// Brand files: render each SVG with the web fonts loaded
import { readdirSync, readFileSync } from 'node:fs'
const bp = await page({ width: 1600, height: 1200 })
for (const f of readdirSync('brand').filter((n) => n.endsWith('.svg'))) {
  const svg = readFileSync('brand/' + f, 'utf8').replace(/<style>@import[^<]*<\/style>/, '')
  await bp.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@800&family=Readex+Pro:wght@400&display=swap"></head><body style="margin:0;background:transparent">${svg}</body></html>`, { waitUntil: 'networkidle' })
  await bp.evaluate(() => document.fonts.ready); await bp.waitForTimeout(500)
  await bp.locator('svg').first().screenshot({ path: 'shots/brand-' + f.replace('.svg', '.png'), omitBackground: true })
}

// Social banners
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
for (const [w, h, n] of [[1500, 500, 'x-header'], [1584, 396, 'linkedin-cover'], [1080, 1080, 'instagram-post'], [1080, 1920, 'story'], [1920, 1080, 'presentation']]) {
  const pg = await page({ width: w, height: h })
  await pg.goto(pathToFileURL(resolve('brand/banner.html')).href + `?w=${w}&h=${h}`, { waitUntil: 'networkidle' })
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600)
  await pg.locator('#b').screenshot({ path: `shots/banner-${n}.png` })
}

await browser.close()
console.log('done')
