// Static content for the landing page. All projects, figures and testimonials are examples.

const top = `<div class="ms-top"><span class="mono">9:41</span><span class="ms-bat"></span></div>`

export type WorkCase = {
  kind: 'mobile' | 'web' | 'both'
  pa: string
  label: string
  title: string
  text: string
  metrics: Array<[string, string]>
  art: string
}

export const CASES: Array<WorkCase> = [
  {
    kind: 'mobile', pa: 'var(--clay)', label: 'توصيل · iOS وأندرويد', title: 'تطبيق «محمصة الخليج»',
    text: 'طلب القهوة مسبقاً وتتبع المندوب لحظياً، مع برنامج نقاط ولاء.',
    metrics: [['85K', 'تحميل'], ['4.8', 'تقييم'], ['11', 'أسبوعاً']],
    art: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">محمصة الخليج</div>
      <div class="ms-search">ابحث عن قهوتك المفضلة</div>
      <div class="ms-row"><i class="cup"></i><div><b>V60 إثيوبي</b><small>18 ر.س</small></div><em>+</em></div>
      <div class="ms-row"><i class="cup c2"></i><div><b>لاتيه بارد</b><small>21 ر.س</small></div><em>+</em></div>
      <div class="ms-row"><i class="cup c3"></i><div><b>كورتادو</b><small>16 ر.س</small></div><em>+</em></div>
      <div class="ms-cta">إتمام الطلب · 55 ر.س</div></div></div>`,
  },
  {
    kind: 'both', pa: 'var(--sky)', label: 'صحة · تطبيق جوال ولوحة تحكم', title: 'منصة «موعد» للعيادات',
    text: 'حجز المواعيد والتذكير الآلي وملف المريض في مكان واحد.',
    metrics: [['32', 'عيادة'], ['−40%', 'غياب المواعيد']],
    art: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">اختر موعدك</div>
      <div class="ms-days"><span>أحد<b>12</b></span><span class="on">اثنين<b>13</b></span><span>ثلاثاء<b>14</b></span><span>أربعاء<b>15</b></span></div>
      <div class="ms-slots"><span>9:00</span><span>9:30</span><span class="off">10:00</span><span class="on">10:30</span><span>11:00</span><span class="off">11:30</span></div>
      <div class="ms-row"><i class="av">س</i><div><b>د. سارة الحربي</b><small>جلدية · عيادة الشاطئ</small></div></div>
      <div class="ms-cta">تأكيد الحجز</div></div></div>`,
  },
  {
    kind: 'web', pa: 'var(--accent)', label: 'تجزئة · نظام ويب', title: 'نظام مخزون «رف»',
    text: 'إدارة المخزون والتحويلات بين 14 فرعاً من شاشة واحدة.',
    metrics: [['14', 'فرعاً'], ['99.9%', 'جاهزية']],
    art: `<div class="dev-laptop"><div class="lap-screen">
      <div class="lap-side"><i class="lg"></i><i class="on"></i><i></i><i></i><i></i></div>
      <div class="lap-main">
        <div class="lap-kpis"><div><small>الأصناف</small><b class="mono">1,240</b></div><div><small>الفروع</small><b class="mono">14</b></div><div><small>مخزون منخفض</small><b class="mono warn">23</b></div></div>
        <div class="lap-chart"><i style="height:40%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:75%"></i><i style="height:58%"></i><i style="height:88%"></i><i style="height:70%"></i></div>
        <div class="lap-rows"><span></span><span></span><span></span></div>
      </div></div><div class="lap-base"></div></div>`,
  },
  {
    kind: 'mobile', pa: 'var(--sand)', label: 'خدمات منزلية · iOS وأندرويد', title: 'تطبيق «صيانة بيتي»',
    text: 'حجز فني سباكة وكهرباء وتكييف بموعد محدد وسعر معروف مسبقاً.',
    metrics: [['12K', 'طلب شهرياً'], ['4.6', 'تقييم']],
    art: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">وش تحتاج اليوم؟</div>
      <div class="ms-grid">
        <span><i><svg viewBox="0 0 24 24"><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/></svg></i>سباكة</span>
        <span><i><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></i>كهرباء</span>
        <span><i><svg viewBox="0 0 24 24"><path d="M12 2v20M3 7l18 10M21 7L3 17"/></svg></i>تكييف</span>
        <span><i><svg viewBox="0 0 24 24"><rect x="3" y="3" width="14" height="7" rx="2"/><path d="M17 6h3v6h-8v3"/><rect x="10" y="15" width="4" height="6" rx="1"/></svg></i>دهانات</span>
      </div>
      <div class="ms-track"><b>الفني في الطريق</b><small>ماجد · يصل خلال 18 دقيقة</small><div class="bar"><i></i></div></div>
      </div></div>`,
  },
  {
    kind: 'web', pa: 'var(--clay)', label: 'تعليم · منصة ويب', title: 'منصة «درس» التدريبية',
    text: 'دورات مسجلة وبث مباشر واختبارات وشهادات إتمام.',
    metrics: [['6K', 'متدرب'], ['140', 'دورة']],
    art: `<div class="dev-laptop"><div class="lap-screen">
      <div class="lap-main">
        <div class="lap-video"><span class="play"></span><div class="prog"><i></i></div></div>
        <div class="lap-cap"><b>تصميم واجهات التطبيقات</b><small>الدرس 4 من 12</small></div>
      </div>
      <div class="lap-list"><span class="done">مقدمة</span><span class="done">الألوان</span><span class="done">الخطوط</span><span class="on">الشبكات</span><span>المكونات</span></div>
      </div><div class="lap-base"></div></div>`,
  },
  {
    kind: 'mobile', pa: 'var(--accent)', label: 'رياضة · iOS وأندرويد', title: 'تطبيق «ملعب»',
    text: 'حجز ملاعب الكرة والبادل بالساعة، والدفع وتقسيم المبلغ داخل التطبيق.',
    metrics: [['210', 'ملعباً'], ['4.7', 'تقييم']],
    art: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">ملعب الدانة</div>
      <div class="ms-sub">بادل · الخبر</div>
      <div class="pitch"><i class="mid"></i><i class="net"></i></div>
      <div class="ms-slots"><span>6 م</span><span class="on">7 م</span><span class="off">8 م</span></div>
      <div class="ms-cta">احجز · 250 ر.س</div></div></div>`,
  },
]

