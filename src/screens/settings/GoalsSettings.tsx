import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton, EmptyState } from '../../components/ui'
import { formatMoney, clamp } from '../../lib/utils'

const COLORS = ['#d4af37', '#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa']

export default function GoalsSettings() {
  const navigate = useNavigate()
  const allGoals = useStore((s) => s.goals)
  const goals = allGoals.filter((g) => !g.archived)
  const addGoal = useStore((s) => s.addGoal)
  const contributeToGoal = useStore((s) => s.contributeToGoal)
  const deleteGoal = useStore((s) => s.deleteGoal)

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')

  async function onAdd() {
    const t = parseFloat(target.replace(',', '.'))
    if (!name.trim() || isNaN(t) || t <= 0) return
    await addGoal({ name: name.trim(), targetAmount: t, color: COLORS[goals.length % COLORS.length] })
    setName('')
    setTarget('')
    setShowAdd(false)
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Puedes tener varias metas activas a la vez">Metas de ahorro</ScreenTitle>

      {showAdd ? (
        <Card className="mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="¿Para qué ahorras?"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-2"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9,.]/g, ''))}
            placeholder="Cantidad objetivo €"
            inputMode="decimal"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-3"
          />
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={() => setShowAdd(false)}>
              Cancelar
            </GhostButton>
            <GoldButton className="flex-1" onClick={onAdd}>
              Crear meta
            </GoldButton>
          </div>
        </Card>
      ) : (
        <GoldButton className="w-full mb-4" onClick={() => setShowAdd(true)}>
          + Nueva meta
        </GoldButton>
      )}

      {goals.length === 0 ? (
        <EmptyState icon="🎯" title="Aún no tienes metas" subtitle="Crea una para ver tu progreso" />
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((g) => {
            const pct = clamp((g.currentAmount / g.targetAmount) * 100, 0, 100)
            return (
              <Card key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-ink text-sm font-medium">{g.name}</p>
                  <button onClick={() => confirm('¿Borrar esta meta?') && deleteGoal(g.id)} className="text-expense text-xs">
                    Borrar
                  </button>
                </div>
                <div className="h-2 rounded-full bg-surface-3 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-ink-faint text-xs">
                    {formatMoney(g.currentAmount)} de {formatMoney(g.targetAmount)}
                  </p>
                  <p className="text-ink-faint text-xs">{pct.toFixed(0)}%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => contributeToGoal(g.id, 5)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-2 border border-border text-ink-dim text-xs"
                  >
                    +5€
                  </button>
                  <button
                    onClick={() => contributeToGoal(g.id, 20)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-2 border border-border text-ink-dim text-xs"
                  >
                    +20€
                  </button>
                  <button
                    onClick={() => {
                      const v = prompt('¿Cuánto quieres añadir a esta meta?')
                      const n = v ? parseFloat(v.replace(',', '.')) : NaN
                      if (!isNaN(n) && n !== 0) contributeToGoal(g.id, n)
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-surface-2 border border-border text-ink-dim text-xs"
                  >
                    Otra
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
