// Renders the social share image and the iPhone home-screen icon after the build.
// Uses the Chrome that GitHub's Ubuntu runners already have installed.
import { chromium } from 'playwright-core'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const dist = resolve('dist')
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

await page.goto(pathToFileURL(resolve(dist, 'og.html')).href, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.locator('.card').screenshot({ path: resolve(dist, 'og.png') })

await page.setViewportSize({ width: 180, height: 180 })
await page.setContent(`<html><body style="margin:0;background:#10201B"><img src="${pathToFileURL(resolve(dist, 'favicon.svg')).href}" width="180" height="180" style="display:block"></body></html>`)
await page.waitForTimeout(300)
await page.screenshot({ path: resolve(dist, 'apple-touch-icon.png') })

await browser.close()
console.log('share images written')
