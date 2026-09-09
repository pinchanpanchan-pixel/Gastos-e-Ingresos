import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton, EmptyState } from '../../components/ui'
import { formatMoney } from '../../lib/utils'
import type { TxType } from '../../types'

export default function RecurringSettings() {
  const navigate = useNavigate()
  const recurring = useStore((s) => s.recurring)
  const allCategories = useStore((s) => s.categories)
  const categories = allCategories.filter((c) => !c.archived)
  const allAccounts = useStore((s) => s.accounts)
  const accounts = allAccounts.filter((a) => !a.archived)
  const addRecurring = useStore((s) => s.addRecurring)
  const updateRecurring = useStore((s) => s.updateRecurring)
  const deleteRecurring = useStore((s) => s.deleteRecurring)

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TxType>('income')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [day, setDay] = useState('1')

  async function onAdd() {
    const amt = parseFloat(amount.replace(',', '.'))
    if (!name.trim() || isNaN(amt) || amt <= 0 || !categoryId || !accountId) return
    await addRecurring({
      name: name.trim(),
      amount: amt,
      type,
      categoryId,
      accountId,
      frequency: 'monthly',
      dayOfMonth: parseInt(day) || 1,
      active: true,
      notifyIfMissing: true,
    })
    setName('')
    setAmount('')
    setShowAdd(false)
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Como la Paga: se apuntan solas cada mes">Recurrentes</ScreenTitle>

      {showAdd ? (
        <Card className="mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej. Paga)"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-2"
          />
          <div className="flex gap-2 mb-2">
            {(['income', 'expense'] as TxType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-xs border ${type === t ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'}`}
              >
                {t === 'income' ? 'Ingreso' : 'Gasto'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
              placeholder="Importe €"
              inputMode="decimal"
              className="flex-1 bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none"
            />
            <input
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Día del mes"
              inputMode="numeric"
              className="w-28 bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-3"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={() => setShowAdd(false)}>
              Cancelar
            </GhostButton>
            <GoldButton className="flex-1" onClick={onAdd}>
              Crear
            </GoldButton>
          </div>
        </Card>
      ) : (
        <GoldButton className="w-full mb-4" onClick={() => setShowAdd(true)}>
          + Nuevo recurrente
        </GoldButton>
      )}

      {recurring.length === 0 ? (
        <EmptyState icon="🔁" title="Sin recurrentes todavía" subtitle="Configura tu Paga u otros gastos fijos" />
      ) : (
        <div className="flex flex-col gap-2">
          {recurring.map((r) => (
            <Card key={r.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-ink text-sm font-medium">{r.name}</p>
                <p className="text-ink-faint text-xs">Día {r.dayOfMonth} de cada mes</p>
              </div>
              <p className={`text-sm font-semibold ${r.type === 'income' ? 'text-income' : 'text-expense'}`}>{formatMoney(r.amount)}</p>
              <button
                onClick={() => updateRecurring(r.id, { active: !r.active })}
                className={`text-xs px-2 py-1 rounded-lg ${r.active ? 'text-gold' : 'text-ink-faint'}`}
              >
                {r.active ? 'Activo' : 'Pausado'}
              </button>
              <button onClick={() => confirm('¿Borrar este recurrente?') && deleteRecurring(r.id)} className="text-expense text-xs">
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
