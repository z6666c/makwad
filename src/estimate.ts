// Rough, non-binding cost estimate for an app project. Figures are in SAR.

export type Platform = 'ios' | 'android' | 'mobile' | 'web' | 'all'
export type FeatureKey = 'login' | 'payments' | 'maps' | 'notifications' | 'admin' | 'chat' | 'booking' | 'i18n'

export const PLATFORMS: Array<{ key: Platform; label: string; base: number; weeks: number }> = [
  { key: 'ios', label: 'iOS فقط', base: 36000, weeks: 7 },
  { key: 'android', label: 'أندرويد فقط', base: 36000, weeks: 7 },
  { key: 'mobile', label: 'iOS وأندرويد', base: 60000, weeks: 8 },
  { key: 'web', label: 'تطبيق ويب', base: 32000, weeks: 6 },
  { key: 'all', label: 'جوال وويب', base: 85000, weeks: 10 },
]

export const FEATURES: Array<{ key: FeatureKey; label: string; hint: string; cost: number; weeks: number }> = [
  { key: 'login', label: 'تسجيل دخول وحسابات', hint: 'بريد أو جوال أو Apple/Google', cost: 4000, weeks: 0.5 },
  { key: 'payments', label: 'الدفع الإلكتروني', hint: 'مدى، Apple Pay، STC Pay', cost: 8000, weeks: 1 },
  { key: 'maps', label: 'خرائط وتتبع مباشر', hint: 'مواقع، مندوبين، مسارات', cost: 10000, weeks: 1.5 },
  { key: 'notifications', label: 'إشعارات فورية', hint: 'تنبيهات وتذكيرات', cost: 3000, weeks: 0.5 },
  { key: 'admin', label: 'لوحة تحكم للإدارة', hint: 'إدارة الطلبات والمحتوى والتقارير', cost: 15000, weeks: 2 },
  { key: 'chat', label: 'محادثة داخل التطبيق', hint: 'بين العملاء أو مع الدعم', cost: 12000, weeks: 1.5 },
  { key: 'booking', label: 'حجوزات ومواعيد', hint: 'تقويم وأوقات متاحة', cost: 8000, weeks: 1 },
  { key: 'i18n', label: 'أكثر من لغة', hint: 'العربية والإنجليزية', cost: 5000, weeks: 0.5 },
]

export type EstimateInput = {
  platform: Platform
  screens: number
  features: Array<FeatureKey>
  customDesign: boolean
  urgent: boolean
}

export type Estimate = { low: number; high: number; weeksLow: number; weeksHigh: number; plan: string }

const roundK = (n: number) => Math.round(n / 1000) * 1000

export function estimate(input: EstimateInput): Estimate {
  const p = PLATFORMS.find((x) => x.key === input.platform) ?? PLATFORMS[2]
  const screens = Math.max(3, Math.min(60, Math.round(input.screens)))
  const extraScreens = Math.max(0, screens - 8)
  const feats = FEATURES.filter((f) => input.features.includes(f.key))
  let cost = p.base + extraScreens * 1500 + feats.reduce((s, f) => s + f.cost, 0)
  let weeks = p.weeks + extraScreens * 0.25 + feats.reduce((s, f) => s + f.weeks, 0)
  if (input.customDesign) { cost *= 1.15; weeks += 1 }
  if (input.urgent) { cost *= 1.2; weeks *= 0.8 }
  const low = roundK(cost * 0.9)
  const high = roundK(cost * 1.2)
  const weeksLow = Math.max(4, Math.round(weeks))
  const weeksHigh = Math.max(weeksLow + 1, Math.round(weeks * 1.25))
  const single = p.key === 'ios' || p.key === 'android' || p.key === 'web'
  const plan = single && high <= 75000 ? 'الانطلاقة' : high <= 200000 ? 'النمو' : 'المنشآت'
  return { low, high, weeksLow, weeksHigh, plan }
}

export const fmtSAR = (n: number) => n.toLocaleString('en-US')

export function estimateSummary(input: EstimateInput, e: Estimate): string {
  const p = PLATFORMS.find((x) => x.key === input.platform)?.label ?? ''
  const feats = FEATURES.filter((f) => input.features.includes(f.key)).map((f) => f.label)
  const lines = [
    'من حاسبة التكلفة في الموقع:',
    `• المنصة: ${p}`,
    `• عدد الشاشات التقريبي: ${input.screens}`,
    `• الخصائص: ${feats.length ? feats.join('، ') : 'أساسية'}`,
    `• التصميم: ${input.customDesign ? 'هوية وتصميم مخصص بالكامل' : 'تصميم عملي'}`,
  ]
  if (input.urgent) lines.push('• التسليم: مستعجل')
  lines.push(`• التقدير: ${fmtSAR(e.low)} – ${fmtSAR(e.high)} ريال، ${e.weeksLow}–${e.weeksHigh} أسبوعاً`, '', 'نبذة عن الفكرة: ')
  return lines.join('\n')
}
