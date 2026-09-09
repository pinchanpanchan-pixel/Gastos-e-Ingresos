import type { Category, Transaction, TxType } from '../types'

// Keyword -> category name hints, based on the user's real spending habits.
const KEYWORD_HINTS: [RegExp, string][] = [
  [/\bbici ?mad\b|\bbici\b|\bmetro\b|\bbus\b|\bautob[uú]s\b|\btransporte\b|\btaxi\b|\buber\b|\bcabify\b/i, 'Transporte'],
  [/\bcarrefour\b|\bmercadona\b|\bd[ií]a\b|\bsupermercado\b|\blidl\b|\balcampo\b|\bsnack\b|\bcomida\b|\bcheesecake\b|\bcroissant\b|\bcafeter[ií]a\b|\bmerienda\b|\bhelado\b|\bcacahuetes?\b|\bfilipinos\b/i, 'Comida y snacks'],
  [/\bburger\b|\bmac ?donalds?\b|\btaco ?bell\b|\bkfc\b|\bpopeyes\b|\bcine\b|\bocio\b|\bsalida\b|\bfiesta\b|\bcancha\b|\bpartido\b/i, 'Salidas y ocio'],
  [/\bnetflix\b|\bspotify\b|\bdisney\b|\bhbo\b|\bprime video\b|\bvideojuego\b|\bjuego\b|\bentretenimiento\b/i, 'Entretenimiento'],
  [/\bcole\b|\bcolegio\b|\bescolar\b|\binstituto\b|\bliteratura\b|\blibro\b|\bmaterial\b/i, 'Escolar'],
  [/\biphone\b|\bfunda\b|\bcargador\b|\bauriculares\b|\bairpods\b|\btecnolog[ií]a\b|\bapp\b|\baplicaci[oó]n\b|\bpanic\b/i, 'Tecnología y apps'],
  [/\bropa\b|\bzapatillas?\b|\bnike\b|\bzara\b|\bcalzado\b|\bcamiseta\b|\bpantal[oó]n\b/i, 'Ropa y calzado'],
  [/\bregalo\b|\bcumplea[ñn]os\b/i, 'Regalos'],
  [/\bviaje\b|\bvuelo\b|\bhotel\b|\bcampamento\b/i, 'Viajes'],
  [/\bpaga\b|\bmesada\b|\bdeuda\b/i, 'Paga'],
  [/\byoutube\b/i, 'Youtube'],
  [/\bventa\b|\bcompra\b|\breventa\b|\bwallapop\b/i, 'Compra/Venta'],
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * Suggests a category for a free-text description, learning first from the
 * user's own transaction history (same words used before win), then falling
 * back to a generic keyword dictionary.
 */
export function suggestCategory(
  description: string,
  type: TxType,
  categories: Category[],
  history: Transaction[],
): Category | null {
  const desc = normalize(description)
  if (!desc) return null

  const byId = new Map(categories.map((c) => [c.id, c]))

  // 1. Learn from past transactions with overlapping words.
  const words = desc.split(/\s+/).filter((w) => w.length > 2)
  if (words.length > 0) {
    const candidates = history
      .filter((t) => t.type === type)
      .map((t) => ({ t, score: overlapScore(normalize(t.description), words) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score || b.t.createdAt.localeCompare(a.t.createdAt))

    if (candidates.length > 0) {
      const cat = byId.get(candidates[0].t.categoryId)
      if (cat && !cat.archived) return cat
    }
  }

  // 2. Fall back to keyword dictionary.
  for (const [re, name] of KEYWORD_HINTS) {
    if (re.test(desc)) {
      const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase() && !c.archived)
      if (cat) return cat
    }
  }

  return null
}

function overlapScore(text: string, words: string[]): number {
  let score = 0
  for (const w of words) {
    if (text.includes(w)) score += 1
  }
  return score
}
