import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { COMPANY, LEGAL_UPDATED, useSettings } from '@/site-config'
import { LangSwitch, useHtmlLang, useLang } from '@/i18n'
import { settingEn } from '@/content-en'
import { useMeta } from '@/pages/Services'

function LegalLayout({ title, intro, path, children }: { title: string; intro: string; path: string; children: ReactNode }) {
  useHtmlLang()
  const { lang, en, t, L, pathname } = useLang()
  useMeta(`${title} | ${t('استوديو مكود', 'Makwad Studio')}`, intro, path)
  const s = useSettings()
  const tab = (p: string, ar: string, e: string) => <a href={L(p)} aria-current={pathname.replace(/\/$/, '').endsWith(p) ? 'page' : undefined}>{en ? e : ar}</a>
  return (
    <>
      <header className="site-header">
        <nav className="nav wrap" aria-label={t('القائمة الرئيسية', 'Main menu')}>
          <Logo />
          <div className="nav-end">
            <LangSwitch />
            <a className="btn ghost small" href={L('/')}>{t('العودة إلى الموقع', 'Back to the site')}</a>
          </div>
        </nav>
      </header>
      <main className="wrap legal-page">
        <div className="legal-head">
          <span className="kicker">{t('الوثائق القانونية', 'Legal documents')}</span>
          <h1>{title}</h1>
          <p className="muted">{intro}</p>
          <p className="legal-date">{t('آخر تحديث', 'Last updated')}: {en ? '17 October 2026' : LEGAL_UPDATED}</p>
          {en && <p className="muted">This English version is a translation for convenience. If it differs from the Arabic version, the Arabic version prevails.</p>}
        </div>
        <nav className="legal-tabs" aria-label={t('الوثائق', 'Documents')}>
          {tab('/privacy', 'سياسة الخصوصية', 'Privacy policy')}
          {tab('/terms', 'الشروط والأحكام', 'Terms and conditions')}
          {tab('/refund', 'الإلغاء والاسترداد', 'Cancellation & refunds')}
        </nav>
        <article className="legal-body">{children}</article>
        <div className="legal-contact">
          <h2>{t('للتواصل بخصوص هذه الوثيقة', 'Contact about this document')}</h2>
          {s.whatsapp && <p>{t('واتساب', 'WhatsApp')}: <b className="mono" dir="ltr">+{s.whatsapp}</b></p>}
          <p>{t('البريد الإلكتروني', 'Email')}: <b className="mono">{s.email}</b></p>
          {s.address && <p>{t('العنوان', 'Address')}: {settingEn(s.address, lang)}</p>}
        </div>
      </main>
      <footer className="site-footer">
        <div className="wrap legal">
          <span>{t('© 2026 استوديو مكود. جميع الحقوق محفوظة.', '© 2026 Makwad Studio. All rights reserved.')}{s.crNumber && <> · {t('وثيقة العمل الحر رقم', 'Freelance document no.')} <span className="mono" dir="ltr">{s.crNumber}</span></>}</span>
          <span><a href={L('/privacy')}>{t('سياسة الخصوصية', 'Privacy policy')}</a> · <a href={L('/terms')}>{t('الشروط والأحكام', 'Terms')}</a> · <a href={L('/refund')}>{t('الإلغاء والاسترداد', 'Cancellation & refunds')}</a></span>
        </div>
      </footer>
      <WhatsAppButton />
    </>
  )
}

