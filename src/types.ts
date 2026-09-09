export type TxType = 'income' | 'expense'

export type AccountKind = 'coins' | 'bills' | 'bank' | 'other'

export interface Account {
  id: string
  name: string
  kind: AccountKind
  initialBalance: number
  createdAt: string
  archived?: boolean
  /** For cash accounts: count of coins/bills per denomination, keyed by euro value e.g. "2", "1", "0.50" */
  denominations?: Record<string, number>
}

export const COIN_DENOMS = ['2', '1', '0.50', '0.20', '0.10', '0.05', '0.02', '0.01']
export const BILL_DENOMS = ['500', '200', '100', '50', '20', '10', '5']

export interface Category {
  id: string
  name: string
  kind: TxType | 'both'
  icon: string | null
  color: string
  budgetMonthly?: number
  usageCount: number
  archived?: boolean
}

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  createdAt: string // ISO datetime, for ordering same-day entries
  description: string
  categoryId: string
  accountId: string
  amount: number // always positive
  type: TxType
  recurringId?: string
  debtId?: string
  source?: 'manual' | 'voice' | 'import' | 'recurring' | 'debt'
  /** false for historical imported rows that predate the account's tracked balance */
  countsTowardBalance?: boolean
}

export type DebtDirection = 'owed_to_me' | 'i_owe'

export interface Debt {
  id: string
  person: string
  note: string
  amount: number
  direction: DebtDirection
  date: string
  settled: boolean
  settledDate?: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  color: string
  createdAt: string
  archived?: boolean
}

export type RecurringFrequency = 'monthly' | 'weekly'

export interface Recurring {
  id: string
  name: string
  categoryId: string
  accountId: string
  amount: number
  type: TxType
  frequency: RecurringFrequency
  dayOfMonth?: number
  active: boolean
  lastGeneratedPeriod?: string // e.g. '2026-07'
  notifyIfMissing: boolean
}

export interface Settings {
  id: 'app'
  pinHash: string | null
  biometricEnabled: boolean
  currency: string
  reminderEnabled: boolean
  reminderTime: string // HH:mm
  budgetAlertPush: boolean
  budgetAlertVisual: boolean
  categoryOrderMode: 'usage' | 'manual' | 'alpha'
  dateDefaultsToday: boolean
  voiceConfirmBeforeSave: boolean
  onboarded: boolean
  categoryOrder: string[]
  showCategoryIcons: boolean
  showExpenseIncomeColors: boolean
  showHomeChart: boolean
  showHomeRecent: boolean
  showHomeTotals: boolean
}
