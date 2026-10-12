// Cross-browser smoke test of the live site + a few security probes against the backend.
import { chromium, firefox, webkit, devices } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { ConvexHttpClient } from 'convex/browser'

const BASE = 'https://z6666c.github.io/makwad'
mkdirSync('shots', { recursive: true })
const report = []
const say = (s) => { report.push(s); console.log(s) }

const targets = [
  ['chrome-desktop', chromium, { viewport: { width: 1366, height: 860 } }],
  ['firefox-desktop', firefox, { viewport: { width: 1366, height: 860 } }],
  ['safari-desktop', webkit, { viewport: { width: 1440, height: 900 } }],
  ['iphone-safari', webkit, devices['iPhone 13']],
  ['android-chrome', chromium, devices['Pixel 7']],
  ['ipad-safari', webkit, devices['iPad (gen 7)']],
]
for (const [name, type, opts] of targets) {
  const browser = await type.launch()
  const ctx = await browser.newContext({ ...opts, locale: 'ar-SA' })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  try {
    const t0 = Date.now()
    await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 })
    await p.waitForSelector('#services .svc', { timeout: 20000 })
    const ms = Date.now() - t0
    const cards = await p.locator('#services .svc').count()
    await p.screenshot({ path: `shots/${name}-home.png` })
    await p.locator('#estimate').scrollIntoViewIfNeeded()
    await p.locator('#estimate .est-feats label').first().click()
    const total = await p.locator('#estimate .est-price b').innerText()
    await p.locator('#estimate').screenshot({ path: `shots/${name}-estimate.png` })
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    for (const path of ['/login', '/privacy', '/dashboard']) {
      const r = await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
      await p.waitForTimeout(800)
      const h = await p.locator('h1, h2, h3').first().innerText().catch(() => '?')
      say(`  ${name} ${path}: HTTP ${r?.status()} · "${h.slice(0, 40)}"`)
    }
    await p.screenshot({ path: `shots/${name}-dashboard-guest.png` })
    say(`OK ${name}: loaded in ${ms}ms, ${cards} service cards, calculator total ${total.replace(/\s+/g, ' ')}, horizontal overflow ${overflow}px, errors: ${errs.length ? errs.join(' | ') : 'none'}`)
  } catch (e) {
    say(`FAIL ${name}: ${e.message.split('\n')[0]} · errors: ${errs.join(' | ')}`)
  }
  await browser.close()
}

// Security probes: an anonymous visitor must not reach private data or admin actions.
const c = new ConvexHttpClient('https://calm-mallard-903.eu-west-1.convex.cloud')
const probe = async (label, fn) => {
  try { say(`SEC ${label}: ${JSON.stringify(await fn()).slice(0, 140)}`) } catch (e) { say(`SEC ${label}: rejected (${e.message.split('\n')[0].slice(0, 100)})`) }
}
await probe('listLeads anonymous', () => c.query('app:listLeads', {}))
await probe('listProjects anonymous', () => c.query('app:listProjects', {}))
await probe('listProjects asEmail anonymous', () => c.query('app:listProjects', { asEmail: 'alrashidi7amad@gmail.com' }))
await probe('users.listUsers anonymous', () => c.query('users:listUsers', {}))
await probe('quotes.list anonymous', () => c.query('quotes:list', {}))
await probe('quotes.mine anonymous', () => c.query('quotes:mine', { asEmail: 'alrashidi7amad+client@gmail.com' }))
await probe('coupons.list anonymous', () => c.query('coupons:list', {}))
await probe('activity anonymous', () => c.query('app:listActivity', {}))
await probe('settings.update anonymous', () => c.mutation('settings:update', { whatsapp: '966500000001', whatsappMessage: 'x', phone: '', email: '', address: '', hours: '' }))
await probe('updatePricing anonymous', () => c.mutation('settings:updatePricing', { pricing: null }))
await probe('setRole anonymous', () => c.mutation('users:setRole', { email: 'attacker@example.com', role: 'admin' }))
await probe('coupons.save anonymous', () => c.mutation('coupons:save', { code: 'FREE90', kind: 'percent', value: 90, active: true }))
await probe('seed (internal) anonymous', () => c.mutation('app:seedDemoClient', { email: 'x@example.com', name: 'x' }))
await probe('submitLead XSS payload', () => c.mutation('app:submitLead', { name: '<img src=x onerror=alert(1)>', email: 'sec-test@example.com', types: [], plan: '', message: '<script>alert(1)</script> security test, safe to delete' }))
for (let i = 0; i < 4; i++) await probe(`submitLead flood #${i + 2}`, () => c.mutation('app:submitLead', { name: 'flood test', email: 'sec-test@example.com', types: [], plan: '', message: 'rate limit test, safe to delete' }))
await probe('coupon wrong code', () => c.query('coupons:check', { code: 'DOESNOTEXIST' }))

writeFileSync('shots/report.txt', report.join('\n'))
