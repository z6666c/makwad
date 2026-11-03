// English copy for the public site. Keys mirror site-content.ts and the live price catalog,
// so Arabic stays the source of truth for logic (plan names, service keys) and English is display only.
import type { Catalog, Service } from '@/estimate'
import type { Lang } from '@/i18n'
import { FAQ, PLANS, TRACKS, WHY } from '@/site-content'

export const PLAN_EN: Record<string, string> = { 'الانطلاقة': 'Starter', 'النمو': 'Growth', 'المنشآت': 'Enterprise', 'طلب خاص': 'Custom request', 'لم أحدد بعد': 'Not sure yet' }
export const planName = (ar: string, lang: Lang) => (lang === 'en' ? PLAN_EN[ar] ?? ar : ar)

export const PLANS_EN: typeof PLANS = [
  { name: 'Starter', price: 'SAR 850', small: 'from', feat: false, items: ['Personal or business logo and visual identity', 'Promo video or digital brochure', 'Landing page or page design', 'Idea analysis and consultation with a report'], cta: 'Choose this plan' },
  { name: 'Growth', price: 'SAR 3,500', small: 'from', feat: true, items: ['Business or company website', 'Content dashboard included in the price', 'Small management system', 'An AI tool for your business', '3 months of technical support'], note: 'The plan price includes the content dashboard. Online payments are an add-on if you need them, priced clearly in the calculator.', cta: 'Choose this plan' },
  { name: 'Enterprise', price: 'SAR 6,500', small: 'from', feat: false, items: ['Full company websites and online stores', 'iOS and Android mobile apps', 'Integrated systems and platforms', 'Dedicated team and service-level agreement', 'Everything in Starter and Growth'], note: 'Final price depends on scope and add-ons, in a detailed quote before we start.', cta: 'Contact us' },
]

export const WHY_EN: typeof WHY = [
  { icon: WHY[0].icon, title: 'Deadlines we keep', text: 'A written timeline from day one, and a test build every two weeks so you can follow progress yourself.' },
  { icon: WHY[1].icon, title: 'Clear prices, no surprises', text: 'A detailed quote for every screen and feature, and any later addition is priced before we start it.' },
  { icon: WHY[2].icon, title: 'You own the code', text: 'You receive the source code, store accounts and servers in your company’s name.' },
  { icon: WHY[3].icon, title: 'A client portal for your project', text: 'Your own account to follow the project stage and progress and talk to your team directly.' },
]

export const TRACKS_EN: typeof TRACKS = [
  {
    key: 'design', label: 'Design, identities and promo material', range: '1 to 2 weeks', plan: 'الانطلاقة',
    note: 'First concepts within days, with two revision rounds before delivery.',
    steps: [
      { t: 'Discovery', w: 'Day 1–2', p: 'We learn your business, audience and taste.' },
      { t: 'Design', w: 'Day 3–6', p: 'First concepts or the page design.' },
      { t: 'Revisions', w: 'Day 7–9', p: 'Two rounds of changes on the chosen concept.' },
      { t: 'Delivery', w: 'Week 2', p: 'Final files, or the page goes live.' },
    ],
  },
  {
    key: 'web', label: 'Websites, stores and internal systems', range: '3 to 6 weeks', plan: 'النمو',
    note: 'A test version you review and comment on before launch.',
    steps: [
      { t: 'Discovery', w: 'Week 1', p: 'We define the pages, features and scope.' },
      { t: 'Design', w: 'Week 1–2', p: 'Interface design and a prototype you can try.' },
      { t: 'Build', w: 'Week 2–5', p: 'Built in batches with a test version.' },
      { t: 'Testing', w: 'Week 5', p: 'Checked on phone and desktop, feedback fixed.' },
      { t: 'Launch', w: 'Week 6', p: 'Live on your domain, with dashboard training.' },
    ],
  },
  {
    key: 'apps', label: 'Apps and integrated platforms', range: '8 to 12 weeks', plan: 'المنشآت',
    note: 'Every two weeks, a test build you try on your phone.',
    steps: [
      { t: 'Discovery', w: 'Week 1–2', p: 'Goals, users, and the scope of version one.' },
      { t: 'Design', w: 'Week 3–4', p: 'Wireframes, then final design and an interactive prototype.' },
      { t: 'Build', w: 'Week 5–10', p: 'Short sprints, a test build every two weeks.' },
      { t: 'Testing', w: 'Week 11', p: 'Tested on real devices, feedback fixed.' },
      { t: 'Launch', w: 'Week 12', p: 'Published on the App Store and Google Play, with follow-up.' },
    ],
  },
]

