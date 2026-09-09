import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card } from '../../components/ui'
import { formatMoney, monthKey, todayISO } from '../../lib/utils'

export default function BudgetsSettings() {
  const navigate = useNavigate()
  const allCategories = useStore((s) => s.categories)
  const categories = allCategories.filter((c) => !c.archived && c.kind !== 'income')
  const updateCategory = useStore((s) => s.updateCategory)
  const categorySpend = useStore((s) => s.categorySpend)
  const month = monthKey(todayISO())

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Ponles un máximo mensual y te avisaremos si te pasas">Presupuestos</ScreenTitle>

      <div className="flex flex-col gap-2">
        {categories.map((c) => {
          const spent = categorySpend(month, c.id)
          const pct = c.budgetMonthly ? Math.min(100, (spent / c.budgetMonthly) * 100) : 0
          const over = c.budgetMonthly != null && spent > c.budgetMonthly
          return (
            <Card key={c.id}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">{c.icon}</span>
                <p className="text-ink text-sm font-medium flex-1">{c.name}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Sin límite"
                    value={c.budgetMonthly ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      updateCategory(c.id, { budgetMonthly: v === '' ? undefined : parseFloat(v) })
                    }}
                    className="w-24 bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-ink text-sm text-right outline-none"
                  />
                  <span className="text-ink-faint text-xs">€</span>
                </div>
              </div>
              {c.budgetMonthly ? (
                <>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div
                      className={`h-full ${over ? 'bg-expense' : 'bg-gold'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className={`text-[11px] mt-1 ${over ? 'text-expense' : 'text-ink-faint'}`}>
                    {formatMoney(spent)} de {formatMoney(c.budgetMonthly)} este mes
                  </p>
                </>
              ) : (
                <p className="text-ink-faint text-[11px]">Sin presupuesto definido</p>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
