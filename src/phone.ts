/** Same rule as the server: Saudi mobiles to 9665XXXXXXXX, other numbers kept as international digits (9–15). '' if invalid. */
export function toWaNumber(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('05') && d.length === 10) d = '966' + d.slice(1)
  else if (d.startsWith('5') && d.length === 9) d = '966' + d
  return d.length >= 9 && d.length <= 15 ? d : ''
}
