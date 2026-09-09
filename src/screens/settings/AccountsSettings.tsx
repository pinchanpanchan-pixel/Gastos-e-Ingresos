import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { ScreenTitle, Card, GoldButton, GhostButton } from '../../components/ui'
import { formatMoney } from '../../lib/utils'
import { COIN_DENOMS, BILL_DENOMS } from '../../types'
import type { Account } from '../../types'

export default function AccountsSettings() {
  const navigate = useNavigate()
  const allAccounts = useStore((s) => s.accounts)
  const accounts = allAccounts.filter((a) => !a.archived)
  const accountBalance = useStore((s) => s.accountBalance)
  const updateAccount = useStore((s) => s.updateAccount)
  const addAccount = useStore((s) => s.addAccount)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const askConfirm = useStore((s) => s.askConfirm)

  const [addingName, setAddingName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="px-5 pt-4 pb-8 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-ink-dim text-sm mb-2">
        ‹ Ajustes
      </button>
      <ScreenTitle subtitle="Revolut, billetes, monedas y las que añadas">Cuentas</ScreenTitle>

      <div className="flex flex-col gap-3">
        {accounts.map((a) => (
          <AccountCard key={a.id} account={a} balance={accountBalance(a.id)} onUpdate={(patch) => updateAccount(a.id, patch)} onDelete={async () => {
            if (await askConfirm(`¿Borrar la cuenta "${a.name}"? Sus movimientos no se borrarán.`)) deleteAccount(a.id)
          }} />
        ))}
      </div>

      {showAdd ? (
        <Card className="mt-4">
          <input
            value={addingName}
            onChange={(e) => setAddingName(e.target.value)}
            placeholder="Nombre de la cuenta"
            className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-3 text-ink text-sm outline-none mb-3"
          />
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={() => setShowAdd(false)}>
              Cancelar
            </GhostButton>
            <GoldButton
              className="flex-1"
              disabled={!addingName.trim()}
              onClick={async () => {
                await addAccount({ name: addingName.trim(), kind: 'other', initialBalance: 0 })
                setAddingName('')
                setShowAdd(false)
              }}
            >
              Crear
            </GoldButton>
          </div>
        </Card>
      ) : (
        <GoldButton className="w-full mt-4" onClick={() => setShowAdd(true)}>
          + Nueva cuenta
        </GoldButton>
      )}
    </div>
  )
}

function AccountCard({
  account,
  balance,
  onUpdate,
  onDelete,
}: {
  account: Account
  balance: number
  onUpdate: (patch: Partial<Account>) => void
  onDelete: () => void
}) {
  const [name, setName] = useState(account.name)
  const [showCount, setShowCount] = useState(false)
  const denoms = account.kind === 'coins' ? COIN_DENOMS : account.kind === 'bills' ? BILL_DENOMS : null
  const [counts, setCounts] = useState<Record<string, number>>(account.denominations ?? {})

  function saveCount() {
    const sum = Object.entries(counts).reduce((acc, [v, n]) => acc + parseFloat(v) * (n || 0), 0)
    onUpdate({ denominations: counts, initialBalance: sum })
    setShowCount(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== account.name && onUpdate({ name: name.trim() })}
          className="bg-transparent text-ink text-sm font-medium outline-none flex-1"
        />
        <p className="text-gold text-lg font-semibold">{formatMoney(balance)}</p>
      </div>
      <p className="text-ink-faint text-xs mb-2 capitalize">
        {account.kind === 'coins' ? 'Monedas' : account.kind === 'bills' ? 'Billetes' : account.kind === 'bank' ? 'Cuenta bancaria' : 'Otra cuenta'}
      </p>

      {denoms && (
        <>
          {showCount ? (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {denoms.map((d) => (
                  <div key={d} className="flex items-center gap-1.5 bg-surface-2 rounded-lg px-2 py-1.5">
                    <span className="text-ink-faint text-xs w-12">{account.kind === 'coins' ? `${d}€` : `${d}€`}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={counts[d] ?? ''}
                      onChange={(e) => setCounts((c) => ({ ...c, [d]: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="flex-1 bg-transparent text-ink text-sm outline-none text-right"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <GhostButton className="flex-1 py-2 text-xs" onClick={() => setShowCount(false)}>
                  Cancelar
                </GhostButton>
                <GoldButton className="flex-1 py-2 text-xs" onClick={saveCount}>
                  Guardar recuento
                </GoldButton>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCount(true)} className="text-gold text-xs">
              Contar {account.kind === 'coins' ? 'monedas' : 'billetes'} →
            </button>
          )}
        </>
      )}

      {!denoms && (
        <div className="flex items-center gap-2">
          <span className="text-ink-faint text-xs">Ajustar saldo:</span>
          <input
            type="number"
            inputMode="decimal"
            defaultValue={account.initialBalance}
            onBlur={(e) => onUpdate({ initialBalance: parseFloat(e.target.value) || 0 })}
            className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-ink text-xs w-24 outline-none"
          />
        </div>
      )}

      <button onClick={onDelete} className="text-expense text-xs mt-3">
        Borrar cuenta
      </button>
    </Card>
  )
}