function PrivacyAr() {
  return (
    <LegalLayout
      path="/privacy"
      title="سياسة الخصوصية"
      intro={`توضح هذه السياسة كيف يجمع ${COMPANY.name} بياناتك الشخصية ويستخدمها ويحميها عند استخدامك لهذا الموقع وبوابة العملاء، وفق نظام حماية البيانات الشخصية في المملكة العربية السعودية.`}
    >
      <h2>1. من نحن</h2>
      <p>«{COMPANY.name}» جهة سعودية متخصصة في تصميم وتطوير التطبيقات والمواقع والأنظمة وحلول الذكاء الاصطناعي، ومقرها {COMPANY.city}.</p>
      <p>ونُعدّ الجهة المسؤولة عن معالجة البيانات الشخصية التي تقدّمها عبر هذا الموقع وبوابة العملاء، وفقاً لنظام حماية البيانات الشخصية في المملكة. ونحن الجهة التي تحدد أغراض جمع هذه البيانات ووسائل معالجتها، ونلتزم بحمايتها واستخدامها في حدود ما توضّحه هذه السياسة.</p>
      <p>لأي استفسار يتعلق ببياناتك أو بممارسة حقوقك، تواصل معنا عبر البيانات الموضّحة في نهاية هذه الصفحة.</p>

      <h2>2. البيانات التي نجمعها</h2>
      <h3>عند إرسال طلب عرض سعر</h3>
      <ul>
        <li>الاسم واسم الشركة (اختياري) والبريد الإلكتروني.</li>
        <li>رقم الجوال (اختياري) للتواصل عبر الهاتف أو واتساب.</li>
        <li>نوع المشروع والباقة المختارة ونبذة الفكرة التي تكتبها.</li>
      </ul>
      <h3>عند إنشاء حساب في بوابة العملاء</h3>
      <ul>
        <li>الاسم والبريد الإلكتروني وكلمة المرور، وتُحفظ كلمة المرور مشفّرة ولا يمكن لأحد الاطلاع عليها.</li>
        <li>الرسائل والطلبات التي ترسلها لفريقنا، وبيانات المشاريع المرتبطة ببريدك.</li>
      </ul>
      <h3>بيانات تقنية</h3>
      <ul>
        <li>رمز جلسة الدخول الذي يُحفظ في متصفحك ليبقيك مسجلاً. لا نستخدم ملفات تعريف ارتباط إعلانية ولا أدوات تتبع تسويقية.</li>
      </ul>

      <h2>3. كيف نستخدم بياناتك</h2>
      <ul>
        <li>الرد على طلبك والتواصل معك بخصوص مشروعك.</li>
        <li>تشغيل حسابك في بوابة العملاء وعرض حالة مشاريعك.</li>
        <li>إرسال إشعارات لفريقنا عند وصول طلب جديد.</li>
        <li>الوفاء بالتزاماتنا النظامية والتعاقدية.</li>
      </ul>
      <p>لا نبيع بياناتك ولا نستخدمها لأغراض إعلانية.</p>

      <h2>4. مشاركة البيانات والإفصاح عنها</h2>
      <p>لا نبيع بياناتك الشخصية ولا نؤجّرها، ولا نشاركها مع أي جهة لأغراض تسويقية. ونستعين بمزوّدي خدمات تقنية موثوقين لتشغيل الموقع، ويقتصر وصول كل منهم على البيانات اللازمة لأداء خدمته، وفق شروط خدمتهم وسياسات الخصوصية الخاصة بهم:</p>
      <ul>
        <li><b>البنية السحابية والنطاق:</b> نعتمد على منصات سحابية عالمية، منها Cloudflare لإدارة النطاق وحمايته.</li>
        <li><b>قاعدة البيانات وتسجيل الدخول:</b> تُحفظ بيانات هذا الموقع على خوادم سحابية في الاتحاد الأوروبي (أيرلندا).</li>
        <li><b>البريد الإلكتروني:</b> مزوّد خدمة لإرسال الإشعارات ورموز التحقق.</li>
        <li><b>الدفع الإلكتروني:</b> عند السداد عبر إحدى بوابات الدفع، تُعالَج بيانات البطاقة لدى البوابة مباشرة، ولا نطّلع عليها ولا نخزّنها.</li>
      </ul>
      <h3>استضافة مشاريع العملاء وقواعد بياناتهم</h3>
      <p>نوفّر لكل عميل خيارات الاستضافة التي تناسب متطلباته ومتطلبات الجهات التنظيمية في قطاعه:</p>
      <ul>
        <li><b>استضافة سحابية</b>، بما فيها مراكز بيانات داخل المملكة العربية السعودية.</li>
        <li><b>استضافة محلية</b> على خوادم العميل الخاصة.</li>
        <li><b>قاعدة بيانات مستقلة لكل عميل</b>، لا تُشارك مع أي عميل آخر.</li>
      </ul>
      <p>ويُحدَّد موقع الاستضافة والتخزين في عقد كل مشروع حسب رغبة العميل.</p>
      <h3>نقل البيانات خارج المملكة</h3>
      <p>قد تُعالَج بعض بيانات هذا الموقع على خوادم خارج المملكة. أما بيانات مشاريع العملاء، فنعتمد فيها التخزين السحابي داخل المملكة متى طلب العميل ذلك أو اقتضته الأنظمة. ونلتزم في كل الحالات بأحكام نظام حماية البيانات الشخصية ولوائحه التنفيذية، ونقصر أي نقل على الحد الأدنى اللازم لتقديم الخدمة.</p>
      <h3>الإفصاح النظامي</h3>
      <p>لا نفصح عن بياناتك لأي طرف آخر إلا بموافقتك، أو إذا اقتضى ذلك نظام نافذ، أو بناءً على طلب رسمي من جهة مختصة. وفي حال ورود طلب نظامي، نُبلغ العميل بإشعار رسمي قبل الإفصاح أو فور حدوثه، ما لم يمنع النظام أو الجهة الطالبة ذلك.</p>

      <h2>5. مدة الاحتفاظ</h2>
      <p>نحتفظ ببيانات الطلبات والحسابات طوال مدة تعاملنا معك، وبعدها للمدة التي تقتضيها الأنظمة، ثم نتلفها. يمكنك طلب حذف بياناتك في أي وقت.</p>

      <h2>6. حقوقك</h2>
      <p>يكفل لك نظام حماية البيانات الشخصية في المملكة العربية السعودية ولوائحه التنفيذية الحقوق التالية، ونلتزم بتمكينك منها دون أي مقابل:</p>
      <ul>
        <li><b>الحق في العلم:</b> أن تعرف الأساس النظامي لجمع بياناتك، والغرض من جمعها، وكيفية معالجتها والجهات التي قد تطّلع عليها.</li>
        <li><b>الحق في الوصول:</b> أن تطّلع على بياناتك الشخصية المحفوظة لدينا، وتحصل على نسخة منها بصيغة واضحة ومقروءة.</li>
        <li><b>الحق في التصحيح:</b> أن تطلب تصحيح بياناتك أو استكمالها أو تحديثها متى كانت غير دقيقة أو ناقصة.</li>
        <li><b>الحق في الإتلاف:</b> أن تطلب إتلاف بياناتك متى انتفت الحاجة إليها، ما لم يوجب نظام نافذ الاحتفاظ بها مدة معينة.</li>
        <li><b>الحق في الرجوع عن الموافقة:</b> أن ترجع في أي وقت عن موافقتك على معالجة بياناتك، دون أن يؤثر ذلك على مشروعية المعالجة التي تمت قبل الرجوع.</li>
      </ul>
      <h3>آلية ممارسة الحقوق</h3>
      <p>لممارسة أي من هذه الحقوق، أرسل طلبك عبر البريد الإلكتروني الموضّح في نهاية هذه الصفحة. وقد نطلب منك التحقق من هويتك قبل تنفيذ الطلب حمايةً لبياناتك. ونرد على طلبك خلال مدة لا تتجاوز 30 يوماً من تاريخ استلامه.</p>
      <h3>تقديم الشكوى</h3>
      <p>إذا رأيت أن معالجة بياناتك تمت بما يخالف النظام، يحق لك تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) بصفتها الجهة المختصة بالإشراف على تطبيق نظام حماية البيانات الشخصية.</p>

      <h2>7. حماية البيانات</h2>
      <p>نستخدم اتصالاً مشفراً (HTTPS)، ونخزن كلمات المرور مشفّرة، ونحصر الوصول إلى لوحة الإدارة في الفريق المخول. لا يمكن لأي عميل الاطلاع على بيانات عميل آخر.</p>

      <h2>8. تعديل السياسة</h2>
      <p>قد نحدّث هذه السياسة، وننشر أي تعديل في هذه الصفحة مع تاريخ التحديث.</p>
    </LegalLayout>
  )
}

