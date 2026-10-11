import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

// Fallback company details. The live values are edited from the dashboard (الإعدادات).
export const COMPANY = {
  name: 'سطر لتطوير التطبيقات',
  city: 'الدمام، المملكة العربية السعودية',
}

export type SiteSettings = {
  whatsapp: string
  whatsappMessage: string
  phone: string
  email: string
  address: string
  hours: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp: '966500000000',
  whatsappMessage: 'السلام عليكم، أرغب بالاستفسار عن تطوير تطبيق.',
  phone: '+966 13 000 0000',
  email: 'hello@satr.sa',
  address: 'طريق الملك فهد، الدمام',
  hours: 'الأحد – الخميس، 9 ص – 5 م',
}

export function useSettings(): SiteSettings {
  const s = useQuery(api.settings.get) as SiteSettings | undefined
  return s ?? DEFAULT_SETTINGS
}

export const whatsappLink = (s: SiteSettings) =>
  `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(s.whatsappMessage)}`

export const LEGAL_UPDATED = '11 أكتوبر 2026'
