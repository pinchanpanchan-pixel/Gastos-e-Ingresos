import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { formatDateHuman } from '../lib/utils'
import { EmptyState, ScreenTitle } from '../components/ui'
import TransactionRow from '../components/TransactionRow'

export default function Transactions() {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions
      .filter((t) => (categoryFilter ? t.categoryId === categoryFilter : true))
      .filter((t) => (q ? t.description.toLowerCase().includes(q) : true))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [transactions, query, categoryFilter])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const arr = map.get(t.date) ?? []
      arr.push(t)
      map.set(t.date, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="px-5 pt-4 max-w-md mx-auto">
      <ScreenTitle>Movimientos</ScreenTitle>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por descripción…"
        className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none focus:border-gold/60 mb-3"
      />

      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 -mx-5 px-5">
        <button
          onClick={() => setCategoryFilter('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs border ${
            categoryFilter === '' ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'
          }`}
        >
          Todas
        </button>
        {categories
          .filter((c) => !c.archived)
          .map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs border whitespace-nowrap ${
                categoryFilter === c.id ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon="🔍" title="Sin resultados" subtitle="Prueba a cambiar la búsqueda o el filtro" />
      ) : (
        grouped.map(([date, txs]) => (
          <div key={date} className="mb-3">
            <p className="text-ink-faint text-xs uppercase tracking-wide px-1 mb-1">{formatDateHuman(date)}</p>
            {txs.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