function TermsAr() {
  return (
    <LegalLayout
      path="/terms"
      title="الشروط والأحكام"
      intro={`تنظم هذه الشروط استخدامك لموقع ${COMPANY.name} وبوابة العملاء. باستخدامك للموقع فإنك توافق عليها.`}
    >
      <h2>1. الخدمات</h2>
      <p>نقدم خدمات تصميم وتطوير تطبيقات الجوال والويب وصيانتها. يعرض الموقع معلومات عامة عن خدماتنا ويتيح طلب عروض الأسعار ومتابعة المشاريع.</p>

      <h2>2. الأسعار والعروض</h2>
      <p>الأسعار المعروضة في الموقع تقديرية وتبدأ منها التكلفة، ولا تُعد عرضاً ملزماً. ويخضع الإلغاء والاسترداد لـ<a href="/refund">سياسة الإلغاء والاسترداد</a>. يتحدد نطاق العمل والسعر والجدول الزمني وملكية المخرجات في عرض مكتوب أو عقد يوقّعه الطرفان، وتكون له الأولوية عند أي تعارض مع هذه الشروط.</p>

      <h2>3. حساب العميل</h2>
      <ul>
        <li>تلتزم بتقديم بيانات صحيحة وبالتسجيل ببريدك الفعلي.</li>
        <li>أنت مسؤول عن سرية كلمة المرور وعن أي نشاط يتم من خلال حسابك.</li>
        <li>يحق لنا إيقاف أي حساب يُساء استخدامه.</li>
      </ul>

      <h2>4. الاستخدام المقبول</h2>
      <p>يُمنع استخدام الموقع لأي غرض مخالف للأنظمة، أو محاولة الوصول إلى بيانات الآخرين، أو تعطيل الموقع، أو إرسال محتوى مسيء أو مضلل.</p>

      <h2>5. الملكية الفكرية</h2>
      <p>تصميم الموقع وشعاره ونصوصه مملوكة لـ {COMPANY.name}، ولا يجوز نسخها دون إذن كتابي. أما ملكية الشيفرة والتصاميم الخاصة بمشاريع العملاء فيحددها عقد كل مشروع.</p>

      <h2>6. المحتوى التوضيحي</h2>
      <p>قد يعرض الموقع نماذج وأمثلة توضيحية لشرح خدماتنا، ولا تمثل بالضرورة نتائج مضمونة لمشروعك.</p>

      <h2>7. حدود المسؤولية</h2>
      <p>نبذل العناية المعقولة لإبقاء الموقع متاحاً ودقيقاً، لكننا لا نضمن خلوه من الانقطاع أو الأخطاء، ولا نتحمل مسؤولية أي خسارة غير مباشرة ناتجة عن استخدام الموقع.</p>

      <h2>8. الخصوصية</h2>
      <p>نعالج بياناتك الشخصية وفق <a href="/privacy">سياسة الخصوصية</a>.</p>

      <h2>9. النظام الواجب التطبيق</h2>
      <p>تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختص الجهات القضائية في المملكة بالنظر في أي نزاع ينشأ عنها.</p>

      <h2>10. التعديلات</h2>
      <p>قد نعدّل هذه الشروط، ويسري التعديل من تاريخ نشره في هذه الصفحة.</p>
    </LegalLayout>
  )
}

