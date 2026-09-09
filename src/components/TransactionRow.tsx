import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { formatMoney } from '../lib/utils'
import type { Transaction } from '../types'

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const navigate = useNavigate()
  const category = useStore((s) => s.categories.find((c) => c.id === tx.categoryId))
  const account = useStore((s) => s.accounts.find((a) => a.id === tx.accountId))
  const showColors = useStore((s) => s.settings.showExpenseIncomeColors)
  const showIcons = useStore((s) => s.settings.showCategoryIcons)

  const sign = tx.type === 'income' ? '+' : '−'
  const amountClass = showColors ? (tx.type === 'income' ? 'text-income' : 'text-expense') : 'text-ink'

  return (
    <button
      onClick={() => navigate(`/editar/${tx.id}`)}
      className="w-full flex items-center gap-3 py-3 px-1 text-left active:bg-surface-2/50 rounded-xl transition"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: (category?.color ?? '#9ca3af') + '26' }}
      >
        {showIcons ? category?.icon ?? '📦' : (category?.name ?? '?').charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-sm font-medium truncate">{tx.description || category?.name || 'Movimiento'}</p>
        <p className="text-ink-faint text-xs truncate">
          {category?.name ?? 'Sin categoría'}
          {account ? ` · ${account.name}` : ''}
        </p>
      </div>
      <div className={`text-sm font-semibold shrink-0 ${amountClass}`}>
        {sign} {formatMoney(tx.amount)}
      </div>
    </button>
  )
}
