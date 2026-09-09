import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useStore } from '../store/useStore'
import { formatMoney, monthKey, todayISO } from '../lib/utils'
import { Card, Pill } from '../components/ui'
import TransactionRow from '../components/TransactionRow'

export default function Home() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const settings = useStore((s) => s.settings)
  const totalBalance = useStore((s) => s.totalBalance())
  const netDebts = useStore((s) => s.netDebts())
  const monthIncome = useStore((s) => s.monthTotals(monthKey(todayISO())).income)
  const monthExpense = useStore((s) => s.monthTotals(monthKey(todayISO())).expense)

  const savings = monthIncome - monthExpense

  const recent = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [transactions],
  )

  const chartData = useMemo(() => {
    const month = monthKey(todayISO())
    const byCategory = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== 'expense' || monthKey(t.date) !== month) continue
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount)
    }
    return Array.from(byCategory.entries())
      .map(([categoryId, value]) => {
        const cat = categories.find((c) => c.id === categoryId)
        return { name: cat?.name ?? 'Otros', value, color: cat?.color ?? '#9ca3af' }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  return (
    <div className="px-5 pt-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-ink-dim text-sm">Hola 👋</p>
          <p className="text-ink-faint text-xs">{new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</p>
        </div>
        <button onClick={() => navigate('/ajustes')} className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center">
          ⚙️
        </button>
      </div>

      <div className="text-center mb-2">
        <p className="text-ink-faint text-xs uppercase tracking-wide mb-1">Balance total</p>
        <p className="text-ink text-4xl font-semibold tracking-tight">{formatMoney(totalBalance)}</p>
        <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-ink-faint/80">
          <span>
            Ahorro este mes:{' '}
            <span className={savings >= 0 ? 'text-income/80' : 'text-expense/80'}>{formatMoney(savings)}</span>
          </span>
          {netDebts !== 0 && (
            <span>
              · Deudas netas: <span className={netDebts >= 0 ? 'text-income/80' : 'text-expense/80'}>{formatMoney(netDebts)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 my-6">
        <QuickAction icon="➕" label="Añadir" onClick={() => navigate('/add')} />
        <QuickAction icon="🤝" label="Deudas" onClick={() => navigate('/ajustes/deudas')} />
        <QuickAction icon="🎯" label="Metas" onClick={() => navigate('/ajustes/metas')} />
        <QuickAction icon="🔍" label="Buscar" onClick={() => navigate('/movimientos')} />
      </div>

      {settings.showHomeTotals && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <p className="text-ink-faint text-xs mb-1">Ingresos del mes</p>
            <p className="text-income text-lg font-semibold">{formatMoney(monthIncome)}</p>
          </Card>
          <Card>
            <p className="text-ink-faint text-xs mb-1">Gastos del mes</p>
            <p className="text-expense text-lg font-semibold">{formatMoney(monthExpense)}</p>
          </Card>
        </div>
      )}

      {settings.showHomeChart && chartData.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-ink text-sm font-medium">Gastos por categoría</p>
            <Pill className="bg-surface-2 text-ink-faint">Este mes</Pill>
          </div>
          <div className="h-44 flex items-center">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={32} outerRadius={54} paddingAngle={2} stroke="none">
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatMoney(Number(v))}
                    contentStyle={{ background: '#1f1f23', border: '1px solid #2c2c31', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 pl-3 overflow-hidden">
              {chartData.slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-ink-dim truncate flex-1">{d.name}</span>
                  <span className="text-ink-faint">{formatMoney(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {settings.showHomeRecent && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-ink text-sm font-medium">Últimos movimientos</p>
            <button onClick={() => navigate('/movimientos')} className="text-gold text-xs">
              Ver todos
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="text-ink-faint text-sm py-6 text-center">Aún no hay movimientos</p>
          ) : (
            <div>
              {recent.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-lg active:bg-surface-2">
        {icon}
      </div>
      <span className="text-[11px] text-ink-dim">{label}</span>
    </button>
  )
}
