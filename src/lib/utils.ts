export function uid(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function formatMoney(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
}

export function formatDateHuman(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'long' }).format(d)
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

export function todayISO(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 10)
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function monthLabel(key: string): string {
  const d = new Date(key + '-01T00:00:00')
  const s = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
