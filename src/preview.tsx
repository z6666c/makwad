// Review-only build: renders the admin dashboard with sample data and no backend.
// Included only when VITE_PREVIEW=1 (the screenshot workflow), never in the deployed site.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import type { ConvexReactClient } from 'convex/react'
import { getFunctionName } from 'convex/server'
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { DashFrame } from './pages/Dashboard'
import { DEFAULT_SETTINGS } from './site-config'

const now = Date.now()
const d = (days: number) => now - days * 86400000
const iso = (days: number) => new Date(now + days * 86400000).toISOString().slice(0, 10)

const leads = [
  { _id: 'l1', _creationTime: d(0.2), name: 'سارة القحطاني', company: 'مؤسسة الريان', email: 'sara@alrayan.sa', phone: '966551234567', coupon: 'MAKWAD10', assignee: 'sultan@makwad.com', followUp: iso(0), types: ['موقع أو تطبيق ويب'], plan: 'النمو', message: 'متجر إلكتروني لمنتجات العناية مع دفع مدى وApple Pay.', source: 'website', status: 'new', amount: 12000 },
  { _id: 'l2', _creationTime: d(1), name: 'فهد العتيبي', company: 'شركة مسار اللوجستية', email: 'fahad@masar.sa', types: ['تطبيق جوال'], plan: 'النمو', message: 'تطبيق مندوبين مع تتبع مباشر ولوحة إدارة.', source: 'website', status: 'contacted', amount: 37000 },
  { _id: 'l3', _creationTime: d(3), name: 'نورة الشهري', company: 'مخبز السنابل', email: 'noura@sanabel.sa', types: ['أداة ذكاء اصطناعي'], plan: 'النمو', message: 'روبوت واتساب يستقبل الطلبات ويرد على الاستفسارات.', source: 'website', status: 'new', amount: 7000 },
  { _id: 'l4', _creationTime: d(4), name: 'عبدالله السالم', company: 'مكتب السالم للمحاماة', email: 'abdullah@salem.law', types: ['تحليل مشروع'], plan: 'الانطلاقة', message: 'نبغى وثيقة متطلبات لنظام إدارة القضايا.', source: 'website', status: 'won', amount: 3500 },
  { _id: 'l5', _creationTime: d(6), name: 'ريم الدوسري', email: 'reem@gmail.com', types: ['موقع أو تطبيق ويب'], plan: 'الانطلاقة', message: 'صفحة تعريفية لمشروعي.', source: 'website', status: 'contacted', amount: 2300 },
  { _id: 'l6', _creationTime: d(9), name: 'ماجد الحربي', company: 'مجموعة رواء', email: 'majed@rawa.sa', types: ['برنامج أو نظام'], plan: 'المنشآت', message: 'نظام ERP للمستودعات مع فوترة إلكترونية.', source: 'website', status: 'won', amount: 38500 },
  { _id: 'l7', _creationTime: d(12), name: 'لمى الزهراني', company: 'نُقطة', email: 'lama@noqta.sa', types: ['تصميم'], plan: 'الانطلاقة', message: 'تصميم تطبيق حتى 15 شاشة.', source: 'client', status: 'lost' },
  { _id: 'l8', _creationTime: d(17), name: 'تركي المطيري', email: 'turki@outlook.com', types: ['تطبيق جوال'], plan: 'النمو', message: 'تطبيق حجوزات لصالون.', source: 'website', status: 'contacted', amount: 15500 },
  { _id: 'l9', _creationTime: d(26), name: 'هيفاء العنزي', company: 'بيت الخبرة', email: 'haifa@khebra.sa', types: ['صيانة'], plan: 'الانطلاقة', message: 'باقة صيانة شهرية للموقع.', source: 'website', status: 'won', amount: 8550 },
  { _id: 'l10', _creationTime: d(38), name: 'خالد الغامدي', company: 'الدانة العقارية', email: 'khaled@aldana.sa', types: ['موقع أو تطبيق ويب', 'ربط وتكامل'], plan: 'النمو', message: 'منصة عقارية مع ربط بوابة الدفع.', source: 'website', status: 'won', amount: 22000 },
]

