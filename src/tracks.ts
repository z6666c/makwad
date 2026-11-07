// The four Makwad specialities. Each has its own page (/web, /apps, /brand, /business and /en/...),
// its services with a single "starting from" price, and a request form. Texts are [Arabic, English].
import type { Lang } from '@/i18n'

type Tx = [string, string]
export type TrackKey = 'web' | 'apps' | 'brand' | 'business'
export type TrackService = { key: string; name: Tx; text: Tx; time: Tx; isNew?: boolean }
export type Track = {
  key: TrackKey
  num: string
  /** The one starting price shown for the speciality. */
  from: number
  name: Tx
  color: string
  tint: string
  line: Tx
  lead: Tx
  services: Array<TrackService>
  steps: Array<{ t: Tx; w: Tx; p: Tx }>
  faq: Array<{ q: Tx; a: Tx }>
  pages: Array<string>
  title: Tx
  description: Tx
}

export const tx = (v: Tx, lang: Lang) => (lang === 'en' ? v[1] : v[0])

const ALL: Array<Track> = [
  {
    key: 'web', from: 2000, num: '01', name: ['مكود ويب', 'Makwad Web'], color: '#1F6F8B', tint: '#E4EEF3',
    line: ['مواقع ومنصات ويب تشتغل بسرعة على الجوال والكمبيوتر، بلوحة تحكم تديرها بنفسك.', 'Websites and web platforms that run fast on phones and computers, with a dashboard you manage yourself.'],
    lead: ['من صفحة هبوط لحملتك إلى موقع شركة متكامل أو منصة ويب بحسابات وأدوار. نصمم الواجهة أولاً وتجربها بنفسك، ثم نبني ونطلق على دومينك.', 'From a landing page for your campaign to a full company website or a web platform with accounts and roles. We design the interface first so you can try it, then build and launch on your domain.'],
    title: ['مكود ويب: تصميم وبرمجة المواقع ومنصات الويب | استوديو مكود', 'Makwad Web: website and web platform design & development | Makwad Studio'],
    description: ['صفحات هبوط ومواقع تعريفية ومواقع شركات ومنصات ويب بلوحة تحكم، تبدأ من 2,000 ريال. أرسل طلبك ونرسل لك عرض سعر مفصل.', 'Landing pages, business websites, company websites and web platforms with a dashboard, from SAR 2,000. Send your request and get a detailed quote.'],
    services: [
      { key: 'landing', name: ['صفحة هبوط', 'Landing page'], text: ['صفحة واحدة لحملة إعلانية أو تعريف بنشاطك، مع نموذج تواصل.', 'One page for an ad campaign or to introduce your business, with a contact form.'], time: ['أسبوع', '1 week'] },
      { key: 'basic', name: ['موقع تعريفي', 'Business website'], text: ['حتى 5 صفحات تعرّف بنشاطك وخدماتك.', 'Up to 5 pages about your business and services.'], time: ['أسبوعان', '2 weeks'] },
      { key: 'company', name: ['موقع شركة متكامل', 'Full company website'], text: ['حتى 12 صفحة بلوحة تحكم بالمحتوى ولغتين عند الحاجة.', 'Up to 12 pages with a content dashboard and two languages if needed.'], time: ['3 أسابيع', '3 weeks'] },
      { key: 'platform', name: ['منصة ويب مخصصة', 'Custom web platform'], text: ['حسابات وأدوار وعمليات خاصة بنشاطك، مثل بوابات العملاء.', 'Accounts, roles and workflows of your own, such as client portals.'], time: ['7 أسابيع', '7 weeks'] },
      { key: 'ux', name: ['تصميم واجهات وتجربة مستخدم', 'UI and UX design'], text: ['واجهات ونموذج تفاعلي تختبره قبل البرمجة.', 'Screens and a clickable prototype you test before development.'], time: ['أسبوعان', '2 weeks'] },
      { key: 'pwa', name: ['تطبيق ويب يُثبَّت على الجوال', 'Installable web app (PWA)'], text: ['يفتح من المتصفح ويُثبَّت على الشاشة الرئيسية مثل التطبيق، بدون متاجر.', 'Opens in the browser and installs on the home screen like an app, no stores needed.'], time: ['3 أسابيع', '3 weeks'], isNew: true },
    ],
    steps: [
      { t: ['الاكتشاف', 'Discovery'], w: ['الأسبوع 1', 'Week 1'], p: ['نحدد الصفحات والمزايا ونطاق العمل.', 'We agree the pages, features and scope.'] },
      { t: ['التصميم', 'Design'], w: ['الأسبوع 1–2', 'Weeks 1–2'], p: ['تصميم الواجهات ونموذج تجربه بنفسك.', 'Interface design and a prototype you try yourself.'] },
      { t: ['البرمجة', 'Development'], w: ['الأسبوع 2–5', 'Weeks 2–5'], p: ['بناء على دفعات مع نسخة تجريبية.', 'Built in batches with a preview version.'] },
      { t: ['الإطلاق', 'Launch'], w: ['الأسبوع 6', 'Week 6'], p: ['النشر على دومينك والتدريب على لوحة التحكم.', 'Live on your domain, with training on the dashboard.'] },
    ],
    faq: [
      { q: ['هل أقدر أعدل محتوى الموقع بنفسي؟', 'Can I edit the website content myself?'], a: ['نعم، مواقع الشركات تشمل لوحة تحكم تعدّل منها النصوص والصور والأخبار، ونعطيك تدريب عليها.', 'Yes. Company websites include a dashboard to edit text, images and news, and we train you on it.'] },
      { q: ['هل الاستضافة والدومين مشمولة؟', 'Are hosting and the domain included?'], a: ['نطلق الموقع على دومينك مع شهادة أمان وحماية من الهجمات، والاستضافة السنوية نضيفها في العرض حسب احتياجك، ونقدر نستضيف داخل المملكة إذا احتجت.', 'We launch on your domain with an SSL certificate and attack protection; yearly hosting is added to the quote as you need it, and we can host inside Saudi Arabia if you need it.'] },
    ],
    pages: ['websites', 'company-website', 'landing-page'],
  },
  {
    key: 'apps', from: 1500, num: '02', name: ['مكود تطبيقات', 'Makwad Apps'], color: '#2A4A8C', tint: '#E6EBF5',
    line: ['تطبيقات iOS وأندرويد من النسخة الأولى حتى المنظومة الكاملة، وألعاب جوال.', 'iOS and Android apps from a first version to a complete system, plus mobile games.'],
    lead: ['تطبيقات جوال بدعم كامل للعربية، من نسخة أولية تختبر فيها فكرتك إلى منظومة توصيل أو حجوزات كاملة، وألعاب جوال خفيفة تبني جمهورك أو تعلّم أو تسوّق لعلامتك.', 'Mobile apps with full Arabic support, from a first version that tests your idea to a complete delivery or booking system, plus light mobile games that grow your audience, teach, or market your brand.'],
    title: ['مكود تطبيقات: تصميم وبرمجة تطبيقات الجوال والألعاب | استوديو مكود', 'Makwad Apps: mobile app and game design & development | Makwad Studio'],
    description: ['تطبيقات iOS وأندرويد، تطبيقات توصيل وحجوزات، وألعاب جوال تسويقية وتعليمية، تبدأ من 1,500 ريال. أرسل طلبك ونرسل لك عرض سعر مفصل.', 'iOS and Android apps, delivery and booking apps, and marketing and educational mobile games, from SAR 1,500. Send your request and get a detailed quote.'],
    services: [
      { key: 'mvp', name: ['نسخة أولية لمنصة واحدة', 'First version on one platform'], text: ['تطبيق بالمزايا الأساسية تختبر فيه فكرتك مع عملاء حقيقيين.', 'An app with the core features to test your idea with real customers.'], time: ['4 أسابيع', '4 weeks'] },
      { key: 'dual', name: ['تطبيق iOS وأندرويد', 'iOS and Android app'], text: ['تطبيق واحد يشتغل على المنصتين، مع النشر في المتاجر.', 'One app on both platforms, published in the stores.'], time: ['6 أسابيع', '6 weeks'] },
      { key: 'full', name: ['منظومة متكاملة', 'Complete app system'], text: ['تطبيق عميل ومندوب ولوحة إدارة، مثل التوصيل والحجوزات.', 'Customer and courier apps with an admin dashboard, such as delivery and bookings.'], time: ['12 أسبوعاً', '12 weeks'] },
      { key: 'promo-game', name: ['لعبة تسويقية', 'Marketing game'], text: ['لعبة قصيرة باسم علامتك لحملة أو مناسبة، مع جوائز وجمع بيانات المشاركين.', 'A short branded game for a campaign or occasion, with prizes and sign-ups.'], time: ['3–4 أسابيع', '3–4 weeks'], isNew: true },
      { key: 'casual-game', name: ['لعبة جوال خفيفة', 'Casual mobile game'], text: ['لعبة ثنائية الأبعاد بمراحل ونقاط ولوحة صدارة، تنشرها باسمك في المتاجر.', 'A 2D game with levels, scores and a leaderboard, published under your name.'], time: ['6–8 أسابيع', '6–8 weeks'], isNew: true },
      { key: 'edu-game', name: ['لعبة تعليمية', 'Educational game'], text: ['تعليم بالمراحل والمكافآت للأطفال أو لتدريب الموظفين.', 'Learning through levels and rewards, for children or staff training.'], time: ['8–10 أسابيع', '8–10 weeks'], isNew: true },
    ],
    steps: [
      { t: ['الاكتشاف', 'Discovery'], w: ['الأسبوع 1–2', 'Weeks 1–2'], p: ['نحدد المستخدمين والإصدار الأول.', 'We define the users and the first release.'] },
      { t: ['التصميم', 'Design'], w: ['الأسبوع 3–4', 'Weeks 3–4'], p: ['نموذج تفاعلي تجربه بنفسك.', 'A clickable prototype you try yourself.'] },
      { t: ['البرمجة', 'Development'], w: ['الأسبوع 5–10', 'Weeks 5–10'], p: ['نسخة تجريبية على جوالك كل أسبوعين.', 'A test build on your phone every two weeks.'] },
      { t: ['الإطلاق', 'Launch'], w: ['الأسبوع 11–12', 'Weeks 11–12'], p: ['اختبار على أجهزة حقيقية ثم النشر في App Store وGoogle Play.', 'Testing on real devices, then publishing on the App Store and Google Play.'] },
    ],
    faq: [
      { q: ['وش نوع الألعاب اللي تسوونها؟', 'What kind of games do you make?'], a: ['ألعاب ثنائية الأبعاد خفيفة: ألعاب تسويقية للحملات والمناسبات، وألعاب ألغاز وتحدي، وألعاب تعليمية. ما نسوي ألعاب ثلاثية الأبعاد كبيرة.', 'Light 2D games: marketing games for campaigns and occasions, puzzle and challenge games, and educational games. We do not make large 3D games.'] },
      { q: ['هل تنشرون التطبيق في المتاجر؟', 'Do you publish the app in the stores?'], a: ['نعم، نرفع التطبيق في App Store وGoogle Play على حساب المطوّر باسمك أو باسم منشأتك، ونتابع المراجعة حتى ينشر.', 'Yes. We upload it to the App Store and Google Play under your own developer account and follow the review until it is live.'] },
    ],
    pages: ['mobile-apps', 'delivery-app', 'booking-app'],
  },
  {
    key: 'brand', from: 500, num: '03', name: ['مكود هوية', 'Makwad Brand'], color: '#B4613A', tint: '#F8EAE3',
    line: ['نبني علامتك من الشعار حتى الحملة، ونعطيها وكيل ذكاء يتكلم بصوتها.', 'We build your brand from the logo to the campaign, and give it an AI agent that speaks in its voice.'],
    lead: ['شعار وهوية بصرية ودليل استخدام، فيديوهات دعائية وموشن، محتوى شهري وحملات إعلانية مدفوعة، ووكيل ذكاء يرد على عملائك في الواتساب والانستقرام والموقع بأسلوب علامتك.', 'Logo, visual identity and brand guidelines, promo videos and motion graphics, monthly content and paid ad campaigns, and an AI agent that answers your customers on WhatsApp, Instagram and your website in your brand’s voice.'],
    title: ['مكود هوية: الهويات البصرية والحملات الدعائية ووكلاء الذكاء | استوديو مكود', 'Makwad Brand: visual identities, ad campaigns and AI agents | Makwad Studio'],
    description: ['شعار وهوية بصرية، فيديو دعائي، محتوى سوشال وحملات إعلانية، ووكيل ذكاء لخدمة عملائك، تبدأ من 500 ريال. أرسل طلبك ونرسل لك عرض سعر مفصل.', 'Logo and visual identity, promo video, social content and ad campaigns, and an AI agent for customer service, from SAR 500. Send your request and get a detailed quote.'],
    services: [
      { key: 'logo', name: ['شعار', 'Logo'], text: ['ثلاثة مفاهيم أولية وجولتا تعديل، مع ملفات بكل الصيغ.', 'Three first concepts and two revision rounds, with files in every format.'], time: ['أسبوع', '1 week'] },
      { key: 'identity', name: ['هوية بصرية كاملة', 'Full visual identity'], text: ['شعار وألوان وخطوط وتطبيقات الهوية مع دليل استخدام.', 'Logo, colours, typefaces and brand applications with guidelines.'], time: ['أسبوعان', '2 weeks'] },
      { key: 'video', name: ['فيديو دعائي وموشن', 'Promo video and motion'], text: ['فيديو حتى 60 ثانية لسناب وتيك توك وانستقرام.', 'A video up to 60 seconds for Snapchat, TikTok and Instagram.'], time: ['أسبوع', '1 week'] },
      { key: 'content', name: ['محتوى سوشال ميديا شهري', 'Monthly social media content'], text: ['تصاميم وفيديوهات شهرية بخطة محتوى تناسب جمهورك.', 'Monthly designs and videos on a content plan made for your audience.'], time: ['شهري', 'Monthly'], isNew: true },
      { key: 'ads', name: ['إدارة حملات إعلانية', 'Ad campaign management'], text: ['حملات شهرية في سناب وتيك توك وميتا وقوقل مع تقرير أداء. ميزانية الإعلان على العميل.', 'Monthly campaigns on Snapchat, TikTok, Meta and Google with a performance report. The ad budget is paid by the client.'], time: ['شهري', 'Monthly'], isNew: true },
      { key: 'agent', name: ['وكيل ذكاء لعلامتك', 'AI agent for your brand'], text: ['يرد على عملائك في الواتساب والانستقرام والموقع، ويحوّل للموظف عند الحاجة.', 'Answers your customers on WhatsApp, Instagram and your website, and hands over to staff when needed.'], time: ['أسبوعان', '2 weeks'], isNew: true },
    ],
    steps: [
      { t: ['الاكتشاف', 'Discovery'], w: ['اليوم 1–2', 'Days 1–2'], p: ['نفهم نشاطك وجمهورك وذوقك.', 'We learn your business, audience and taste.'] },
      { t: ['المفاهيم', 'Concepts'], w: ['اليوم 3–6', 'Days 3–6'], p: ['مفاهيم أولية تختار منها.', 'First concepts for you to choose from.'] },
      { t: ['التعديلات', 'Revisions'], w: ['اليوم 7–9', 'Days 7–9'], p: ['جولتا تعديل على المفهوم المختار.', 'Two revision rounds on the chosen concept.'] },
      { t: ['التسليم', 'Delivery'], w: ['الأسبوع 2', 'Week 2'], p: ['الملفات النهائية أو إطلاق الحملة.', 'Final files, or the campaign goes live.'] },
    ],
    faq: [
      { q: ['هل ميزانية الإعلانات داخلة في السعر؟', 'Is the ad budget included in the price?'], a: ['لا، أجر إدارة الحملات شهري، وميزانية الإعلان تدفعها مباشرة للمنصة من حسابك، وتوصلك تقارير الأداء.', 'No. Campaign management is a monthly fee; you pay the ad budget directly to the platform from your own account, and you receive performance reports.'] },
      { q: ['وش يقدر يسوي وكيل الذكاء؟', 'What can the AI agent do?'], a: ['يرد على أسئلة عملائك من بيانات شركتك، ويستقبل الطلبات والحجوزات، ويحوّل المحادثة للموظف إذا احتاج، ويفهم اللهجات المحلية.', 'It answers customer questions from your company’s information, takes orders and bookings, hands the chat to staff when needed, and understands local dialects.'] },
    ],
    pages: ['brand-identity', 'promo-materials', 'ai-solutions'],
  },
  {
    key: 'business', from: 800, num: '04', name: ['مكود بزنس', 'Makwad Business'], color: '#8A5A0B', tint: '#FBF1DE',
    line: ['كل اللي تحتاجه عشان تبيع وتقبض وتدير: متجر، دفع، فوترة، وأنظمة.', 'Everything you need to sell, get paid and run things: a store, payments, invoicing and systems.'],
    lead: ['متجر إلكتروني باسمك أو تجهيز متجرك على سلة وزد، ربط بوابات الدفع والاشتراكات، الفوترة الإلكترونية وشركات الشحن، وأنظمة إدارة تنظم عملياتك.', 'An online store under your own name or a store set up on Salla or Zid, payment gateways and subscriptions, e-invoicing and shipping companies, and management systems that organise your operations.'],
    title: ['مكود بزنس: المتاجر الإلكترونية وأنظمة الدفع والإدارة | استوديو مكود', 'Makwad Business: online stores, payments and management systems | Makwad Studio'],
    description: ['متاجر إلكترونية، تجهيز متاجر سلة وزد، بوابات الدفع والاشتراكات، الفوترة الإلكترونية وأنظمة الإدارة، تبدأ من 800 ريال. أرسل طلبك ونرسل لك عرض سعر مفصل.', 'Online stores, Salla and Zid store setup, payment gateways and subscriptions, e-invoicing and management systems, from SAR 800. Send your request and get a detailed quote.'],
    services: [
      { key: 'store', name: ['متجر إلكتروني مخصص', 'Custom online store'], text: ['متجر باسمك ودومينك: منتجات وسلة وطلبات ولوحة تحكم.', 'A store on your own name and domain: products, cart, orders and a dashboard.'], time: ['4–5 أسابيع', '4–5 weeks'] },
      { key: 'salla', name: ['تجهيز متجر سلة أو زد', 'Salla or Zid store setup'], text: ['إعداد المتجر وتصميم واجهته ورفع المنتجات وربط الدفع والشحن.', 'Store setup, storefront design, product upload, and payment and shipping connected.'], time: ['أسبوع', '1 week'], isNew: true },
      { key: 'gateway', name: ['ربط بوابات الدفع', 'Payment gateway integration'], text: ['مدى وApple Pay وSTC Pay في موقعك أو تطبيقك.', 'mada, Apple Pay and STC Pay in your website or app.'], time: ['أسبوع', '1 week'] },
      { key: 'subs', name: ['روابط دفع واشتراكات متكررة', 'Payment links and recurring subscriptions'], text: ['اشتراكات شهرية وروابط دفع ترسلها لعملائك مع فواتير تلقائية.', 'Monthly subscriptions and payment links you send to customers, with automatic invoices.'], time: ['أسبوع', '1 week'], isNew: true },
      { key: 'zatca', name: ['الفوترة الإلكترونية والشحن', 'E-invoicing and shipping'], text: ['ربط الفوترة حسب متطلبات هيئة الزكاة، وربط شركات الشحن.', 'E-invoicing to ZATCA requirements, and shipping companies connected.'], time: ['أسبوعان', '2 weeks'] },
      { key: 'systems', name: ['أنظمة إدارة وأتمتة', 'Management systems and automation'], text: ['عملاء ومخزون وموظفين وفوترة، وأتمتة المهام بالذكاء الاصطناعي.', 'Customers, stock, staff and billing, with AI task automation.'], time: ['3 أسابيع', '3 weeks'] },
    ],
    steps: [
      { t: ['الاكتشاف', 'Discovery'], w: ['الأسبوع 1', 'Week 1'], p: ['نفهم طريقة بيعك وعملياتك.', 'We learn how you sell and operate.'] },
      { t: ['الإعداد والتصميم', 'Setup and design'], w: ['الأسبوع 1–2', 'Weeks 1–2'], p: ['تصميم المتجر أو النظام وتجهيز الحسابات.', 'Store or system design, and accounts set up.'] },
      { t: ['الربط والبرمجة', 'Integration and build'], w: ['الأسبوع 2–4', 'Weeks 2–4'], p: ['ربط الدفع والشحن والفوترة واختبارها.', 'Payments, shipping and invoicing connected and tested.'] },
      { t: ['الإطلاق', 'Launch'], w: ['الأسبوع 5', 'Week 5'], p: ['الإطلاق والتدريب على لوحة التحكم.', 'Launch, with training on the dashboard.'] },
    ],
    faq: [
      { q: ['متجر مخصص أو سلة وزد، وش الأنسب لي؟', 'Custom store or Salla and Zid: which suits me?'], a: ['إذا تبدأ بعدد منتجات محدود وتبي تنطلق بسرعة، سلة أو زد أنسب. وإذا تحتاج تجربة خاصة أو ربط مع أنظمتك، المتجر المخصص أنسب. نساعدك تختار في جلسة الاكتشاف.', 'If you are starting with a limited range and want to launch fast, Salla or Zid suits you. If you need your own experience or links to your systems, a custom store fits better. We help you choose in the discovery session.'] },
      { q: ['هل رسوم بوابة الدفع داخلة في السعر؟', 'Are payment gateway fees included?'], a: ['لا، رسوم العمليات تدفعها لبوابة الدفع مباشرة، وسعرنا يشمل الربط والاختبار.', 'No. Transaction fees are paid to the gateway directly; our price covers integration and testing.'] },
    ],
    pages: ['ecommerce-store', 'systems'],
  },
]

/** Shown from the lowest starting price to the highest, numbered in that order. */
export const TRACKS4: Array<Track> = [...ALL].sort((a, b) => a.from - b.from).map((t, i) => ({ ...t, num: String(i + 1).padStart(2, '0') }))

export const trackOf = (k: string | undefined | null) => TRACKS4.find((x) => x.key === k)
export const trackFrom = (t: Track) => t.from
/** The track a service page belongs to. */
export const trackOfPage = (slug: string) => TRACKS4.find((x) => x.pages.includes(slug))

export const BUDGETS: Array<Tx> = [
  ['أقل من 5,000 ريال', 'Under SAR 5,000'],
  ['5,000 – 15,000 ريال', 'SAR 5,000 – 15,000'],
  ['15,000 – 50,000 ريال', 'SAR 15,000 – 50,000'],
  ['أكثر من 50,000 ريال', 'Over SAR 50,000'],
  ['لم أحدد بعد', 'Not sure yet'],
]
