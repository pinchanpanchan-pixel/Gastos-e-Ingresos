import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ScreenTitle, Card } from '../components/ui'
import { ensureNotificationPermission } from '../lib/notify'

const LINKS = [
  { to: '/ajustes/categorias', icon: '🏷️', label: 'Categorías', desc: 'Crear, editar y ordenar categorías' },
  { to: '/ajustes/presupuestos', icon: '📉', label: 'Presupuestos', desc: 'Límite mensual por categoría' },
  { to: '/ajustes/cuentas', icon: '👛', label: 'Cuentas', desc: 'Revolut, billetes y monedas' },
  { to: '/ajustes/deudas', icon: '🤝', label: 'Deudas', desc: 'Quién te debe y a quién debes' },
  { to: '/ajustes/metas', icon: '🎯', label: 'Metas de ahorro', desc: 'Objetivos con progreso' },
  { to: '/ajustes/recurrentes', icon: '🔁', label: 'Recurrentes', desc: 'Paga y gastos automáticos' },
  { to: '/ajustes/seguridad', icon: '🔒', label: 'Seguridad', desc: 'PIN y huella/Face ID' },
  { to: '/ajustes/backup', icon: '💾', label: 'Exportar y copia de seguridad', desc: 'CSV, backup y restaurar' },
]

export default function Settings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  async function toggleReminder(v: boolean) {
    if (v) await ensureNotificationPermission()
    await updateSettings({ reminderEnabled: v })
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <ScreenTitle>Ajustes</ScreenTitle>

      <div className="flex flex-col gap-2 mb-6">
        {LINKS.map((l) => (
          <button
            key={l.to}
            onClick={() => navigate(l.to)}
            className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3.5 text-left active:bg-surface-2"
          >
            <span className="text-xl">{l.icon}</span>
            <div className="flex-1">
              <p className="text-ink text-sm font-medium">{l.label}</p>
              <p className="text-ink-faint text-xs">{l.desc}</p>
            </div>
            <span className="text-ink-faint">›</span>
          </button>
        ))}
      </div>

      <p className="text-ink-faint text-xs uppercase tracking-wide mb-2 px-1">Pantalla de inicio</p>
      <Card className="mb-6 divide-y divide-border">
        <Toggle label="Gráfico de gastos" checked={settings.showHomeChart} onChange={(v) => updateSettings({ showHomeChart: v })} />
        <Toggle label="Últimos movimientos" checked={settings.showHomeRecent} onChange={(v) => updateSettings({ showHomeRecent: v })} />
        <Toggle label="Totales del mes" checked={settings.showHomeTotals} onChange={(v) => updateSettings({ showHomeTotals: v })} />
      </Card>

      <p className="text-ink-faint text-xs uppercase tracking-wide mb-2 px-1">Preferencias generales</p>
      <Card className="mb-6 divide-y divide-border">
        <Toggle label="Iconos de categoría" checked={settings.showCategoryIcons} onChange={(v) => updateSettings({ showCategoryIcons: v })} />
        <Toggle
          label="Números en rojo/verde"
          checked={settings.showExpenseIncomeColors}
          onChange={(v) => updateSettings({ showExpenseIncomeColors: v })}
        />
        <Toggle
          label="Confirmar antes de guardar por voz"
          checked={settings.voiceConfirmBeforeSave}
          onChange={(v) => updateSettings({ voiceConfirmBeforeSave: v })}
        />
        <Toggle label="Fecha por defecto: hoy" checked={settings.dateDefaultsToday} onChange={(v) => updateSettings({ dateDefaultsToday: v })} />
        <div className="py-3">
          <p className="text-ink text-sm mb-2">Orden de categorías</p>
          <div className="flex gap-2">
            {(['usage', 'manual', 'alpha'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateSettings({ categoryOrderMode: mode })}
                className={`flex-1 py-2 rounded-lg text-xs border ${
                  settings.categoryOrderMode === mode ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-faint'
                }`}
              >
                {mode === 'usage' ? 'Más usadas' : mode === 'manual' ? 'Manual' : 'Alfabético'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <p className="text-ink-faint text-xs uppercase tracking-wide mb-2 px-1">Recordatorios</p>
      <Card className="mb-6 divide-y divide-border">
        <Toggle label="Recordarme apuntar gastos" checked={settings.reminderEnabled} onChange={toggleReminder} />
        <div className="py-3 flex items-center justify-between">
          <p className="text-ink text-sm">Hora del recordatorio</p>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-ink text-sm"
          />
        </div>
        <Toggle label="Aviso al pasarme de presupuesto (push)" checked={settings.budgetAlertPush} onChange={(v) => updateSettings({ budgetAlertPush: v })} />
        <Toggle
          label="Aviso visual al pasarme de presupuesto"
          checked={settings.budgetAlertVisual}
          onChange={(v) => updateSettings({ budgetAlertVisual: v })}
        />
      </Card>

      <p className="text-ink-faint text-center text-xs">Mis Finanzas · Hecha para ti</p>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <p className="text-ink text-sm flex-1">{label}</p>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition ${checked ? 'bg-gold' : 'bg-surface-3'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
