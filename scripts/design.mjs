// Full-page design captures of the live site in light and dark mode.
import { chromium, devices } from 'playwright'
import { mkdirSync } from 'node:fs'
const BASE = 'https://makwad.com'
mkdirSync('shots', { recursive: true })
const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  for (const [name, opts] of [['desk', { viewport: { width: 1440, height: 900 } }], ['mob', devices['iPhone 13']]]) {
    const ctx = await browser.newContext({ ...opts, colorScheme: scheme, locale: 'ar-SA' })
    const p = await ctx.newPage()
    for (const [path, tag] of [['/', 'home'], ['/login', 'login'], ['/privacy', 'privacy']]) {
      await p.goto(BASE + path, { waitUntil: 'networkidle' })
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500)
      if (tag === 'home') {
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) })
        await p.addStyleTag({ content: '.site-header{position:static!important}' })
        await p.waitForTimeout(600)
      }
      await p.screenshot({ path: `shots/design-${scheme}-${name}-${tag}.png`, fullPage: tag === 'home' })
    }
    await ctx.close()
  }
}
await browser.close()