const projects = [
  { _id: 'p1', _creationTime: d(30), title: 'نظام مستودعات مجموعة رواء', clientName: 'ماجد الحربي', clientEmail: 'majed@rawa.sa', platform: 'ويب', stage: 2, progress: 55, dueDate: iso(9),
    payments: [{ title: 'دفعة أولى (40%)', amount: 15400, status: 'paid' }, { title: 'اعتماد التصميم (30%)', amount: 11550, status: 'due' }, { title: 'التسليم (30%)', amount: 11550, status: 'pending' }] },
  { _id: 'p2', _creationTime: d(36), title: 'منصة الدانة العقارية', clientName: 'خالد الغامدي', clientEmail: 'khaled@aldana.sa', platform: 'ويب', stage: 3, progress: 85, dueDate: iso(4),
    payments: [{ title: 'دفعة أولى (40%)', amount: 8800, status: 'paid' }, { title: 'اعتماد التصميم (30%)', amount: 6600, status: 'paid' }, { title: 'التسليم (30%)', amount: 6600, status: 'pending' }] },
  { _id: 'p3', _creationTime: d(3), title: 'وثيقة متطلبات نظام القضايا', clientName: 'عبدالله السالم', clientEmail: 'abdullah@salem.law', platform: 'تحليل', stage: 0, progress: 20, dueDate: iso(6),
    payments: [{ title: 'دفعة كاملة', amount: 3500, status: 'paid' }] },
  { _id: 'p4', _creationTime: d(25), title: 'صيانة موقع بيت الخبرة', clientName: 'هيفاء العنزي', clientEmail: 'haifa@khebra.sa', platform: 'ويب', stage: 2, progress: 40,
    payments: [{ title: 'اشتراك 6 أشهر', amount: 8550, status: 'due' }] },
]

const quotes = [
  { _id: 'q1', _creationTime: d(0.5), number: 'MK-2026-004', clientName: 'فهد العتيبي', clientEmail: 'fahad@masar.sa', company: 'شركة مسار اللوجستية', title: 'تطبيق مندوبين — شركة مسار', leadId: 'l2',
    items: [{ label: 'تطبيقات الجوال — تطبيق متوسط', qty: 1, price: 28000 }, { label: 'تطبيقات الجوال — خرائط وتتبع مباشر', qty: 1, price: 4000 }, { label: 'تطبيقات الجوال — لوحة تحكم للإدارة', qty: 1, price: 5000 }],
    discount: 2000, vat: true, validDays: 14, notes: 'يشمل 3 جولات تعديل على التصميم ودعماً فنياً لمدة 3 أشهر.', status: 'sent', createdBy: 'أحمد' },
  { _id: 'q2', _creationTime: d(2), number: 'MK-2026-003', clientName: 'تركي المطيري', clientEmail: 'turki@outlook.com', title: 'تطبيق حجوزات صالون', items: [{ label: 'تطبيقات الجوال — iOS وأندرويد', qty: 1, price: 16000 }, { label: 'حجوزات ومواعيد', qty: 1, price: 3000 }], discount: 0, vat: false, validDays: 14, status: 'draft', createdBy: 'أحمد' },
  { _id: 'q3', _creationTime: d(10), number: 'MK-2026-002', clientName: 'ماجد الحربي', clientEmail: 'majed@rawa.sa', company: 'مجموعة رواء', title: 'نظام مستودعات وفوترة', items: [{ label: 'نظام متكامل', qty: 1, price: 30000 }, { label: 'الفوترة الإلكترونية', qty: 1, price: 3500 }, { label: 'تقارير ولوحة مؤشرات', qty: 1, price: 2500 }, { label: 'نقل البيانات القديمة', qty: 1, price: 2000 }], discount: 0, vat: false, validDays: 30, status: 'accepted', projectId: 'p1', createdBy: 'أحمد' },
  { _id: 'q4', _creationTime: d(14), number: 'MK-2026-001', clientName: 'لمى الزهراني', clientEmail: 'lama@noqta.sa', company: 'نُقطة', title: 'تصميم تطبيق نُقطة', items: [{ label: 'تصميم تطبيق', qty: 1, price: 6000 }], discount: 0, vat: false, validDays: 14, status: 'rejected', createdBy: 'أحمد' },
]

const users = [
  { key: 'u1', userId: 'u1', email: 'alrashidi7amad@gmail.com', name: 'أحمد الرشيدي', role: 'owner', joined: d(60), pending: false },
  { key: 'u2', userId: 'u2', email: 'sultan@makwad.com', name: 'سلطان', role: 'staff', joined: d(20), pending: false },
  { key: 'u3', userId: 'u3', email: 'majed@rawa.sa', name: 'ماجد الحربي', role: 'client', joined: d(28), pending: false },
]

