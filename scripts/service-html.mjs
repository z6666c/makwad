// After the build: one static HTML file per service page, with its own title, description and canonical,
// so crawlers and link previews see the right text before JavaScript runs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const base = readFileSync('dist/index.html', 'utf8')
const pages = JSON.parse(readFileSync('src/service-pages.json', 'utf8'))
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
function page(path, title, description) {
  const url = `https://makwad.com${path}`
  return base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(description)}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
}
mkdirSync('dist/services', { recursive: true })
writeFileSync('dist/services/index.html', page('/services', 'خدماتنا: تصميم وبرمجة التطبيقات والمواقع والأنظمة | استوديو مكود', 'خدمات استوديو مكود في الرياض: تطبيقات الجوال، المواقع والمتاجر، أنظمة الإدارة، الهويات البصرية، المواد الدعائية، وحلول الذكاء الاصطناعي، بأسعار واضحة.'))
for (const p of pages) {
  mkdirSync(`dist/services/${p.slug}`, { recursive: true })
  writeFileSync(`dist/services/${p.slug}/index.html`, page(`/services/${p.slug}`, p.title, p.description))
}
console.log(`service pages: ${pages.length + 1}`)