function RefundAr() {
  const s = useSettings()
  const wa = s.whatsapp ? `+${s.whatsapp}` : ''
  return (
    <LegalLayout
      path="/refund"
      title="سياسة الإلغاء والاسترداد"
      intro={`توضح هذه السياسة متى يحق لك إلغاء طلبك لدى ${COMPANY.name}، وكيف يُحتسب المبلغ المسترد.`}
    >
      <h2>1. نطاق السياسة</h2>
      <p>تنطبق هذه السياسة على جميع الخدمات التي يقدمها {COMPANY.name} عبر makwad.com: تطوير المواقع والتطبيقات والأنظمة، والتصميم والهويات، والمواد الدعائية، والاستضافة، والصيانة. تُقرأ هذه السياسة مع عرض السعر المعتمد لكل مشروع، وإذا تعارض حكم فيها مع نص صريح في عرض السعر يُعمل بعرض السعر.</p>

      <h2>2. الإلغاء قبل بدء العمل</h2>
      <p>يحق للعميل إلغاء الطلب خلال 7 أيام من اعتماد عرض السعر، بشرط ألا يكون العمل على المشروع قد بدأ، ويُسترد المبلغ المدفوع كاملاً. ويُعد العمل قد بدأ عند تسليم أول مخرج للعميل، مثل المخططات الأولية أو مفاهيم الشعار.</p>

      <h2>3. الإلغاء بعد بدء العمل</h2>
      <p>يمكن للعميل إلغاء المشروع في أي مرحلة بطلب مكتوب، ويُحتسب المبلغ كالتالي:</p>
      <ul>
        <li>المراحل المسلّمة أو المعتمدة لا تُسترد قيمتها، وتنتقل ملكيتها للعميل بعد سداد قيمتها.</li>
        <li>المرحلة الجارية تُحتسب بنسبة ما أُنجز منها حسب خطة المراحل في عرض السعر.</li>
        <li>يُسترد الفرق بين ما دفعه العميل وقيمة ما أُنجز، إن وُجد.</li>
      </ul>

      <h2>4. ما لا يُسترد</h2>
      <ul>
        <li>الأعمال المصممة حسب طلب العميل بعد تسليمها واعتمادها.</li>
        <li>رسوم الجهات الخارجية المدفوعة نيابة عن العميل، مثل الدومين والاستضافة واشتراكات المتاجر وبوابات الدفع.</li>
        <li>رسوم التسليم المستعجل بعد بدء التنفيذ.</li>
      </ul>

      <h2>5. الاشتراكات الشهرية</h2>
      <p>يمكن إلغاء اشتراك الصيانة أو الاستضافة في أي وقت، ويسري الإلغاء من نهاية الشهر الجاري، ولا يُسترد مبلغ الشهر الذي بدأ.</p>

      <h2>6. التأخير من طرفنا</h2>
      <p>إذا تأخرنا في تسليم أي مرحلة أكثر من 14 يوماً عن الموعد المتفق عليه دون سبب من العميل، يحق للعميل إلغاء المشروع واسترداد قيمة المراحل التي لم تُسلَّم كاملة.</p>

      <h2>7. طريقة طلب الإلغاء أو الاسترداد</h2>
      <p>يُرسل الطلب كتابياً عبر بوابة العملاء أو واتساب{wa && <> (<span className="mono" dir="ltr">{wa}</span>)</>}، مع رقم عرض السعر. نرد على الطلب خلال 3 أيام عمل، ويُعاد المبلغ المستحق خلال 14 يوماً من الموافقة، بنفس طريقة الدفع الأصلية متى ما أمكن.</p>

      <h2>8. النظام الواجب التطبيق</h2>
      <p>تخضع هذه السياسة لأنظمة المملكة العربية السعودية، ومنها نظام التجارة الإلكترونية، ولا تُخل بأي حق يكفله النظام للمستهلك.</p>
    </LegalLayout>
  )
}