export const FAQ_EN: typeof FAQ = [
  { q: 'What do your prices start at?', a: 'Logo and identity design starts at SAR 500, and plans start at SAR 850 (Starter), SAR 3,500 (Growth) and SAR 6,500 (Enterprise). Every service has a clear price in the calculator, with each add-on and its cost; custom systems and monthly maintenance are quoted on request. Payment is in stages, following the payment plan agreed in the quote.' },
  { q: 'How much does a mobile app cost in Saudi Arabia?', a: 'Our mobile apps start at SAR 9,000 for a first version on one platform, and SAR 16,000 for iOS and Android, rising with the number of screens and add-ons such as online payments, maps, notifications and an admin dashboard. Work out your app’s cost in detail in the price calculator.' },
  { q: 'How much is a website or an online store?', a: 'A landing page starts at SAR 1,500, a business website at SAR 3,500, a full company website at SAR 6,500, and an online store with cart and orders at SAR 9,500. You can add online payments, a content dashboard, two languages and search engine optimisation.' },
  { q: 'Do you publish the app on the App Store and Google Play?', a: 'Yes. We prepare the app, submit it to the App Store and Google Play and follow the store review until it is live, on a developer account in your or your company’s name so the app stays yours.' },
  { q: 'Do you build AI tools?', a: 'Yes. We build website chat assistants, smart WhatsApp bots, document analysis tools and task automation, set up on your company’s data, and they understand local Arabic dialects.' },
  { q: 'How long does it take?', a: 'From one week for identities, promo material and landing pages; 3 to 6 weeks for websites, stores and internal systems; and up to 12 weeks for apps and integrated platforms. We split bigger projects into successive releases so you can launch early.' },
  { q: 'How do I follow my project?', a: 'We open an account for you in the client portal, where you see the project stage, progress and latest updates, and send feedback to your team directly.' },
  { q: 'Do I own the source code?', a: 'Yes. Ownership of the code, designs and store accounts passes fully to your company at delivery.' },
  { q: 'What happens after launch?', a: 'Development projects include a support period after delivery (3 months on the Growth plan). After that, monthly maintenance for updates and new features is available on request, priced by the size of your project.' },
  { q: 'How do I pay?', a: 'In stages tied to the project’s progress, following the payment plan we agree in the quote before starting: a payment when work begins, and each later payment falls due as its stage is delivered. You pay by bank transfer or STC Pay, with an invoice for every payment.' },
  { q: 'Do you work remotely?', a: 'Yes. We serve clients across Saudi Arabia and the Gulf remotely: discovery and reviews run on video calls, and you follow your project in the client portal.' },
]

export const SOCIAL_LABEL_EN: Record<string, string> = { instagram: 'Instagram', x: 'X (Twitter)', tiktok: 'TikTok', facebook: 'Facebook' }

/** Values edited from the dashboard, which are written in Arabic. */
const SETTINGS_EN: Record<string, string> = {
  'الرياض، المملكة العربية السعودية': 'Riyadh, Saudi Arabia',
  'الأحد – الخميس، 9 ص – 5 م': 'Sunday – Thursday, 9 AM – 5 PM',
}
export const settingEn = (v: string, lang: Lang) => (lang === 'en' ? SETTINGS_EN[v] ?? v : v)
export const WA_MESSAGE_EN = 'Hello, I would like to ask about building an app or website.'

/** Portfolio examples from the dashboard, by their Arabic title. Cards without an entry are not shown in English. */
export const WORKS_EN: Record<string, { title: string; label: string; text: string; metrics: Array<string> }> = {
  'تطبيق «محمصة الخليج»': { title: 'Gulf Roastery app', label: 'Delivery · iOS & Android', text: 'Order coffee ahead and track the courier live, with a loyalty points programme.', metrics: ['downloads', 'rating', 'weeks'] },
  'منصة «موعد» للعيادات': { title: 'Mawid platform for clinics', label: 'Health · Mobile app & dashboard', text: 'Appointment booking, automatic reminders and the patient file in one place.', metrics: ['clinics', 'no-shows'] },
  'نظام مخزون «رف»': { title: 'Raf inventory system', label: 'Retail · Web system', text: 'Stock and transfers across 14 branches from a single screen.', metrics: ['branches', 'uptime'] },
  'تطبيق «صيانة بيتي»': { title: 'Home Fix app', label: 'Home services · iOS & Android', text: 'Book a plumber, electrician or AC technician at a set time and a known price.', metrics: ['orders / month', 'rating'] },
  'منصة «درس» التدريبية': { title: 'Dars training platform', label: 'Education · Web platform', text: 'Recorded courses, live classes, quizzes and completion certificates.', metrics: ['trainees', 'courses'] },
  'تطبيق «ملعب»': { title: 'Malaab app', label: 'Sports · iOS & Android', text: 'Book football and padel courts by the hour, and pay and split the cost in the app.', metrics: ['courts', 'rating'] },
}

