import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton } from '../../components/ui'
import { hashPin, biometricSupported, registerBiometric, clearBiometric } from '../../lib/auth'

export default function SecuritySettings() {
  const navigate = useNavigate()
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const [step, setStep] = useState<'idle' | 'new1' | 'new2'>('idle')
  const [firstPin, setFirstPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [error, setError] = useState('')

  function digit(d: string) {
    if (pinInput.length >= 4) return
    const next = pinInput + d
    setPinInput(next)
    if (next.length === 4) {
      if (step === 'new1') {
        setFirstPin(next)
        setPinInput('')
        setStep('new2')
      } else if (step === 'new2') {
        if (next === firstPin) {
          hashPin(next).then((hash) => {
            updateSettings({ pinHash: hash })
            setStep('idle')
            setPinInput('')
          })
        } else {
          setError('Los PIN no coinciden, inténtalo de nuevo')
          setStep('new1')
          setPinInput('')
          setFirstPin('')
        }
      }
    }
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Protege tu app con PIN y biometría">Seguridad</ScreenTitle>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-ink text-sm">PIN de acceso</p>
          <p className="text-ink-faint text-xs">{settings.pinHash ? 'Activado' : 'Desactivado'}</p>
        </div>
        {step === 'idle' ? (
          <div className="flex gap-2 mt-2">
            <GoldButton className="flex-1 py-2.5 text-sm" onClick={() => setStep('new1')}>
              {settings.pinHash ? 'Cambiar PIN' : 'Crear PIN'}
            </GoldButton>
            {settings.pinHash && (
              <GhostButton className="flex-1 py-2.5 text-sm text-expense" onClick={() => updateSettings({ pinHash: null, biometricEnabled: false })}>
                Quitar PIN
              </GhostButton>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-3">
            <p className="text-ink-dim text-xs mb-3">{step === 'new1' ? 'Introduce el nuevo PIN' : 'Repite el PIN'}</p>
            {error && <p className="text-expense text-xs mb-2">{error}</p>}
            <div className="flex gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < pinInput.length ? 'bg-gold' : 'border border-ink-faint'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => digit(d)} className="aspect-square rounded-full bg-surface-2 text-ink text-base">
                  {d}
                </button>
              ))}
              <div />
              <button onClick={() => digit('0')} className="aspect-square rounded-full bg-surface-2 text-ink text-base">
                0
              </button>
              <button onClick={() => setPinInput((p) => p.slice(0, -1))} className="aspect-square rounded-full text-ink-dim text-sm">
                ⌫
              </button>
            </div>
          </div>
        )}
      </Card>

      {biometricSupported() && settings.pinHash && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ink text-sm">Huella / Face ID</p>
              <p className="text-ink-faint text-xs">Desbloqueo rápido, con el PIN como respaldo</p>
            </div>
            <button
              onClick={async () => {
                if (settings.biometricEnabled) {
                  clearBiometric()
                  updateSettings({ biometricEnabled: false })
                } else {
                  const ok = await registerBiometric()
                  updateSettings({ biometricEnabled: ok })
                  if (!ok) alert('No se ha podido registrar la biometría en este dispositivo.')
                }
              }}
              className={`w-11 h-6 rounded-full relative transition ${settings.biometricEnabled ? 'bg-gold' : 'bg-surface-3'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.biometricEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
