// After the build: one static HTML file per page in each language, with its own <html lang/dir>, title,
// description, canonical and hreflang links, so crawlers and link previews see the right text before JavaScript runs.
// Arabic lives at the root (/services/...), English under /en (/en/services/...).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const base = readFileSync('dist/index.html', 'utf8')
const pages = JSON.parse(readFileSync('src/service-pages.json', 'utf8'))
const pagesEn = JSON.parse(readFileSync('src/service-pages-en.json', 'utf8'))
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const SITE = 'https://makwad.com'
const enPath = (p) => (p === '/' ? '/en' : `/en${p}`)

function page(path, lang, title, description) {
  const arUrl = SITE + path
  const enUrl = SITE + enPath(path)
  const url = lang === 'en' ? enUrl : arUrl
  let html = base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(description)}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
    .replace(/<link rel="alternate" hreflang="ar" href="[^"]*"/, `<link rel="alternate" hreflang="ar" href="${arUrl}"`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"/, `<link rel="alternate" hreflang="en" href="${enUrl}"`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"/, `<link rel="alternate" hreflang="x-default" href="${arUrl}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${esc(title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${esc(description)}"`)
  if (lang === 'en') {
    html = html
      .replace('<html lang="ar" dir="rtl">', '<html lang="en" dir="ltr">')
      .replace('<meta property="og:locale" content="ar_SA" />', '<meta property="og:locale" content="en_US" />')
      .replace('<meta property="og:locale:alternate" content="en_US" />', '<meta property="og:locale:alternate" content="ar_SA" />')
  }
  return html
}
function write(path, lang, title, description) {
  const p = lang === 'en' ? enPath(path) : path
  const dir = `dist${p === '/' ? '' : p}`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/index.html`, page(path, lang, title, description))
}

const AR = {
  '/': ['استوديو مكود | تصميم وبرمجة تطبيقات الجوال والمواقع في الرياض', 'شركة تصميم وبرمجة تطبيقات جوال ومواقع ومتاجر إلكترونية وأنظمة إدارة في الرياض، مع تصميم الهويات وأدوات الذكاء الاصطناعي. احسب تكلفة مشروعك بالتفصيل، والباقات تبدأ من 850 ريال.'],
  '/services': ['خدماتنا: تصميم وبرمجة التطبيقات والمواقع والأنظمة | استوديو مكود', 'خدمات استوديو مكود في الرياض: تطبيقات الجوال، المواقع والمتاجر، أنظمة الإدارة، الهويات البصرية، المواد الدعائية، وحلول الذكاء الاصطناعي، بأسعار واضحة.'],
  '/login': ['تسجيل الدخول | استوديو مكود', 'بوابة عملاء استوديو مكود: تابع مرحلة مشروعك ونسبة الإنجاز وتواصل مع فريقك.'],
  '/privacy': ['سياسة الخصوصية | استوديو مكود', 'كيف يجمع استوديو مكود بياناتك الشخصية ويستخدمها ويحميها، وفق نظام حماية البيانات الشخصية في المملكة.'],
  '/terms': ['الشروط والأحكام | استوديو مكود', 'الشروط التي تنظم استخدام موقع استوديو مكود وبوابة العملاء.'],
  '/refund': ['سياسة الإلغاء والاسترداد | استوديو مكود', 'متى يحق لك إلغاء طلبك لدى استوديو مكود، وكيف يُحتسب المبلغ المسترد.'],
}
const EN = {
  '/': ['Makwad Studio | Mobile App & Website Development in Riyadh', 'Mobile app, website, online store and management system design and development in Riyadh, plus brand identities and AI tools. Price your project in detail; plans start at SAR 850.'],
  '/services': ['Our services: apps, websites and systems design & development | Makwad Studio', 'Makwad Studio services in Riyadh: mobile apps, websites and online stores, management systems, brand identities, promotional material and AI solutions, with clear prices.'],
  '/login': ['Sign in | Makwad Studio', 'Makwad Studio client portal: follow your project stage and progress and talk to your team.'],
  '/privacy': ['Privacy policy | Makwad Studio', 'How Makwad Studio collects, uses and protects your personal data, under the Saudi Personal Data Protection Law.'],
  '/terms': ['Terms and conditions | Makwad Studio', 'The terms that govern use of the Makwad Studio website and client portal.'],
  '/refund': ['Cancellation and refund policy | Makwad Studio', 'When you can cancel an order with Makwad Studio, and how a refund is calculated.'],
}
let n = 0
for (const [path, [title, desc]] of Object.entries(AR)) { if (path !== '/') { write(path, 'ar', title, desc); n++ } }
for (const [path, [title, desc]] of Object.entries(EN)) { write(path, 'en', title, desc); n++ }
for (const p of pages) {
  write(`/services/${p.slug}`, 'ar', p.title, p.description); n++
  const e = pagesEn[p.slug]
  if (e) { write(`/services/${p.slug}`, 'en', e.title, e.description); n++ }
}
// the root page keeps index.html, with its hreflang links already pointing at / and /en
console.log(`static pages: ${n}`)
