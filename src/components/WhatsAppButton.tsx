import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '@/site-config'

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  return (
    <a className="wa-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر واتساب">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.5 8.5 0 1 1 21 11.5z" />
        <path d="M9.2 8.6c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .6-.4.8-.6.4-1.5.6-2.3.3-2.3-.8-4.1-2.6-4.9-4.9-.3-.8-.1-1.7.3-2.3z" fill="currentColor" stroke="none" />
      </svg>
      <span>واتساب</span>
    </a>
  )
}