export const SERVICES: Array<{ icon: string; title: string; text: string; tags: Array<string> }> = [
  { icon: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>', title: 'تطبيقات الجوال', text: 'تطبيقات أصلية أو متعددة المنصات بأداء سلس، ودعم كامل للعربية واتجاه الكتابة من اليمين.', tags: ['iOS', 'Android', 'Flutter'] },
  { icon: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8"/>', title: 'تطبيقات الويب ولوحات التحكم', text: 'أنظمة إدارة الطلبات والعملاء ولوحات المؤشرات التي يستخدمها فريقك يومياً.', tags: ['Next.js', 'Vue', 'Laravel'] },
  { icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', title: 'تصميم تجربة المستخدم', text: 'بحث مع مستخدميك الفعليين، ونماذج تفاعلية تُختبر قبل كتابة أول سطر برمجي.', tags: ['Figma', 'UX Research'] },
  { icon: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>', title: 'الدفع والربط', text: 'ربط مع بوابات الدفع المحلية مثل مدى وApple Pay وSTC Pay، ومع أنظمتك الحالية.', tags: ['API', 'mada', 'Apple Pay'] },
  { icon: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>', title: 'الأمان والامتثال', text: 'استضافة داخل المملكة عند الحاجة، ومراعاة متطلبات نظام حماية البيانات الشخصية.', tags: ['PDPL', 'OWASP'] },
  { icon: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', title: 'الصيانة والتطوير المستمر', text: 'تحديثات دورية، ومتابعة الأعطال، وتوافق مع كل إصدار جديد من iOS وأندرويد.', tags: ['24h SLA', 'CI/CD'] },
]

export const WHY: Array<{ icon: string; title: string; text: string }> = [
  { icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', title: 'مواعيد نلتزم بها', text: 'جدول زمني مكتوب من البداية، ونسخة تجريبية كل أسبوعين تتابع بها التقدم بنفسك.' },
  { icon: '<path d="M4 7h16M4 12h10M4 17h7"/>', title: 'سعر واضح بلا مفاجآت', text: 'عرض مفصل بكل شاشة وميزة، وأي إضافة لاحقة تُسعَّر قبل البدء بها.' },
  { icon: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', title: 'الكود ملكك بالكامل', text: 'تستلم الشيفرة المصدرية وحسابات المتاجر والخوادم باسم شركتك.' },
  { icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', title: 'بوابة عميل لمتابعة مشروعك', text: 'حساب خاص تتابع فيه مرحلة مشروعك ونسبة الإنجاز وتتواصل مع فريقك مباشرة.' },
]

export const QUOTES = [
  { t: 'أطلقنا تطبيقنا في أحد عشر أسبوعاً، وكان الفريق يرسل لنا نسخة نجربها كل أسبوعين. تضاعفت طلباتنا الإلكترونية خلال ثلاثة أشهر.', n: 'فهد العتيبي', r: 'المدير التنفيذي، محمصة الخليج' },
  { t: 'نسبة غياب المرضى عن مواعيدهم انخفضت بشكل واضح بعد التذكيرات الآلية. والدعم الفني يرد علينا في نفس اليوم.', n: 'ريم القحطاني', r: 'مديرة التشغيل، عيادات موعد' },
  { t: 'صرنا نعرف المخزون في أربعة عشر فرعاً من شاشة واحدة. الفريق فهم طريقة عملنا قبل أن يقترح أي حل.', n: 'خالد الدوسري', r: 'مدير العمليات، رف للتجزئة' },
]

export const STEPS = [
  { t: 'الاكتشاف', w: 'الأسبوع 1–2', p: 'نفهم أهدافك ومستخدميك، ونحدد نطاق الإصدار الأول.' },
  { t: 'التصميم', w: 'الأسبوع 3–5', p: 'مخططات أولية ثم تصميم نهائي ونموذج تفاعلي.' },
  { t: 'البرمجة', w: 'الأسبوع 6–10', p: 'بناء على دفعات قصيرة مع نسخة تجريبية كل أسبوعين.' },
  { t: 'الاختبار', w: 'الأسبوع 11', p: 'اختبار على أجهزة حقيقية وإصلاح الملاحظات.' },
  { t: 'الإطلاق', w: 'الأسبوع 12', p: 'النشر في App Store وGoogle Play والمتابعة بعده.' },
]

export const PLANS = [
  { name: 'الانطلاقة', price: 'SAR 35,000', small: 'تبدأ من', feat: false, items: ['نسخة أولية (MVP) لمنصة واحدة', 'حتى 8 شاشات', 'لوحة تحكم بسيطة', 'دعم فني 3 أشهر'], cta: 'اطلب هذه الباقة' },
  { name: 'النمو', price: 'SAR 90,000', small: 'تبدأ من', feat: true, items: ['iOS وأندرويد معاً', 'حتى 25 شاشة', 'ربط بوابات الدفع', 'لوحة تحكم متكاملة', 'دعم فني 6 أشهر'], cta: 'اطلب هذه الباقة' },
  { name: 'المنشآت', price: 'حسب النطاق', small: 'عرض مخصص', feat: false, items: ['أنظمة متعددة وتكاملات داخلية', 'استضافة داخل المملكة', 'فريق مخصص لمشروعك', 'اتفاقية مستوى خدمة'], cta: 'تواصل معنا' },
]

export const FAQ = [
  { q: 'كم تكلفة تطوير تطبيق؟', a: 'تبدأ النسخة الأولية من 35 ألف ريال، وتعتمد التكلفة النهائية على عدد الشاشات والمنصات والتكاملات. نعطيك عرضاً مفصلاً بعد جلسة الاكتشاف.' },
  { q: 'كم يستغرق بناء التطبيق؟', a: 'الإصدار الأول عادة بين 8 و12 أسبوعاً. المشاريع الأكبر تُقسَّم إلى إصدارات متتابعة حتى تطلق مبكراً.' },
  { q: 'كيف أتابع تقدم مشروعي؟', a: 'نفتح لك حساباً في بوابة العملاء، تتابع فيه مرحلة المشروع ونسبة الإنجاز وآخر التحديثات، وترسل ملاحظاتك لفريقك مباشرة.' },
  { q: 'هل أملك الشيفرة المصدرية؟', a: 'نعم، تنتقل ملكية الشيفرة والتصاميم وحسابات المتاجر إلى شركتك بالكامل عند التسليم.' },
  { q: 'ماذا يحدث بعد الإطلاق؟', a: 'كل باقة تشمل فترة دعم فني، وبعدها يمكنك الاشتراك في الصيانة الشهرية للتحديثات وإضافة الميزات.' },
]

export const CLIENTS = ['الدانة العقارية', 'مجموعة رواء', 'قافلة للنقل', 'نُقطة', 'بيت الخبرة', 'مدار المالية']
