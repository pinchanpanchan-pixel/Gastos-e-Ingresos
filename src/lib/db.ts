import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Account, Category, Transaction, Debt, Goal, Recurring, Settings } from '../types'

interface AppDB extends DBSchema {
  accounts: { key: string; value: Account }
  categories: { key: string; value: Category }
  transactions: { key: string; value: Transaction; indexes: { date: string } }
  debts: { key: string; value: Debt }
  goals: { key: string; value: Goal }
  recurring: { key: string; value: Recurring }
  settings: { key: string; value: Settings }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('misfinanzas', 1, {
      upgrade(db) {
        db.createObjectStore('accounts', { keyPath: 'id' })
        db.createObjectStore('categories', { keyPath: 'id' })
        const tx = db.createObjectStore('transactions', { keyPath: 'id' })
        tx.createIndex('date', 'date')
        db.createObjectStore('debts', { keyPath: 'id' })
        db.createObjectStore('goals', { keyPath: 'id' })
        db.createObjectStore('recurring', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function getAll<T extends keyof AppDB>(store: T): Promise<AppDB[T]['value'][]> {
  const db = await getDB()
  return db.getAll(store as never)
}

export async function putOne<T extends keyof AppDB>(store: T, value: AppDB[T]['value']) {
  const db = await getDB()
  await db.put(store as never, value as never)
}

export async function putMany<T extends keyof AppDB>(store: T, values: AppDB[T]['value'][]) {
  const db = await getDB()
  const t = db.transaction(store as never, 'readwrite')
  await Promise.all(values.map((v) => t.store.put(v as never)))
  await t.done
}

export async function deleteOne<T extends keyof AppDB>(store: T, key: string) {
  const db = await getDB()
  await db.delete(store as never, key)
}

export async function clearAll() {
  const db = await getDB()
  const stores: (keyof AppDB)[] = ['accounts', 'categories', 'transactions', 'debts', 'goals', 'recurring', 'settings']
  await Promise.all(stores.map((s) => db.clear(s as never)))
}

export async function exportAllData() {
  const db = await getDB()
  const [accounts, categories, transactions, debts, goals, recurring, settings] = await Promise.all([
    db.getAll('accounts'),
    db.getAll('categories'),
    db.getAll('transactions'),
    db.getAll('debts'),
    db.getAll('goals'),
    db.getAll('recurring'),
    db.getAll('settings'),
  ])
  return { accounts, categories, transactions, debts, goals, recurring, settings, exportedAt: new Date().toISOString() }
}

export async function importAllData(data: Awaited<ReturnType<typeof exportAllData>>) {
  await clearAll()
  await Promise.all([
    putMany('accounts', data.accounts),
    putMany('categories', data.categories),
    putMany('transactions', data.transactions),
    putMany('debts', data.debts),
    putMany('goals', data.goals),
    putMany('recurring', data.recurring),
    putMany('settings', data.settings),
  ])
}
