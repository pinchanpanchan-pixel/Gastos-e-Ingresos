import type { Account, Category, Transaction } from '../types'

export function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function buildTransactionsCSV(transactions: Transaction[], categories: Category[], accounts: Account[]): string {
  const catById = new Map(categories.map((c) => [c.id, c.name]))
  const accById = new Map(accounts.map((a) => [a.id, a.name]))
  const header = ['Fecha', 'Descripción', 'Categoría', 'Cuenta', 'Tipo', 'Importe']
  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => [
      t.date,
      csvEscape(t.description),
      csvEscape(catById.get(t.categoryId) ?? ''),
      csvEscape(accById.get(t.accountId) ?? ''),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.amount.toFixed(2).replace('.', ','),
    ])
  return [header, ...rows].map((r) => r.join(';')).join('\n')
}

function csvEscape(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
