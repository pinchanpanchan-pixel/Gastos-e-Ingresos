import { uid, todayISO } from './utils'
import type { Account, Category, Transaction, Debt, Goal, Recurring, Settings, TxType } from '../types'

const now = new Date().toISOString()
const today = todayISO()

export const CATEGORY_DEFS: { name: string; kind: TxType | 'both'; icon: string; color: string }[] = [
  { name: 'Youtube', kind: 'income', icon: '📹', color: '#f87171' },
  { name: 'Paga', kind: 'income', icon: '💰', color: '#d4af37' },
  { name: 'Otros ingresos', kind: 'income', icon: '➕', color: '#4ade80' },
  { name: 'Compra/Venta', kind: 'both', icon: '🔄', color: '#60a5fa' },
  { name: 'Comida y snacks', kind: 'both', icon: '🍔', color: '#fb923c' },
  { name: 'Transporte', kind: 'expense', icon: '🚌', color: '#38bdf8' },
  { name: 'Tecnología y apps', kind: 'expense', icon: '📱', color: '#a78bfa' },
  { name: 'Entretenimiento', kind: 'expense', icon: '🎮', color: '#f472b6' },
  { name: 'Ropa y calzado', kind: 'expense', icon: '👟', color: '#facc15' },
  { name: 'Escolar', kind: 'both', icon: '🎒', color: '#34d399' },
  { name: 'Salidas y ocio', kind: 'both', icon: '🎉', color: '#fb7185' },
  { name: 'Regalos', kind: 'both', icon: '🎁', color: '#e879f9' },
  { name: 'Viajes', kind: 'expense', icon: '✈️', color: '#22d3ee' },
  { name: 'Otros', kind: 'both', icon: '📦', color: '#9ca3af' },
]

export function buildCategories(): Category[] {
  return CATEGORY_DEFS.map((c, i) => ({
    id: uid(),
    name: c.name,
    kind: c.kind,
    icon: c.icon,
    color: c.color,
    usageCount: CATEGORY_DEFS.length - i,
    budgetMonthly: undefined,
  }))
}

export function buildAccounts(): Account[] {
  return [
    {
      id: uid(),
      name: 'Revolut',
      kind: 'bank',
      initialBalance: 95.93,
      createdAt: now,
    },
    {
      id: uid(),
      name: 'Billetes',
      kind: 'bills',
      initialBalance: 805,
      createdAt: now,
    },
    {
      id: uid(),
      name: 'Monedas',
      kind: 'coins',
      initialBalance: 177.8,
      createdAt: now,
      denominations: { '2': 23, '1': 82, '0.50': 42, '0.20': 89, '0.10': 110, '0.05': 0, '0.02': 0, '0.01': 0 },
    },
  ]
}

export function buildDebts(): Debt[] {
  const rows: [string, number, string][] = [
    ['Aleks', 3.69, 'Taco Bell'],
    ['Alejandro', 2.5, ''],
    ['Alejandro', 11.5, ''],
    ['Héctor', 7, 'Bicimad'],
    ['Mamá', 9.45, 'Spray'],
    ['Papá', 17, 'Popeyes'],
    ['Mamá', 14, 'Bici'],
    ['Papá', 3.15, 'Queso'],
    ['Papá', 2.5, 'Tortitas'],
    ['Bruno', 1.2, 'Bifrutas'],
  ]
  return rows.map(([person, amount, note]) => ({
    id: uid(),
    person,
    amount,
    note,
    direction: 'owed_to_me' as const,
    date: today,
    settled: false,
  }))
}

export function buildGoals(): Goal[] {
  return []
}

export function buildRecurring(): Recurring[] {
  return []
}