const activity = [
  { _id: 'a1', _creationTime: d(0.05), actor: 'سلطان', kind: 'lead', text: 'غيّر حالة طلب فهد العتيبي إلى «تم التواصل»' },
  { _id: 'a2', _creationTime: d(0.2), actor: 'أحمد الرشيدي', kind: 'quote', text: 'أرسل العرض MK-2026-004 إلى fahad@masar.sa' },
  { _id: 'a3', _creationTime: d(0.4), actor: 'أحمد الرشيدي', kind: 'coupon', text: 'أنشأ كود الخصم MAKWAD10 (10%)' },
  { _id: 'a4', _creationTime: d(1), actor: 'أحمد الرشيدي', kind: 'lead', text: 'أسند طلب سارة القحطاني إلى sultan@makwad.com' },
  { _id: 'a5', _creationTime: d(2), actor: 'ماجد الحربي', kind: 'quote', text: 'قبِل العميل ماجد الحربي العرض MK-2026-002' },
  { _id: 'a6', _creationTime: d(2.1), actor: 'سلطان', kind: 'project', text: 'حوّل العرض MK-2026-002 إلى مشروع «نظام مستودعات وفوترة»' },
]
const coupons = [
  { _id: 'c1', _creationTime: d(1), code: 'MAKWAD10', kind: 'percent', value: 10, active: true, uses: 3, maxUses: 50, note: 'إطلاق الموقع' },
  { _id: 'c2', _creationTime: d(5), code: 'RIYADH500', kind: 'fixed', value: 500, active: true, uses: 1, minTotal: 5000, expires: iso(30) },
  { _id: 'c3', _creationTime: d(40), code: 'SUMMER', kind: 'percent', value: 15, active: true, uses: 12, expires: iso(-10) },
]

const DATA: Record<string, unknown> = {
  'app:teamMembers': { status: 'ok', me: 'alrashidi7amad@gmail.com', rows: [{ email: 'alrashidi7amad@gmail.com', name: 'أحمد الرشيدي' }, { email: 'sultan@makwad.com', name: 'سلطان' }] },
  'app:listActivity': { status: 'ok', items: activity },
  'app:exportAll': { status: 'ok', exportedAt: now, data: { leads, projects, quotes, coupons, updates: [], works: [], testimonials: [], members: [], settings: [], activity } },
  'coupons:list': { status: 'ok', coupons },
  'coupons:check': { ok: true, code: 'MAKWAD10', kind: 'percent', value: 10, minTotal: 0 },
  'quotes:mine': { status: 'ok', quotes: [{ ...quotes[0], clientEmail: 'majed@rawa.sa', status: 'sent' }, quotes[2]] },
  'app:me': { status: 'ok', role: 'admin', isOwner: true, name: 'أحمد الرشيدي', email: 'alrashidi7amad@gmail.com' },
  'app:listLeads': { status: 'ok', leads },
  'app:listProjects': { status: 'ok', projects },
  'app:listUpdates': { status: 'ok', updates: [] },
  'quotes:list': { status: 'ok', quotes },
  'settings:get': { ...DEFAULT_SETTINGS, crNumber: 'FL-123456789', bankName: 'مصرف الراجحي', iban: 'SA0380000000608010167519' },
  'users:listUsers': { status: 'ok', rows: users, me: 'alrashidi7amad@gmail.com' },
  'content:adminContent': { status: 'ok', works: [], testimonials: [] },
  'content:publicContent': { works: [], testimonials: [] },
}

const fake = {
  watchQuery: (q: unknown) => {
    const name = getFunctionName(q as never)
    return {
      onUpdate: () => () => {},
      localQueryResult: () => DATA[name],
      localQueryLogs: () => undefined,
      journal: () => undefined,
    }
  },
  mutation: async () => ({ ok: true }),
  action: async () => ({ ok: true }),
  query: async (q: unknown) => DATA[getFunctionName(q as never)],
  connectionState: () => ({ isWebSocketConnected: true }),
  prewarmQuery: () => {},
} as unknown as ConvexReactClient

export function mount(el: HTMLElement) {
  const root = createRootRoute({ component: () => <Outlet /> })
  const router = createRouter({
    routeTree: root.addChildren([createRoute({ getParentRoute: () => root, path: '/preview', component: () => <DashFrame onSignOut={() => {}} /> })]),
    basepath: '/makwad',
  })
  createRoot(el).render(
    <StrictMode>
      <ConvexProvider client={fake}><RouterProvider router={router} /></ConvexProvider>
    </StrictMode>,
  )
}