export function Privacy() { return useLang().en ? <PrivacyEn /> : <PrivacyAr /> }
export function Terms() { return useLang().en ? <TermsEn /> : <TermsAr /> }
export function Refund() { return useLang().en ? <RefundEn /> : <RefundAr /> }

const NAME_EN = 'Makwad Studio'

function PrivacyEn() {
  return (
    <LegalLayout
      path="/privacy"
      title="Privacy policy"
      intro={`This policy explains how ${NAME_EN} collects, uses and protects your personal data when you use this website and the client portal, in line with the Personal Data Protection Law of the Kingdom of Saudi Arabia.`}
    >
      <h2>1. Who we are</h2>
      <p>“{NAME_EN}” is a Saudi business specialising in designing and developing apps, websites, systems and AI solutions, based in Riyadh, Saudi Arabia.</p>
      <p>We are the party responsible for processing the personal data you provide through this website and the client portal, under the Kingdom’s Personal Data Protection Law. We decide why this data is collected and how it is processed, and we are committed to protecting it and using it only as this policy describes.</p>
      <p>For any question about your data or to exercise your rights, contact us using the details at the end of this page.</p>

      <h2>2. Data we collect</h2>
      <h3>When you send a quote request</h3>
      <ul>
        <li>Your name, company name (optional) and email address.</li>
        <li>Your mobile number, to contact you by phone or WhatsApp.</li>
        <li>The project type, the plan you chose and the description you write.</li>
      </ul>
      <h3>When you create a client portal account</h3>
      <ul>
        <li>Your name, email address and password. The password is stored encrypted and no one can view it.</li>
        <li>The messages and requests you send our team, and the data of projects linked to your email.</li>
      </ul>
      <h3>Technical data</h3>
      <ul>
        <li>A sign-in session token stored in your browser to keep you signed in. We use no advertising cookies and no marketing trackers.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To reply to your request and contact you about your project.</li>
        <li>To run your client portal account and show the status of your projects.</li>
        <li>To notify our team when a new request arrives.</li>
        <li>To meet our legal and contractual obligations.</li>
      </ul>
      <p>We do not sell your data or use it for advertising.</p>

      <h2>4. Sharing and disclosure</h2>
      <p>We do not sell or rent your personal data, and we do not share it with anyone for marketing. We use trusted technical service providers to run the website, each with access only to the data needed for its service, under its own terms and privacy policy:</p>
      <ul>
        <li><b>Cloud infrastructure and domain:</b> we rely on global cloud platforms, including Cloudflare to manage and protect the domain.</li>
        <li><b>Database and sign-in:</b> this website’s data is stored on cloud servers in the European Union (Ireland).</li>
        <li><b>Email:</b> a provider that sends notifications and verification codes.</li>
        <li><b>Online payments:</b> when you pay through a payment gateway, card details are processed by the gateway directly; we never see or store them.</li>
      </ul>
      <h3>Hosting for client projects and databases</h3>
      <p>We give each client the hosting options that fit their needs and their sector’s regulators:</p>
      <ul>
        <li><b>Cloud hosting</b>, including data centres inside Saudi Arabia.</li>
        <li><b>On-premises hosting</b> on the client’s own servers.</li>
        <li><b>A separate database for each client</b>, never shared with another client.</li>
      </ul>
      <p>The hosting and storage location is set in each project’s contract, as the client chooses.</p>
      <h3>Transfers outside the Kingdom</h3>
      <p>Some of this website’s data may be processed on servers outside the Kingdom. For client project data, we use cloud storage inside the Kingdom whenever the client asks for it or regulations require it. In every case we comply with the Personal Data Protection Law and its implementing regulations, and keep any transfer to the minimum needed to provide the service.</p>
      <h3>Legal disclosure</h3>
      <p>We disclose your data to no one else except with your consent, where an applicable law requires it, or at the official request of a competent authority. If we receive a legal request, we notify the client formally before disclosure or as soon as it happens, unless the law or the requesting authority prevents it.</p>

      <h2>5. Retention</h2>
      <p>We keep request and account data for as long as we work with you, then for the period regulations require, after which we destroy it. You can ask us to delete your data at any time.</p>

      <h2>6. Your rights</h2>
      <p>The Saudi Personal Data Protection Law and its implementing regulations give you the following rights, which we honour free of charge:</p>
      <ul>
        <li><b>Right to be informed:</b> to know the legal basis and purpose for collecting your data, how it is processed and who may access it.</li>
        <li><b>Right of access:</b> to see the personal data we hold about you and get a copy in a clear, readable format.</li>
        <li><b>Right to correction:</b> to have your data corrected, completed or updated if it is inaccurate or incomplete.</li>
        <li><b>Right to destruction:</b> to have your data destroyed once it is no longer needed, unless an applicable law requires us to keep it for a set period.</li>
        <li><b>Right to withdraw consent:</b> to withdraw your consent to processing at any time, without affecting the lawfulness of processing carried out before.</li>
      </ul>
      <h3>How to exercise your rights</h3>
      <p>Send your request to the email address at the end of this page. We may ask you to verify your identity first, to protect your data. We reply within 30 days of receiving the request.</p>
      <h3>Complaints</h3>
      <p>If you believe your data was processed in breach of the law, you may complain to the Saudi Data and AI Authority (SDAIA), the authority that supervises the Personal Data Protection Law.</p>

      <h2>7. Data protection</h2>
      <p>We use an encrypted connection (HTTPS), store passwords encrypted, and limit access to the admin dashboard to the authorised team. No client can see another client’s data.</p>

      <h2>8. Changes to this policy</h2>
      <p>We may update this policy, and we publish every change on this page with its date.</p>
    </LegalLayout>
  )
}

