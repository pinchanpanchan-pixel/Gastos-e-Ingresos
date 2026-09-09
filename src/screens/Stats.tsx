import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { useStore } from '../store/useStore'
import { formatMoney, monthKey, monthLabel, todayISO } from '../lib/utils'
import { Card, ScreenTitle, EmptyState } from '../components/ui'

function lastMonths(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

export default function Stats() {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const accounts = useStore((s) => s.accounts)
  const monthTotals = useStore((s) => s.monthTotals)

  const [selectedMonth, setSelectedMonth] = useState(monthKey(todayISO()))
  const months = useMemo(() => lastMonths(6), [])

  const pieData = useMemo(() => {
    const byCategory = new Map<string, number>()
    for (const t of transactions) {
      if (t.type !== 'expense' || monthKey(t.date) !== selectedMonth) continue
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount)
    }
    return Array.from(byCategory.entries())
      .map(([categoryId, value]) => {
        const cat = categories.find((c) => c.id === categoryId)
        return { name: cat?.name ?? 'Otros', value, color: cat?.color ?? '#9ca3af' }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories, selectedMonth])

  const barData = useMemo(
    () =>
      months.map((m) => {
        const t = monthTotals(m)
        return { month: monthLabel(m).split(' ')[0].slice(0, 3), income: t.income, expense: t.expense }
      }),
    [months, monthTotals],
  )

  const balanceEvolution = useMemo(() => {
    const initial = accounts.reduce((s, a) => s + a.initialBalance, 0)
    const real = transactions
      .filter((t) => t.countsTowardBalance !== false)
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    let running = initial
    const points = [{ date: 'Inicio', balance: running }]
    for (const t of real) {
      running += t.type === 'income' ? t.amount : -t.amount
      points.push({ date: t.date.slice(5), balance: running })
    }
    return points.slice(-30)
  }, [transactions, accounts])

  const ranking = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.type === 'expense' && monthKey(t.date) === selectedMonth)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    [transactions, selectedMonth],
  )

  const prevMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [selectedMonth])

  const current = monthTotals(selectedMonth)
  const previous = monthTotals(prevMonth)
  const diffPct = previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : null

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <ScreenTitle>Estadísticas</ScreenTitle>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number)
            const d = new Date(y, m - 2, 1)
            setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
          }}
          className="text-ink-dim px-2"
        >
          ‹
        </button>
        <p className="text-ink text-sm font-medium">{monthLabel(selectedMonth)}</p>
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number)
            const d = new Date(y, m, 1)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (key <= monthKey(todayISO())) setSelectedMonth(key)
          }}
          className="text-ink-dim px-2"
        >
          ›
        </button>
      </div>

      <Card className="mb-4">
        <p className="text-ink text-sm font-medium mb-2">Resumen del mes</p>
        <p className="text-ink-dim text-sm leading-relaxed">
          Este mes has gastado <span className="text-expense font-medium">{formatMoney(current.expense)}</span> e ingresado{' '}
          <span className="text-income font-medium">{formatMoney(current.income)}</span>.{' '}
          {diffPct != null && (
            <>
              Eso es{' '}
              <span className={diffPct >= 0 ? 'text-expense' : 'text-income'}>
                {diffPct >= 0 ? 'un ' : 'un '}
                {Math.abs(diffPct).toFixed(0)}% {diffPct >= 0 ? 'más' : 'menos'}
              </span>{' '}
              que el mes anterior.
            </>
          )}
        </p>
      </Card>

      {pieData.length > 0 && (
        <Card className="mb-4">
          <p className="text-ink text-sm font-medium mb-2">Gastos por categoría</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} paddingAngle={2} stroke="none">
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v))} contentStyle={{ background: '#1f1f23', border: '1px solid #2c2c31', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <p className="text-ink text-sm font-medium mb-2">Comparativa mensual</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke="#6b6b74" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatMoney(Number(v))} contentStyle={{ background: '#1f1f23', border: '1px solid #2c2c31', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="text-ink text-sm font-medium mb-2">Evolución del balance</p>
        {balanceEvolution.length <= 1 ? (
          <p className="text-ink-faint text-xs py-6 text-center">Se irá dibujando a medida que añadas movimientos</p>
        ) : (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceEvolution}>
                <CartesianGrid stroke="#2c2c31" vertical={false} />
                <XAxis dataKey="date" stroke="#6b6b74" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} contentStyle={{ background: '#1f1f23', border: '1px solid #2c2c31', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="balance" stroke="#d4af37" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-ink text-sm font-medium mb-2">Gastos más grandes del mes</p>
        {ranking.length === 0 ? (
          <EmptyState icon="📊" title="Sin gastos este mes" />
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((t, i) => {
              const cat = categories.find((c) => c.id === t.categoryId)
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-ink-faint text-xs w-4">{i + 1}</span>
                  <span className="text-lg">{cat?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-sm truncate">{t.description || cat?.name}</p>
                  </div>
                  <p className="text-expense text-sm font-medium">{formatMoney(t.amount)}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
