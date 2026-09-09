import { create } from 'zustand'
import * as db from '../lib/db'
import { buildSeed } from '../lib/seed'
import { uid, todayISO, monthKey as toMonthKey } from '../lib/utils'
import type { Account, Category, Transaction, Debt, Goal, Recurring, Settings } from '../types'

interface StoreState {
  ready: boolean
  locked: boolean
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  debts: Debt[]
  goals: Goal[]
  recurring: Recurring[]
  settings: Settings

  init: () => Promise<void>
  unlock: () => void
  lock: () => void

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Promise<void>
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>

  addCategory: (c: Omit<Category, 'id' | 'usageCount'>) => Promise<Category>
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  addDebt: (d: Omit<Debt, 'id' | 'settled'>) => Promise<void>
  updateDebt: (id: string, patch: Partial<Debt>) => Promise<void>
  settleDebt: (id: string) => Promise<void>
  deleteDebt: (id: string) => Promise<void>

  addGoal: (g: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>
  contributeToGoal: (id: string, amount: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  addRecurring: (r: Omit<Recurring, 'id'>) => Promise<void>
  updateRecurring: (id: string, patch: Partial<Recurring>) => Promise<void>
  deleteRecurring: (id: string) => Promise<void>
  generateDueRecurring: () => Promise<void>

  updateSettings: (patch: Partial<Settings>) => Promise<void>
  reseed: () => Promise<void>
  wipe: () => Promise<void>

  accountBalance: (accountId: string) => number
  totalBalance: () => number
  netDebts: () => number
  monthTotals: (month: string) => { income: number; expense: number }
  categorySpend: (month: string, categoryId: string) => number
}

export const useStore = create<StoreState>((set, get) => ({
  ready: false,
  locked: false,
  accounts: [],
  categories: [],
  transactions: [],
  debts: [],
  goals: [],
  recurring: [],
  settings: buildSeed().settings,

  init: async () => {
    if (get().ready) return
    let [accounts, categories, transactions, debts, goals, recurring, settingsArr] = await Promise.all([
      db.getAll('accounts'),
      db.getAll('categories'),
      db.getAll('transactions'),
      db.getAll('debts'),
      db.getAll('goals'),
      db.getAll('recurring'),
      db.getAll('settings'),
    ])

    if (categories.length === 0 && accounts.length === 0) {
      const seed = buildSeed()
      accounts = seed.accounts
      categories = seed.categories
      transactions = seed.transactions
      debts = seed.debts
      goals = seed.goals
      recurring = seed.recurring
      await Promise.all([
        db.putMany('accounts', accounts),
        db.putMany('categories', categories),
        db.putMany('transactions', transactions),
        db.putMany('debts', debts),
        db.putMany('goals', goals),
        db.putOne('settings', seed.settings),
      ])
      settingsArr = [seed.settings]
    }

    const settings = settingsArr[0] ?? buildSeed().settings
    set({
      accounts,
      categories,
      transactions,
      debts,
      goals,
      recurring,
      settings,
      ready: true,
      locked: !!settings.pinHash,
    })
    await get().generateDueRecurring()
  },

  unlock: () => set({ locked: false }),
  lock: () => set({ locked: !!get().settings.pinHash }),

  addTransaction: async (t) => {
    const tx: Transaction = { ...t, id: uid(), createdAt: new Date().toISOString() }
    set((s) => ({ transactions: [...s.transactions, tx] }))
    await db.putOne('transactions', tx)
    const cat = get().categories.find((c) => c.id === t.categoryId)
    if (cat) await get().updateCategory(cat.id, { usageCount: cat.usageCount + 1 })
    return tx
  },
  updateTransaction: async (id, patch) => {
    const existing = get().transactions.find((t) => t.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? updated : t)) }))
    await db.putOne('transactions', updated)
  },
  deleteTransaction: async (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
    await db.deleteOne('transactions', id)
  },