function TermsEn() {
  return (
    <LegalLayout
      path="/terms"
      title="Terms and conditions"
      intro={`These terms govern your use of the ${NAME_EN} website and client portal. By using the website you accept them.`}
    >
      <h2>1. Services</h2>
      <p>We provide design, development and maintenance of mobile and web apps. The website gives general information about our services and lets you request quotes and follow projects.</p>

      <h2>2. Prices and quotes</h2>
      <p>Prices shown on the website are estimates and starting prices, not a binding offer. Cancellations and refunds follow the <a href="/en/refund">cancellation and refund policy</a>. The scope, price, timeline and ownership of deliverables are set in a written quote or contract signed by both parties, which prevails over these terms in any conflict.</p>

      <h2>3. Client account</h2>
      <ul>
        <li>You agree to give accurate information and to register with your real email address.</li>
        <li>You are responsible for keeping your password confidential and for any activity on your account.</li>
        <li>We may suspend any account that is misused.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You may not use the website for any unlawful purpose, try to access other people’s data, disrupt the website, or send offensive or misleading content.</p>

      <h2>5. Intellectual property</h2>
      <p>The website’s design, logo and texts belong to {NAME_EN} and may not be copied without written permission. Ownership of the code and designs of client projects is set by each project’s contract.</p>

      <h2>6. Illustrative content</h2>
      <p>The website may show samples and illustrative examples to explain our services; they do not necessarily represent guaranteed results for your project.</p>

      <h2>7. Limitation of liability</h2>
      <p>We take reasonable care to keep the website available and accurate, but we do not guarantee it is free of interruptions or errors, and we are not liable for any indirect loss arising from its use.</p>

      <h2>8. Privacy</h2>
      <p>We process your personal data under our <a href="/en/privacy">privacy policy</a>.</p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of the Kingdom of Saudi Arabia, and the Kingdom’s courts have jurisdiction over any dispute arising from them.</p>

      <h2>10. Changes</h2>
      <p>We may change these terms; a change takes effect from the date it is published on this page.</p>
    </LegalLayout>
  )
}