export function buildSettings(): Settings {
  return {
    id: 'app',
    pinHash: null,
    biometricEnabled: false,
    currency: 'EUR',
    reminderEnabled: true,
    reminderTime: '22:00',
    budgetAlertPush: true,
    budgetAlertVisual: true,
    categoryOrderMode: 'usage',
    dateDefaultsToday: true,
    voiceConfirmBeforeSave: true,
    onboarded: false,
    categoryOrder: [],
    showCategoryIcons: true,
    showExpenseIncomeColors: true,
    showHomeChart: true,
    showHomeRecent: true,
    showHomeTotals: true,
  }
}

interface HistoricalRow {
  date: string
  description: string
  category: string
  income: number
  expense: number
}

// Parsed from the user's original Google Sheet (all rows with real movements,
// from the day they started it up to the day this was imported).
const HISTORICAL: HistoricalRow[] = [
  { date: '2026-05-11', description: 'Dinero actual', category: 'Otros', income: 482.54, expense: 0 },
  { date: '2026-05-12', description: 'Martes de tacos con Hernán', category: 'Salidas y ocio', income: 0, expense: 3.0 },
  { date: '2026-05-13', description: 'Taco Bell con amigos, eneryeti, Alejandro taco Bell', category: 'Salidas y ocio', income: 1.96, expense: 19.95 },
  { date: '2026-05-14', description: 'Abuelos :), EBLA', category: 'Otros ingresos', income: 31.2, expense: 30.7 },
  { date: '2026-05-15', description: 'Abuela deuda y 5 cent', category: 'Otros ingresos', income: 30.05, expense: 0 },
  { date: '2026-05-16', description: 'Filipinos en el día, dinero encontrado', category: 'Comida y snacks', income: 0.5, expense: 0.95 },
  { date: '2026-05-19', description: 'Comida para la marcha, helado', category: 'Comida y snacks', income: 0, expense: 8.05 },
  { date: '2026-05-20', description: 'Eneryeti, cacahuetes, dinero robado de mamá', category: 'Comida y snacks', income: 0, expense: 12.7 },
  { date: '2026-05-21', description: 'Reventa', category: 'Compra/Venta', income: 25.0, expense: 0 },
  { date: '2026-05-22', description: 'Merienda', category: 'Comida y snacks', income: 0, expense: 2.7 },
  { date: '2026-05-24', description: 'Abuelo :))', category: 'Otros ingresos', income: 50.0, expense: 0 },
  { date: '2026-05-26', description: 'Dinero encontrado, Taco Bell', category: 'Salidas y ocio', income: 0, expense: 4.0 },
  { date: '2026-05-27', description: 'Taco Bell, eneryeti', category: 'Salidas y ocio', income: 0, expense: 12.31 },
  { date: '2026-05-28', description: 'Día, Orlando', category: 'Comida y snacks', income: 0, expense: 21.29 },
  { date: '2026-05-29', description: 'MacDonalds, merienda, Iñigo', category: 'Salidas y ocio', income: 6.83, expense: 27.82 },
  { date: '2026-05-31', description: 'Bicimad', category: 'Transporte', income: 10.51, expense: 15.45 },
  { date: '2026-06-01', description: 'Proveedor de tecnología, merienda, Panic', category: 'Compra/Venta', income: 0, expense: 18.88 },
  { date: '2026-06-03', description: 'Cancha', category: 'Comida y snacks', income: 0, expense: 2.6 },
  { date: '2026-06-05', description: 'Burger', category: 'Salidas y ocio', income: 0, expense: 27.47 },
  { date: '2026-06-06', description: 'Deudas', category: 'Paga', income: 120.0, expense: 0 },
  { date: '2026-06-09', description: 'Cole, deudas mango', category: 'Escolar', income: 0, expense: 5.2 },
  { date: '2026-06-10', description: 'Cole, abuelos, chino', category: 'Escolar', income: 5.0, expense: 7.7 },
  { date: '2026-06-11', description: 'Bicimad', category: 'Transporte', income: 0, expense: 0.5 },
  { date: '2026-06-12', description: 'Fundas iPhone', category: 'Tecnología y apps', income: 0, expense: 26.88 },
  { date: '2026-06-14', description: 'Carrefour', category: 'Comida y snacks', income: 0, expense: 7.78 },
  { date: '2026-06-15', description: 'Varios', category: 'Comida y snacks', income: 0, expense: 10.8 },
  { date: '2026-06-16', description: 'Eneryeti', category: 'Comida y snacks', income: 0, expense: 2.4 },
  { date: '2026-06-18', description: 'Burger King', category: 'Salidas y ocio', income: 0, expense: 34.35 },
  { date: '2026-06-19', description: 'Movimiento sin detallar', category: 'Otros', income: 0, expense: 8.7 },
  { date: '2026-06-20', description: 'iPhone 13', category: 'Compra/Venta', income: 150.0, expense: 0 },
  { date: '2026-06-22', description: 'Carrefour cancha', category: 'Comida y snacks', income: 1.5, expense: 9.9 },
  { date: '2026-06-23', description: 'Cheesecake', category: 'Comida y snacks', income: 0.2, expense: 3.95 },
  { date: '2026-06-29', description: 'Carrefour', category: 'Comida y snacks', income: 0, expense: 11.9 },
  { date: '2026-06-30', description: 'Deudas papás', category: 'Paga', income: 107.0, expense: 0 },
  { date: '2026-07-01', description: 'Para el campamento', category: 'Otros ingresos', income: 105.0, expense: 0 },
  { date: '2026-07-08', description: 'Croissant Cafeteria', category: 'Comida y snacks', income: 0, expense: 1.8 },
  { date: '2026-07-13', description: 'Gastos campa común', category: 'Viajes', income: 0, expense: 56.0 },
  { date: '2026-07-14', description: 'Paga, abuelos', category: 'Paga', income: 60.5, expense: 0 },
  { date: '2026-07-17', description: 'Helados y supermercado', category: 'Comida y snacks', income: 0, expense: 24.78 },
  { date: '2026-07-22', description: 'Helados', category: 'Comida y snacks', income: 0, expense: 4.0 },
  { date: '2026-07-23', description: 'Deudas papá', category: 'Paga', income: 39.0, expense: 0 },
  { date: '2026-07-24', description: 'Helado', category: 'Comida y snacks', income: 0, expense: 5.0 },
  { date: '2026-07-25', description: 'Libro y helado', category: 'Entretenimiento', income: 0, expense: 14.0 },
  { date: '2026-07-26', description: 'Helado, concierto', category: 'Comida y snacks', income: 0, expense: 41.0 },
  { date: '2026-07-27', description: 'Aguas', category: 'Comida y snacks', income: 0, expense: 1.6 },
  { date: '2026-07-28', description: 'Chino con padrinos', category: 'Comida y snacks', income: 0, expense: 9.6 },
  { date: '2026-07-29', description: 'Agua', category: 'Comida y snacks', income: 0, expense: 1.5 },
  { date: '2026-07-30', description: 'La compra con papá', category: 'Comida y snacks', income: 0, expense: 9.15 },
  { date: '2026-08-02', description: 'Carrefour, deudas Bruno, deudas mamá', category: 'Comida y snacks', income: 50.5, expense: 3.58 },
  { date: '2026-08-04', description: 'Robado Bruno', category: 'Otros ingresos', income: 1.8, expense: 0 },
  { date: '2026-08-05', description: 'Carrefour, Bruno', category: 'Comida y snacks', income: 0, expense: 7.09 },
  { date: '2026-08-06', description: 'Glovo abuelos, Bicimad, Carrefour', category: 'Comida y snacks', income: 0, expense: 44.82 },
  { date: '2026-08-07', description: 'Deudas abuelos, encontrado', category: 'Paga', income: 52.0, expense: 57.64 },
  { date: '2026-08-08', description: 'Quintanar', category: 'Viajes', income: 0, expense: 6.2 },
  { date: '2026-08-09', description: 'Movimiento sin detallar', category: 'Otros', income: 0, expense: 2.4 },
  { date: '2026-08-10', description: 'Movimiento sin detallar', category: 'Otros', income: 0, expense: 1.99 },
  { date: '2026-08-11', description: 'Wingstop, casa, abuelos', category: 'Salidas y ocio', income: 44.7, expense: 41.1 },
  { date: '2026-08-12', description: 'Dinero Quintanar', category: 'Otros ingresos', income: 14.0, expense: 3.0 },
  { date: '2026-08-13', description: 'Quitar mesa', category: 'Otros ingresos', income: 1.5, expense: 0 },
  { date: '2026-08-14', description: 'Gasolinera Cabrejas', category: 'Comida y snacks', income: 0, expense: 4.98 },
  { date: '2026-08-19', description: 'Dinero abuelos :)', category: 'Otros ingresos', income: 20.0, expense: 0 },
  { date: '2026-08-22', description: 'Fanta', category: 'Comida y snacks', income: 0, expense: 2.4 },
  { date: '2026-08-23', description: 'Dinero Bruno, apuestas fútbol', category: 'Otros ingresos', income: 3.0, expense: 0 },
  { date: '2026-08-24', description: 'Deudas papá, cancha con Héctor', category: 'Otros ingresos', income: 187.0, expense: 24.28 },
  { date: '2026-08-25', description: 'Día, Héctor Bicimad', category: 'Comida y snacks', income: 2.0, expense: 2.2 },
  { date: '2026-08-26', description: 'Bicimad, Popeyes', category: 'Salidas y ocio', income: 0, expense: 19.0 },
  { date: '2026-08-27', description: 'Bici', category: 'Salidas y ocio', income: 0, expense: 20.45 },
  { date: '2026-08-28', description: 'Otros', category: 'Otros ingresos', income: 5.96, expense: 5.5 },
  { date: '2026-09-03', description: 'iPhone 13 verde, Bruno', category: 'Compra/Venta', income: 205.0, expense: 13.05 },
  { date: '2026-09-04', description: 'Deudas Bruno, carnicería papá', category: 'Otros ingresos', income: 11.6, expense: 3.15 },
  { date: '2026-09-06', description: 'Bebidas', category: 'Comida y snacks', income: 0, expense: 3.6 },
  { date: '2026-09-07', description: 'Bebida fanta', category: 'Comida y snacks', income: 0, expense: 2.6 },
  { date: '2026-09-08', description: 'Carrefour', category: 'Otros', income: 0, expense: 2.25 },
  { date: '2026-09-09', description: 'Deudas', category: 'Paga', income: 30.0, expense: 0 },
]