type SvcEn = { label: string; type?: string; tierLabel?: string; text?: string; note?: string; tags?: Array<string>; tiers?: Record<string, [string, string?]>; addons?: Record<string, [string, string?]> }

/** English names for the live price catalog, by service key, tier key and add-on key. */
export const CATALOG_EN: Record<string, SvcEn> = {
  plans: { label: 'Plans', type: 'Plan', tierLabel: 'Plan', note: 'The plan price is a starting price; the final scope is set in the discovery session.' },
  web: {
    label: 'Websites & web apps', type: 'Website or web app', tierLabel: 'Website type',
    text: 'From a landing page for your business to an online store or a full web platform with a dashboard.', tags: ['Next.js', 'React', 'Stores'],
    tiers: { landing: ['Single landing page', 'A landing page for your business or campaign'], basic: ['Business website', 'Up to 5 pages'], company: ['Full company website', 'Up to 12 pages'], store: ['Online store', 'Products, cart and orders'], platform: ['Custom web platform', 'Accounts, roles and custom workflows'] },
    addons: { cms: ['Content dashboard', 'Edit texts and images yourself'], auth: ['Sign-in and accounts', 'Customers or members'], pay: ['Online payments', 'mada, Apple Pay, STC Pay · gateway fees paid by the client'], booking: ['Bookings and appointments', 'Calendar and available slots'], i18n: ['Two languages', 'Site set up for Arabic and English · translation not included'], blog: ['Blog and news', 'Categories and sharing'], seo: ['Search engine optimisation', 'Basic SEO and Google setup'], host: ['Hosting and domain for a year', 'With an SSL certificate · renews yearly'] },
  },
  mobile: {
    label: 'Mobile apps', type: 'Mobile app', tierLabel: 'App size',
    text: 'iOS and Android apps with smooth performance and full Arabic support, from a first version to a complete platform.', tags: ['iOS', 'Android', 'Flutter'],
    tiers: { mvp: ['First version, one platform', 'iOS or Android, up to 6 screens'], dual: ['iOS and Android', 'Up to 12 screens'], mid: ['Mid-size app', 'iOS and Android, up to 25 screens'], full: ['Complete platform', 'Customer + courier + admin apps'] },
    addons: { auth: ['Sign-in and accounts', 'Phone, email or Apple/Google · SMS fees paid by the client'], pay: ['Online payments', 'mada, Apple Pay, STC Pay · gateway fees paid by the client'], maps: ['Maps and live tracking', 'Locations, couriers, routes'], push: ['Push notifications', 'Alerts and reminders'], admin: ['Admin dashboard', 'Orders, content and reports'], chat: ['In-app chat', 'Between customers or with support'], booking: ['Bookings and appointments', 'Calendar and available slots'], i18n: ['Two languages', 'App set up for Arabic and English · translation not included'], stores: ['Store publishing', 'App Store and Google Play · developer account paid by the client'] },
  },
  software: {
    label: 'Software & systems', type: 'Software or system', tierLabel: 'System size',
    text: 'Custom management systems for your operations: customers, inventory, staff, invoicing, or a full ERP.', tags: ['ERP', 'CRM', 'Automation'],
    tiers: { script: ['Custom tool or automation', 'A small program that removes repetitive work'], small: ['Small system', 'One module: customers, inventory or staff'], medium: ['Mid-size system', '3 to 5 connected modules'], erp: ['Integrated system', 'ERP or CRM built around your operations'] },
    addons: { roles: ['Roles and permissions', 'Manager, staff, accountant…'], reports: ['Reports and KPI dashboard', 'Charts and Excel/PDF export'], api: ['Connect an existing system', 'API or current database'], zatca: ['E-invoicing', 'Compliant with ZATCA requirements'], migrate: ['Data migration', 'From Excel or a previous system'], app: ['Companion mobile app', 'For staff or customers'], backup: ['Automatic backups', 'Daily, with restore'] },
  },
  ai: {
    label: 'AI tools', type: 'AI tool', tierLabel: 'Tool type', note: 'Monthly AI model usage fees are paid according to actual use.',
    text: 'Chat assistants and smart WhatsApp bots, document analysis and task automation running on your company’s data.', tags: ['AI', 'Chatbot', 'Automation'],
    tiers: { webbot: ['Website chat assistant', 'Answers your customers from your information'], wabot: ['Smart WhatsApp bot', 'Automatic replies, orders and bookings'], docs: ['Document analysis and summaries', 'Contracts, invoices, reports'], automation: ['Workflow automation', 'Tasks carried out by AI'], custom: ['Custom AI system', 'Recommendations, forecasting or classification'] },
    addons: { kb: ['Assistant set up with your company data', 'Files, FAQs, catalogue'], crm: ['Connect to your system', 'CRM, store or database'], dash: ['Monitoring dashboard', 'Conversations, results and ratings'], handoff: ['Hand-off to a staff member', 'When a human is needed'], voice: ['Voice', 'Speech to text and back · monthly usage paid by the client'] },
  },
  analysis: {
    label: 'Software & project analysis', type: 'Project analysis', tierLabel: 'Analysis type',
    text: 'We analyse your idea or existing system: a requirements document, code and security audit, and a technical feasibility study with a plan and budget.', tags: ['SRS', 'Audit', 'Feasibility'],
    tiers: { idea: ['Idea analysis and consultation', 'Two sessions and a recommendations report'], srs: ['Full requirements document', 'An SRS ready for any development team'], audit: ['Audit of an existing system or app', 'Code, performance and security'], feasibility: ['Technical feasibility study', 'Technologies, cost and delivery plan'] },
    addons: { wire: ['Screen wireframes', 'Clickable wireframes'], competitors: ['Competitor analysis', 'Features and prices compared'], plan: ['Detailed schedule and costing', 'Phases, deliverables and budget'], security: ['Basic security test', 'Scan for common vulnerabilities'], perf: ['Performance and speed report', 'With an improvement plan'] },
  },
  design: {
    label: 'UX design', type: 'Design', tierLabel: 'Design scope',
    text: 'Interfaces and experiences tested with your real users before the first line of code, with a visual identity when needed.', tags: ['Figma', 'UX', 'Identity'],
    tiers: { page: ['Single page design', 'An interface ready to build'], site: ['Website design', 'Up to 8 pages'], app: ['App design', 'Up to 15 screens'], system: ['Full design system', 'Unified components, colours and type'] },
    addons: { proto: ['Interactive prototype', 'Try it on your phone before development'], test: ['User testing', '5 users and a report'], dark: ['Dark mode', 'A complete version of the interfaces'] },
  },
  cloud: {
    label: 'Hosting & cloud', type: 'Hosting and cloud', tierLabel: 'Service type', note: 'Domain and monthly cloud server fees (if any) are paid to the provider directly, in your name.',
    text: 'We launch your site on your domain with Cloudflare protection, and move your systems to the cloud with backups and monitoring.', tags: ['Cloudflare', 'SSL', 'Cloud'],
    tiers: { setup: ['Launch your site on your domain', 'Domain, Cloudflare and SSL set up, managed for a year'], migrate: ['Move an existing site or system', 'To faster, safer cloud hosting'], server: ['Cloud server for an app or system', 'Database and auto-scaling'], infra: ['Full cloud infrastructure', 'Production and test environments, backups and monitoring'] },
    addons: { mail: ['Business email on your domain', 'Set-up, connection and authentication'], backup: ['Daily backups', 'With restore when needed'], monitor: ['Monitoring and alerts', 'Know at once if the site goes down'], waf: ['Advanced protection', 'Custom firewall rules and bot protection'], speed: ['Performance boost', 'Caching and image compression'] },
  },
  integration: {
    label: 'Payments & integrations', type: 'Integration', tierLabel: 'Integration type',
    text: 'Connect local payment gateways, e-invoicing and shipping, and keep your systems in sync with each other.', tags: ['mada', 'Apple Pay', 'API'],
    tiers: { gateway: ['Payment gateway integration', 'mada, Apple Pay, STC Pay, Tabby'], api: ['Third-party service integration', 'Shipping, SMS, maps…'], zatca: ['E-invoicing integration', 'With ZATCA'], multi: ['Multi-system integration', 'Sync between store, accounting and inventory'] },
    addons: { sync: ['Scheduled automatic sync', 'Hourly or daily'], logs: ['Activity log and alerts', 'When any operation fails'], docs: ['Technical documentation', 'For your team or other developers'] },
  },
  maintenance: {
    label: 'Maintenance & ongoing development', type: 'Maintenance', tierLabel: 'Monthly plan',
    text: 'Monthly plans for monitoring, updates and new features, always compatible with new iOS and Android versions.', tags: ['Monthly', 'SLA', 'Support'],
    tiers: { basic: ['Basic', 'Issue monitoring, backups and security updates'], plus: ['Advanced', '+ 10 development hours a month, response within a day'], pro: ['Complete', '+ 25 development hours, response within 4 hours'] },
    addons: { hosting: ['Hosting and server management', 'Monitoring and scaling when needed'], reports: ['Monthly performance report', 'Traffic, issues and improvements'], store: ['Store updates', 'Compatible with new iOS and Android versions'] },
  },
  svcmv5nulia: {
    label: 'App testing & analysis', type: 'App testing and analysis', tierLabel: 'Package',
    text: 'We analyse and test your app and deliver a complete report.', tags: ['QA', 'Performance', 'Report'],
    tiers: { t1: ['Basic package'] },
    addons: { retest: ['Second test round after fixes', 'We confirm every issue is solved'], devices: ['Testing on more devices', 'More devices and versions for your audience'] },
  },
  svcmvcq7l3r: {
    label: 'Personal & business identity design', type: 'Identity design', tierLabel: 'Identity type',
    text: 'A visual identity for you or your business: logo concepts, colours and type, applied to print and social media.', tags: ['Logo', 'Identity', 'Print'],
    tiers: { t1: ['Personal identity', 'For a personal brand or freelancer'], n1792261507581: ['Business identity', 'For a company, shop or project'] },
    addons: { n1792261691396: ['Full brand guidelines', 'Rules for the logo, colours and type'], n1792261691749: ['Stationery', 'Letterhead, envelope and invoice'], n1792261692100: ['Social media templates', 'Ready post and story templates'] },
  },
  svcmvcqis1d: {
    label: 'Promotional material design', type: 'Promo material', tierLabel: 'Material type',
    text: 'Motion-graphics videos (no filming) and digital brochures in your brand, with the concept, script and original music free of rights issues.', tags: ['Motion graphics', 'Brochure', 'Ads'],
    tiers: { t1: ['15-second promo video', 'Motion graphics in one size, two revisions'], n1792262003714: ['Digital brochure', '4 to 6 pages as a PDF ready to send'], n1792262004066: ['Campaign pack', 'Two videos + brochure + 5 social designs'] },
    addons: { n1792262004418: ['Extra video size', 'Landscape or square version'], n1792262004770: ['Brochure copywriting', 'We write the texts for you'] },
  },
}

/** The catalog with English labels where we have them. Keys and prices are untouched. */
export function localizeCatalog(catalog: Catalog, lang: Lang): Catalog {
  if (lang !== 'en') return catalog
  return catalog.map((s): Service => {
    const found = CATALOG_EN[s.key]
    if (!found) return s
    // the Plans service reuses web add-ons (and push / store publishing from mobile)
    const e = s.key === 'plans' ? { ...found, addons: { ...CATALOG_EN.mobile.addons, ...CATALOG_EN.web.addons } } : found
    const opt = (m: Record<string, [string, string?]> | undefined) => (o: Service['tiers'][number]) => {
      const x = m?.[o.key]
      return x ? { ...o, label: x[0], hint: x[1] ?? '' } : o
    }
    return {
      ...s,
      label: e.label,
      type: e.type ?? e.label,
      tierLabel: e.tierLabel ?? s.tierLabel,
      text: e.text ?? s.text,
      tags: e.tags ?? s.tags,
      note: e.note ?? (s.note ? undefined : s.note),
      tiers: s.tiers.map(opt(e.tiers)),
      addons: s.addons.map(opt(e.addons)),
    }
  })
}
