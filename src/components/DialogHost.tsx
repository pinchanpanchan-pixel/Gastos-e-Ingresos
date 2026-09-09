import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { GoldButton, GhostButton } from './ui'

export default function DialogHost() {
  const dialog = useStore((s) => s.dialog)
  const resolveDialog = useStore((s) => s.resolveDialog)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (dialog?.type === 'prompt') setValue(dialog.defaultValue ?? '')
  }, [dialog])

  if (!dialog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl p-5 w-full max-w-sm safe-bottom">
        <p className="text-ink text-sm leading-relaxed mb-4 whitespace-pre-line">{dialog.message}</p>
        {dialog.type === 'prompt' && (
          <input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') resolveDialog(value)
            }}
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none focus:border-gold/60 mb-4"
          />
        )}
        <div className="flex gap-2">
          {dialog.type !== 'alert' && (
            <GhostButton className="flex-1" onClick={() => resolveDialog(dialog.type === 'prompt' ? null : false)}>
              Cancelar
            </GhostButton>
          )}
          <GoldButton className="flex-1" onClick={() => resolveDialog(dialog.type === 'prompt' ? value : true)}>
            {dialog.type === 'alert' ? 'Entendido' : 'Confirmar'}
          </GoldButton>
        </div>
      </div>
    </div>
  )
}