export function buildHistoricalTransactions(categories: Category[], accounts: Account[]): Transaction[] {
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]))
  const fallback = catByName.get('otros')!
  const account = accounts.find((a) => a.name === 'Revolut') ?? accounts[0]

  const txs: Transaction[] = []
  for (const row of HISTORICAL) {
    const cat = catByName.get(row.category.toLowerCase()) ?? fallback
    const base = { date: row.date, categoryId: cat.id, accountId: account.id, source: 'import' as const, countsTowardBalance: false }
    if (row.income > 0) {
      txs.push({ id: uid(), createdAt: `${row.date}T09:00:00.000Z`, description: row.description, amount: row.income, type: 'income', ...base })
    }
    if (row.expense > 0) {
      txs.push({ id: uid(), createdAt: `${row.date}T09:00:01.000Z`, description: row.description, amount: row.expense, type: 'expense', ...base })
    }
  }
  return txs
}

export function buildSeed() {
  const categories = buildCategories()
  const accounts = buildAccounts()
  const transactions = buildHistoricalTransactions(categories, accounts)
  const debts = buildDebts()
  const goals = buildGoals()
  const recurring = buildRecurring()
  const settings = buildSettings()
  settings.categoryOrder = categories.map((c) => c.id)
  return { categories, accounts, transactions, debts, goals, recurring, settings }
}
