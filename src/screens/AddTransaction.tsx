import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { formatMoney, todayISO } from '../lib/utils'
import { suggestCategory } from '../lib/categorize'
import { parseVoiceEntry, getSpeechRecognition } from '../lib/voice'
import { maybeNotifyBudget } from '../lib/notify'
import { GoldButton, GhostButton } from '../components/ui'
import type { TxType } from '../types'

export default function AddTransaction() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const duplicateFrom = searchParams.get('duplicate')

  const categories = useStore((s) => s.categories)
  const accounts = useStore((s) => s.accounts)
  const transactions = useStore((s) => s.transactions)
  const settings = useStore((s) => s.settings)
  const addTransaction = useStore((s) => s.addTransaction)
  const updateTransaction = useStore((s) => s.updateTransaction)
  const deleteTransaction = useStore((s) => s.deleteTransaction)
  const categorySpend = useStore((s) => s.categorySpend)

  const editing = transactions.find((t) => t.id === id)
  const dupSource = duplicateFrom ? transactions.find((t) => t.id === duplicateFrom) : undefined
  const source = editing ?? dupSource

  const [type, setType] = useState<TxType>(source?.type ?? 'expense')
  const [amountStr, setAmountStr] = useState(source ? String(source.amount).replace('.', ',') : '')
  const [description, setDescription] = useState(source?.description ?? '')
  const [categoryId, setCategoryId] = useState(source?.categoryId ?? '')
  const [accountId, setAccountId] = useState(source?.accountId ?? accounts[0]?.id ?? '')
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const [autoSuggested, setAutoSuggested] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [banner, setBanner] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const activeCategories = useMemo(
    () => categories.filter((c) => !c.archived && (c.kind === type || c.kind === 'both')),
    [categories, type],
  )

  const orderedCategories = useMemo(() => {
    if (settings.categoryOrderMode === 'alpha') {
      return [...activeCategories].sort((a, b) => a.name.localeCompare(b.name))
    }
    if (settings.categoryOrderMode === 'manual') {
      const order = settings.categoryOrder
      return [...activeCategories].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    }
    return [...activeCategories].sort((a, b) => b.usageCount - a.usageCount)
  }, [activeCategories, settings.categoryOrderMode, settings.categoryOrder])

  useEffect(() => {
    if (!categoryId && orderedCategories.length > 0) setCategoryId(orderedCategories[0].id)
  }, [orderedCategories, categoryId])

  function handleVoiceResult(text: string) {
    const parsed = parseVoiceEntry(text)
    if (parsed.amount != null) setAmountStr(String(parsed.amount).replace('.', ','))
    setType(parsed.type)
    if (parsed.description) setDescription(parsed.description)
    const suggestion = suggestCategory(parsed.description || text, parsed.type, categories, transactions)
    if (suggestion) {
      setCategoryId(suggestion.id)
      setAutoSuggested(true)
    }
  }

  function startVoice() {
    const Ctor = getSpeechRecognition()
    if (!Ctor) {
      setVoiceError('Tu navegador no soporta dictado por voz. Prueba desde Chrome en Android.')
      return
    }
    setVoiceError('')
    const rec = new Ctor()
    rec.lang = 'es-ES'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results[e.results.length - 1][0].transcript
      handleVoiceResult(text)
    }
    rec.onerror = () => {
      setListening(false)
      setVoiceError('No te he escuchado bien, inténtalo de nuevo.')
    }
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  function onDescriptionBlur() {
    if (!description || editing) return
    const suggestion = suggestCategory(description, type, categories, transactions)
    if (suggestion && suggestion.id !== categoryId) {
      setCategoryId(suggestion.id)
      setAutoSuggested(true)
    }
  }

  const amount = parseFloat(amountStr.replace(',', '.'))
  const canSave = !isNaN(amount) && amount > 0 && categoryId && accountId && date

  async function onSave() {
    if (!canSave) return
    const payload = { date, description: description.trim(), categoryId, accountId, amount, type, source: 'manual' as const }
    if (editing) {
      await updateTransaction(editing.id, payload)
    } else {
      await addTransaction(payload)
    }
    if (type === 'expense') {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat?.budgetMonthly) {
        const spent = categorySpend(date.slice(0, 7), categoryId)
        if (spent > cat.budgetMonthly) {
          setBanner(`Te has pasado del presupuesto de ${cat.name} (${formatMoney(spent)} / ${formatMoney(cat.budgetMonthly)})`)
          maybeNotifyBudget(cat.name, spent, cat.budgetMonthly, settings.budgetAlertPush)
          setTimeout(() => navigate(-1), 1600)
          return
        }
      }
    }
    navigate(-1)
  }

  async function onDelete() {
    if (!editing) return
    if (!confirm('¿Seguro que quieres borrar este movimiento?')) return
    await deleteTransaction(editing.id)
    navigate(-1)
  }

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-ink-dim text-sm">
          Cancelar
        </button>
        <p className="text-ink text-sm font-medium">{editing ? 'Editar movimiento' : 'Nuevo movimiento'}</p>
        <div className="w-16" />
      </div>

      {banner && (
        <div className="bg-expense/15 border border-expense/40 text-expense text-xs rounded-xl p-3 mb-4">{banner}</div>
      )}

      <div className="flex bg-surface-2 rounded-xl p-1 mb-6">
        {(['expense', 'income'] as TxType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t)
              setCategoryId('')
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              type === t ? (t === 'expense' ? 'bg-expense/20 text-expense' : 'bg-income/20 text-income') : 'text-ink-faint'
            }`}
          >
            {t === 'expense' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1 text-4xl font-semibold text-ink">
          <input
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9,.]/g, ''))}
            placeholder="0,00"
            className="bg-transparent text-center w-40 outline-none placeholder:text-ink-faint"
            autoFocus={!editing}
          />
          <span className="text-ink-faint">€</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={listening ? stopVoice : startVoice}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border transition ${
            listening ? 'bg-gold/20 border-gold text-gold animate-pulse' : 'bg-surface border-border text-ink-dim'
          }`}
        >
          <span className="text-lg">🎤</span>
          <span className="text-sm">{listening ? 'Escuchando…' : 'Decir gasto por voz'}</span>
        </button>
      </div>
      {voiceError && <p className="text-expense text-xs text-center -mt-4 mb-4">{voiceError}</p>}

      <div className="mb-4">
        <label className="text-ink-faint text-xs mb-1.5 block">Descripción</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={onDescriptionBlur}
          placeholder="¿En qué ha sido?"
          className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none focus:border-gold/60"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-ink-faint text-xs">Categoría</label>
          {autoSuggested && <span className="text-gold text-[11px]">Sugerida automáticamente</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {orderedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategoryId(c.id)
                setAutoSuggested(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs border transition ${
                categoryId === c.id ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-dim bg-surface'
              }`}
            >
              {settings.showCategoryIcons && <span>{c.icon}</span>}
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-ink-faint text-xs mb-1.5 block">Cuenta</label>
        <div className="flex gap-2">
          {accounts
            .filter((a) => !a.archived)
            .map((a) => (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition ${
                  accountId === a.id ? 'border-gold text-gold bg-gold/10' : 'border-border text-ink-dim bg-surface'
                }`}
              >
                {a.name}
              </button>
            ))}
        </div>
        <label className="text-ink-faint text-xs mb-1.5 mt-4 block">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none focus:border-gold/60"
        />
      </div>

      <GoldButton className="w-full" disabled={!canSave} onClick={onSave}>
        Guardar
      </GoldButton>

      {editing && (
        <>
          <GhostButton className="w-full mt-3" onClick={() => navigate(`/add?duplicate=${editing.id}`)}>
            Duplicar como nuevo
          </GhostButton>
          <GhostButton className="w-full mt-3 text-expense" onClick={onDelete}>
            Borrar movimiento
          </GhostButton>
        </>
      )}
    </div>
  )
}
