import type { TxType } from '../types'

const INCOME_WORDS = /\b(ingres[eé]|ingreso|he ganado|gan[eé]|me han dado|me han pagado|me han ingresado|cobr[eé]|he cobrado|he recibido|recib[ií]|me dieron|paga|me ha dado|me ha pagado)\b/i
const EXPENSE_WORDS = /\b(gast[eé]|he gastado|pagu[eé]|he pagado|compr[eé]|he comprado|me he gastado|me he dejado)\b/i

export interface ParsedVoiceEntry {
  amount: number | null
  type: TxType
  description: string
  raw: string
}

/**
 * Very small heuristic NL parser for Spanish spending phrases like:
 * "me he gastado 5 euros en bicimad" -> { amount: 5, type: 'expense', description: 'bicimad' }
 * "he ganado 20 euros de paga" -> { amount: 20, type: 'income', description: 'paga' }
 */
export function parseVoiceEntry(raw: string): ParsedVoiceEntry {
  const text = raw.trim()
  const lower = text.toLowerCase()

  const amountMatch = lower.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?|eur)\b/) ?? lower.match(/(\d+(?:[.,]\d{1,2})?)/)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null

  let type: TxType = 'expense'
  if (INCOME_WORDS.test(lower)) type = 'income'
  else if (EXPENSE_WORDS.test(lower)) type = 'expense'

  let description = text
  if (amountMatch) {
    description = description.replace(amountMatch[0], '')
  }
  description = description
    .replace(INCOME_WORDS, '')
    .replace(EXPENSE_WORDS, '')
    .replace(/^\s*(en|de|por|para|del|de la|de los|de las)\s+/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1)
  }

  return { amount, type, description, raw: text }
}

type SpeechRecognitionCtor = new () => SpeechRecognition

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
