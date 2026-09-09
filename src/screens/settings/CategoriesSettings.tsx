import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton } from '../../components/ui'
import type { Category, TxType } from '../../types'

const COLORS = ['#d4af37', '#f87171', '#4ade80', '#60a5fa', '#fb923c', '#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399', '#fb7185', '#e879f9', '#22d3ee', '#9ca3af']
const ICONS = ['📦', '🍔', '🚌', '📱', '🎮', '👟', '🎒', '🎉', '🎁', '✈️', '💰', '➕', '🔄', '📹', '🏠', '💊', '⚽', '📚', '🐾', '☕']

export default function CategoriesSettings() {
  const navigate = useNavigate()
  const categories = useStore((s) => s.categories)
  const settings = useStore((s) => s.settings)
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const updateSettings = useStore((s) => s.updateSettings)
  const askConfirm = useStore((s) => s.askConfirm)

  const [editing, setEditing] = useState<Category | 'new' | null>(null)

  const ordered = [...categories.filter((c) => !c.archived)].sort((a, b) => {
    const order = settings.categoryOrder
    return order.indexOf(a.id) - order.indexOf(b.id)
  })

  function move(id: string, dir: -1 | 1) {
    const order = [...settings.categoryOrder]
    const i = order.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= order.length) return
    ;[order[i], order[j]] = [order[j], order[i]]
    updateSettings({ categoryOrder: order })
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Todas se pueden editar, crear o borrar">Categorías</ScreenTitle>

      {editing && (
        <CategoryForm
          initial={editing === 'new' ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            if (editing === 'new') await addCategory(data)
            else await updateCategory(editing.id, data)
            setEditing(null)
          }}
        />
      )}

      {!editing && (
        <GoldButton className="w-full mb-4" onClick={() => setEditing('new')}>
          + Nueva categoría
        </GoldButton>
      )}

      <div className="flex flex-col gap-2">
        {ordered.map((c) => (
          <Card key={c.id} className="flex items-center gap-3 py-3">
            <span className="text-xl">{c.icon}</span>
            <div className="flex-1">
              <p className="text-ink text-sm font-medium">{c.name}</p>
              <p className="text-ink-faint text-xs">
                {c.kind === 'income' ? 'Ingreso' : c.kind === 'expense' ? 'Gasto' : 'Ingreso y gasto'}
                {c.budgetMonthly ? ` · Presupuesto ${c.budgetMonthly}€` : ''}
              </p>
            </div>
            {settings.categoryOrderMode === 'manual' && (
              <div className="flex flex-col">
                <button onClick={() => move(c.id, -1)} className="text-ink-faint px-1">
                  ▲
                </button>
                <button onClick={() => move(c.id, 1)} className="text-ink-faint px-1">
                  ▼
                </button>
              </div>
            )}
            <button onClick={() => setEditing(c)} className="text-gold text-xs px-2">
              Editar
            </button>
            <button
              onClick={async () => {
                if (await askConfirm(`¿Borrar la categoría "${c.name}"?`)) deleteCategory(c.id)
              }}
              className="text-expense text-xs px-1"
            >
              Borrar
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CategoryForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: Category
  onCancel: () => void
  onSave: (data: { name: string; kind: TxType | 'both'; icon: string; color: string; budgetMonthly?: number }) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<TxType | 'both'>(initial?.kind ?? 'expense')
  const [icon, setIcon] = useState(initial?.icon ?? ICONS[0])
  const [color, setColor] = useState(initial?.color ?? COLORS[0])

  return (
    <Card className="mb-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la categoría"
        className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-3"
      />
      <div className="flex gap-2 mb-3">
        {(['expense', 'income', 'both'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`flex-1 py-2 rounded-lg text-xs border ${kind === k ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'}`}
          >
            {k === 'expense' ? 'Gasto' : k === 'income' ? 'Ingreso' : 'Ambos'}
          </button>
        ))}
      </div>
      <p className="text-ink-faint text-xs mb-1.5">Icono</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {ICONS.map((i) => (
          <button
            key={i}
            onClick={() => setIcon(i)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border ${icon === i ? 'border-gold bg-gold/10' : 'border-border'}`}
          >
            {i}
          </button>
        ))}
      </div>
      <p className="text-ink-faint text-xs mb-1.5">Color</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-gold' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <GhostButton className="flex-1" onClick={onCancel}>
          Cancelar
        </GhostButton>
        <GoldButton className="flex-1" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), kind, icon, color })}>
          Guardar
        </GoldButton>
      </div>
    </Card>
  )
}
