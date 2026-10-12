// Device mockups for portfolio cards. The admin picks one per work.
const top = `<div class="ms-top"><span class="mono">9:41</span><span class="ms-bat"></span></div>`

export const ARTS: Record<string, { label: string; html: string }> = {
  coffee: { label: 'تطبيق طلبات (جوال)', html: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">محمصة الخليج</div>
      <div class="ms-search">ابحث عن قهوتك المفضلة</div>
      <div class="ms-row"><i class="cup"></i><div><b>V60 إثيوبي</b><small>18 ر.س</small></div><em>+</em></div>
      <div class="ms-row"><i class="cup c2"></i><div><b>لاتيه بارد</b><small>21 ر.س</small></div><em>+</em></div>
      <div class="ms-row"><i class="cup c3"></i><div><b>كورتادو</b><small>16 ر.س</small></div><em>+</em></div>
      <div class="ms-cta">إتمام الطلب · 55 ر.س</div></div></div>` },
  booking: { label: 'حجز مواعيد (جوال)', html: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">اختر موعدك</div>
      <div class="ms-days"><span>أحد<b>12</b></span><span class="on">اثنين<b>13</b></span><span>ثلاثاء<b>14</b></span><span>أربعاء<b>15</b></span></div>
      <div class="ms-slots"><span>9:00</span><span>9:30</span><span class="off">10:00</span><span class="on">10:30</span><span>11:00</span><span class="off">11:30</span></div>
      <div class="ms-row"><i class="av">س</i><div><b>د. سارة الحربي</b><small>جلدية · عيادة الشاطئ</small></div></div>
      <div class="ms-cta">تأكيد الحجز</div></div></div>` },
  dashboard: { label: 'لوحة تحكم (ويب)', html: `<div class="dev-laptop"><div class="lap-screen">
      <div class="lap-side"><i class="lg"></i><i class="on"></i><i></i><i></i><i></i></div>
      <div class="lap-main">
        <div class="lap-kpis"><div><small>الأصناف</small><b class="mono">1,240</b></div><div><small>الفروع</small><b class="mono">14</b></div><div><small>مخزون منخفض</small><b class="mono warn">23</b></div></div>
        <div class="lap-chart"><i style="height:40%"></i><i style="height:62%"></i><i style="height:48%"></i><i style="height:75%"></i><i style="height:58%"></i><i style="height:88%"></i><i style="height:70%"></i></div>
        <div class="lap-rows"><span></span><span></span><span></span></div>
      </div></div><div class="lap-base"></div></div>` },
  services: { label: 'خدمات وتتبع (جوال)', html: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">وش تحتاج اليوم؟</div>
      <div class="ms-grid">
        <span><i><svg viewBox="0 0 24 24"><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/></svg></i>سباكة</span>
        <span><i><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg></i>كهرباء</span>
        <span><i><svg viewBox="0 0 24 24"><path d="M12 2v20M3 7l18 10M21 7L3 17"/></svg></i>تكييف</span>
        <span><i><svg viewBox="0 0 24 24"><rect x="3" y="3" width="14" height="7" rx="2"/><path d="M17 6h3v6h-8v3"/><rect x="10" y="15" width="4" height="6" rx="1"/></svg></i>دهانات</span>
      </div>
      <div class="ms-track"><b>الفني في الطريق</b><small>ماجد · يصل خلال 18 دقيقة</small><div class="bar"><i></i></div></div>
      </div></div>` },
  course: { label: 'منصة تعليمية (ويب)', html: `<div class="dev-laptop"><div class="lap-screen">
      <div class="lap-main">
        <div class="lap-video"><span class="play"></span><div class="prog"><i></i></div></div>
        <div class="lap-cap"><b>تصميم واجهات التطبيقات</b><small>الدرس 4 من 12</small></div>
      </div>
      <div class="lap-list"><span class="done">مقدمة</span><span class="done">الألوان</span><span class="done">الخطوط</span><span class="on">الشبكات</span><span>المكونات</span></div>
      </div><div class="lap-base"></div></div>` },
  pitch: { label: 'حجز ملاعب (جوال)', html: `<div class="dev-phone">${top}<div class="ms-pad">
      <div class="ms-title">ملعب الدانة</div>
      <div class="ms-sub">بادل · الخبر</div>
      <div class="pitch"><i class="mid"></i><i class="net"></i></div>
      <div class="ms-slots"><span>6 م</span><span class="on">7 م</span><span class="off">8 م</span></div>
      <div class="ms-cta">احجز · 250 ر.س</div></div></div>` },
}

export const COLORS: Record<string, { label: string; css: string }> = {
  accent: { label: 'أخضر', css: 'var(--accent)' },
  clay: { label: 'طيني', css: 'var(--clay)' },
  sky: { label: 'أزرق', css: 'var(--sky)' },
  sand: { label: 'رملي', css: 'var(--sand)' },
}
