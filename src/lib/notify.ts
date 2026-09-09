export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  } catch {
    // Notifications can fail silently in unsupported contexts (e.g. some mobile browsers).
  }
}

export function maybeNotifyBudget(categoryName: string, spent: number, budget: number, pushEnabled: boolean) {
  if (!pushEnabled) return
  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
  notify('Presupuesto superado', `${categoryName}: ${money.format(spent)} de ${money.format(budget)}`)
}

export function maybeNotifyMissingRecurring(name: string) {
  notify('Recordatorio', `No has registrado "${name}" este mes todavía.`)
}
