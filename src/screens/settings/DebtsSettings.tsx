import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton, EmptyState } from '../../components/ui'
import { formatMoney, todayISO } from '../../lib/utils'
import type { DebtDirection } from '../../types'

export default function DebtsSettings() {
  const navigate = useNavigate()
  const debts = useStore((s) => s.debts)
  const addDebt = useStore((s) => s.addDebt)
  const settleDebt = useStore((s) => s.settleDebt)
  const deleteDebt = useStore((s) => s.deleteDebt)
  const netDebts = useStore((s) => s.netDebts())

  const [showAdd, setShowAdd] = useState(false)
  const [person, setPerson] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<DebtDirection>('owed_to_me')

  const pending = [...debts].filter((d) => !d.settled).sort((a, b) => b.date.localeCompare(a.date))
  const settled = [...debts].filter((d) => d.settled).sort((a, b) => (b.settledDate ?? '').localeCompare(a.settledDate ?? ''))

  async function onAdd() {
    const amt = parseFloat(amount.replace(',', '.'))
    if (!person.trim() || isNaN(amt) || amt <= 0) return
    await addDebt({ person: person.trim(), note: note.trim(), amount: amt, direction, date: todayISO() })
    setPerson('')
    setNote('')
    setAmount('')
    setShowAdd(false)
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Afectan al balance total, mostradas en pequeño">Deudas</ScreenTitle>

      <Card className="mb-4 text-center">
        <p className="text-ink-faint text-xs mb-1">Neto de deudas pendientes</p>
        <p className={`text-2xl font-semibold ${netDebts >= 0 ? 'text-income' : 'text-expense'}`}>{formatMoney(netDebts)}</p>
      </Card>

      {showAdd ? (
        <Card className="mb-4">
          <div className="flex gap-2 mb-3">
            {(['owed_to_me', 'i_owe'] as DebtDirection[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 py-2 rounded-lg text-xs border ${direction === d ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'}`}
              >
                {d === 'owed_to_me' ? 'Me deben' : 'Debo yo'}
              </button>
            ))}
          </div>
          <input
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            placeholder="Nombre de la persona"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-2"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Motivo (opcional)"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-2"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
            placeholder="Importe €"
            inputMode="decimal"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-3"
          />
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={() => setShowAdd(false)}>
              Cancelar
            </GhostButton>
            <GoldButton className="flex-1" onClick={onAdd}>
              Añadir
            </GoldButton>
          </div>
        </Card>
      ) : (
        <GoldButton className="w-full mb-4" onClick={() => setShowAdd(true)}>
          + Nueva deuda
        </GoldButton>
      )}

      {pending.length === 0 ? (
        <EmptyState icon="🤝" title="Sin deudas pendientes" />
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          {pending.map((d) => (
            <Card key={d.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-ink text-sm font-medium">{d.person}</p>
                <p className="text-ink-faint text-xs">{d.note || (d.direction === 'owed_to_me' ? 'Me debe' : 'Le debo')}</p>
              </div>
              <p className={`text-sm font-semibold ${d.direction === 'owed_to_me' ? 'text-income' : 'text-expense'}`}>
                {d.direction === 'owed_to_me' ? '+' : '−'} {formatMoney(d.amount)}
              </p>
              <button onClick={() => settleDebt(d.id)} className="text-gold text-xs">
                Saldar
              </button>
              <button onClick={() => confirm('¿Borrar esta deuda?') && deleteDebt(d.id)} className="text-expense text-xs">
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <>
          <p className="text-ink-faint text-xs uppercase tracking-wide mb-2 px-1">Saldadas</p>
          <div className="flex flex-col gap-2 opacity-60">
            {settled.map((d) => (
              <Card key={d.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1">
                  <p className="text-ink text-xs">{d.person}</p>
                </div>
                <p className="text-ink-faint text-xs line-through">{formatMoney(d.amount)}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
