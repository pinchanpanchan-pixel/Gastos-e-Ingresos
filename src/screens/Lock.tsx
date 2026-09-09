import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { verifyPin, verifyBiometric, biometricSupported } from '../lib/auth'

export default function Lock() {
  const settings = useStore((s) => s.settings)
  const unlock = useStore((s) => s.unlock)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [tryingBio, setTryingBio] = useState(false)

  const canBio = settings.biometricEnabled && biometricSupported()

  useEffect(() => {
    if (canBio) void tryBiometric()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function tryBiometric() {
    setTryingBio(true)
    const ok = await verifyBiometric()
    setTryingBio(false)
    if (ok) unlock()
  }

  async function onDigit(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      const ok = settings.pinHash && (await verifyPin(next, settings.pinHash))
      if (ok) {
        unlock()
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 500)
      }
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8 safe-top safe-bottom">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-ink text-lg font-semibold mb-1">Mis Finanzas</h1>
      <p className="text-ink-dim text-sm mb-8">{tryingBio ? 'Verificando huella/Face ID…' : 'Introduce tu PIN'}</p>

      <div className={`flex gap-4 mb-10 ${error ? 'animate-pulse' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border ${
              i < pin.length ? (error ? 'bg-expense border-expense' : 'bg-gold border-gold') : 'border-ink-faint'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => onDigit(d)}
            className="aspect-square rounded-full bg-surface border border-border text-ink text-xl font-medium active:bg-surface-2"
          >
            {d}
          </button>
        ))}
        <div>
          {canBio && (
            <button
              onClick={tryBiometric}
              className="aspect-square w-full rounded-full bg-surface border border-border text-xl flex items-center justify-center active:bg-surface-2"
            >
              🫆
            </button>
          )}
        </div>
        <button
          onClick={() => onDigit('0')}
          className="aspect-square rounded-full bg-surface border border-border text-ink text-xl font-medium active:bg-surface-2"
        >
          0
        </button>
        <button
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="aspect-square rounded-full text-ink-dim text-lg flex items-center justify-center active:bg-surface-2"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