function RefundEn() {
  const s = useSettings()
  const wa = s.whatsapp ? `+${s.whatsapp}` : ''
  return (
    <LegalLayout
      path="/refund"
      title="Cancellation and refund policy"
      intro={`This policy explains when you can cancel an order with ${NAME_EN}, and how a refund is calculated.`}
    >
      <h2>1. Scope</h2>
      <p>This policy applies to every service {NAME_EN} provides through makwad.com: development of websites, apps and systems, design and identities, promotional material, hosting and maintenance. It is read together with the approved quote for each project; where it conflicts with an explicit term in the quote, the quote applies.</p>

      <h2>2. Cancelling before work starts</h2>
      <p>The client may cancel within 7 days of approving the quote, provided work on the project has not started, and the amount paid is refunded in full. Work counts as started once the first deliverable reaches the client, such as wireframes or logo concepts.</p>

      <h2>3. Cancelling after work starts</h2>
      <p>The client may cancel the project at any stage with a written request, calculated as follows:</p>
      <ul>
        <li>Delivered or approved stages are not refunded, and their ownership passes to the client once paid.</li>
        <li>The stage in progress is charged by the share completed, according to the stage plan in the quote.</li>
        <li>Any difference between what the client paid and the value of the work done is refunded.</li>
      </ul>

      <h2>4. Non-refundable items</h2>
      <ul>
        <li>Work designed to the client’s order once delivered and approved.</li>
        <li>Third-party fees paid on the client’s behalf, such as domains, hosting, store subscriptions and payment gateways.</li>
        <li>Rush-delivery fees once work has started.</li>
      </ul>

      <h2>5. Monthly subscriptions</h2>
      <p>A maintenance or hosting subscription can be cancelled at any time; cancellation takes effect at the end of the current month, and a month that has started is not refunded.</p>

      <h2>6. Delays on our side</h2>
      <p>If we deliver any stage more than 14 days after the agreed date for a reason not caused by the client, the client may cancel the project and receive a full refund for the stages not yet delivered.</p>

      <h2>7. How to request a cancellation or refund</h2>
      <p>Send your request in writing through the client portal or WhatsApp{wa && <> (<span className="mono" dir="ltr">{wa}</span>)</>}, with the quote number. We reply within 3 working days, and the amount due is returned within 14 days of approval, by the original payment method where possible.</p>

      <h2>8. Governing law</h2>
      <p>This policy is governed by the laws of the Kingdom of Saudi Arabia, including the E-Commerce Law, and does not affect any right the law gives to consumers.</p>
    </LegalLayout>
  )
}