  addAccount: async (a) => {
    const acc: Account = { ...a, id: uid(), createdAt: new Date().toISOString() }
    set((s) => ({ accounts: [...s.accounts, acc] }))
    await db.putOne('accounts', acc)
  },
  updateAccount: async (id, patch) => {
    const existing = get().accounts.find((a) => a.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ accounts: s.accounts.map((a) => (a.id === id ? updated : a)) }))
    await db.putOne('accounts', updated)
  },
  deleteAccount: async (id) => {
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }))
    await db.deleteOne('accounts', id)
  },

  addCategory: async (c) => {
    const cat: Category = { ...c, id: uid(), usageCount: 0 }
    set((s) => ({ categories: [...s.categories, cat], settings: { ...s.settings, categoryOrder: [...s.settings.categoryOrder, cat.id] } }))
    await db.putOne('categories', cat)
    await get().updateSettings({ categoryOrder: get().settings.categoryOrder })
    return cat
  },
  updateCategory: async (id, patch) => {
    const existing = get().categories.find((c) => c.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? updated : c)) }))
    await db.putOne('categories', updated)
  },
  deleteCategory: async (id) => {
    await get().updateCategory(id, { archived: true })
  },

  addDebt: async (d) => {
    const debt: Debt = { ...d, id: uid(), settled: false }
    set((s) => ({ debts: [...s.debts, debt] }))
    await db.putOne('debts', debt)
  },
  updateDebt: async (id, patch) => {
    const existing = get().debts.find((d) => d.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ debts: s.debts.map((d) => (d.id === id ? updated : d)) }))
    await db.putOne('debts', updated)
  },
  settleDebt: async (id) => {
    await get().updateDebt(id, { settled: true, settledDate: todayISO() })
  },
  deleteDebt: async (id) => {
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }))
    await db.deleteOne('debts', id)
  },

  addGoal: async (g) => {
    const goal: Goal = { ...g, id: uid(), currentAmount: 0, createdAt: new Date().toISOString() }
    set((s) => ({ goals: [...s.goals, goal] }))
    await db.putOne('goals', goal)
  },
  updateGoal: async (id, patch) => {
    const existing = get().goals.find((g) => g.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? updated : g)) }))
    await db.putOne('goals', updated)
  },
  contributeToGoal: async (id, amount) => {
    const existing = get().goals.find((g) => g.id === id)
    if (!existing) return
    await get().updateGoal(id, { currentAmount: existing.currentAmount + amount })
  },
  deleteGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
    await db.deleteOne('goals', id)
  },

  addRecurring: async (r) => {
    const rec: Recurring = { ...r, id: uid() }
    set((s) => ({ recurring: [...s.recurring, rec] }))
    await db.putOne('recurring', rec)
  },
  updateRecurring: async (id, patch) => {
    const existing = get().recurring.find((r) => r.id === id)
    if (!existing) return
    const updated = { ...existing, ...patch }
    set((s) => ({ recurring: s.recurring.map((r) => (r.id === id ? updated : r)) }))
    await db.putOne('recurring', updated)
  },
  deleteRecurring: async (id) => {
    set((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) }))
    await db.deleteOne('recurring', id)
  },
  generateDueRecurring: async () => {
    const today = new Date()
    const currentPeriod = toMonthKey(todayISO())
    const dayOfMonth = today.getDate()
    for (const r of get().recurring) {
      if (!r.active) continue
      if (r.lastGeneratedPeriod === currentPeriod) continue
      if (r.frequency === 'monthly' && r.dayOfMonth && dayOfMonth >= r.dayOfMonth) {
        await get().addTransaction({
          date: todayISO(),
          description: r.name,
          categoryId: r.categoryId,
          accountId: r.accountId,
          amount: r.amount,
          type: r.type,
          recurringId: r.id,
          source: 'recurring',
        })
        await get().updateRecurring(r.id, { lastGeneratedPeriod: currentPeriod })
      }
    }
  },

  updateSettings: async (patch) => {
    const updated = { ...get().settings, ...patch }
    set({ settings: updated })
    await db.putOne('settings', updated)
  },
  reseed: async () => {
    await db.clearAll()
    set({ ready: false })
    await get().init()
  },
  wipe: async () => {
    await db.clearAll()
    const settings = buildSeed().settings
    settings.onboarded = true
    await db.putOne('settings', settings)
    set({ accounts: [], categories: [], transactions: [], debts: [], goals: [], recurring: [], settings })
  },

  accountBalance: (accountId) => {
    const s = get()
    const acc = s.accounts.find((a) => a.id === accountId)
    if (!acc) return 0
    const delta = s.transactions
      .filter((t) => t.accountId === accountId && t.countsTowardBalance !== false)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
    return acc.initialBalance + delta
  },
  totalBalance: () => {
    const s = get()
    return s.accounts.filter((a) => !a.archived).reduce((sum, a) => sum + get().accountBalance(a.id), 0)
  },
  netDebts: () => {
    const s = get()
    return s.debts
      .filter((d) => !d.settled)
      .reduce((sum, d) => sum + (d.direction === 'owed_to_me' ? d.amount : -d.amount), 0)
  },
  monthTotals: (month) => {
    const s = get()
    let income = 0
    let expense = 0
    for (const t of s.transactions) {
      if (toMonthKey(t.date) !== month) continue
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  },
  categorySpend: (month, categoryId) => {
    const s = get()
    return s.transactions
      .filter((t) => toMonthKey(t.date) === month && t.categoryId === categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  },
}))
