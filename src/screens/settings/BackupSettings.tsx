import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton } from '../../components/ui'
import { exportAllData, importAllData } from '../../lib/db'
import { buildTransactionsCSV, triggerDownload } from '../../lib/csv'
import { todayISO } from '../../lib/utils'

export default function BackupSettings() {
  const navigate = useNavigate()
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const accounts = useStore((s) => s.accounts)
  const reseed = useStore((s) => s.reseed)
  const wipe = useStore((s) => s.wipe)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  function exportCSV() {
    const csv = buildTransactionsCSV(transactions, categories, accounts)
    triggerDownload(`movimientos-${todayISO()}.csv`, csv, 'text/csv;charset=utf-8')
  }

  async function exportBackup() {
    const data = await exportAllData()
    triggerDownload(`backup-misfinanzas-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json')
  }

  async function onRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('Esto sustituirá todos los datos actuales por los del archivo. ¿Continuar?')) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importAllData(data)
      setMessage('Copia restaurada. Reiniciando…')
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      setMessage('No se ha podido leer el archivo de copia de seguridad.')
    }
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle>Exportar y copia de seguridad</ScreenTitle>

      {message && <div className="bg-surface-2 border border-border text-ink-dim text-xs rounded-xl p-3 mb-4">{message}</div>}

      <Card className="mb-3">
        <p className="text-ink text-sm font-medium mb-1">Exportar a Excel/CSV</p>
        <p className="text-ink-faint text-xs mb-3">Descarga todos tus movimientos en un archivo abrible en Excel o Sheets.</p>
        <GoldButton className="w-full" onClick={exportCSV}>
          Exportar CSV
        </GoldButton>
      </Card>

      <Card className="mb-3">
        <p className="text-ink text-sm font-medium mb-1">Copia de seguridad completa</p>
        <p className="text-ink-faint text-xs mb-3">Guarda cuentas, categorías, deudas, metas y movimientos en un archivo.</p>
        <GoldButton className="w-full mb-2" onClick={exportBackup}>
          Descargar copia de seguridad
        </GoldButton>
        <GhostButton className="w-full" onClick={() => fileRef.current?.click()}>
          Restaurar desde archivo
        </GhostButton>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onRestoreFile} />
      </Card>

      <Card>
        <p className="text-ink text-sm font-medium mb-1">Zona de peligro</p>
        <p className="text-ink-faint text-xs mb-3">Borra todos tus datos y empieza de cero, o restaura los datos de ejemplo iniciales.</p>
        <div className="flex gap-2">
          <GhostButton
            className="flex-1 text-expense"
            onClick={() => {
              if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) wipe()
            }}
          >
            Borrar todo
          </GhostButton>
          <GhostButton
            className="flex-1"
            onClick={() => {
              if (confirm('¿Restaurar los datos de ejemplo iniciales? Se perderán los cambios actuales.')) reseed()
            }}
          >
            Restaurar ejemplo
          </GhostButton>
        </div>
      </Card>
    </div>
  )
}
