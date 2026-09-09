import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Lock from './screens/Lock'
import Layout from './components/Layout'
import Home from './screens/Home'
import Transactions from './screens/Transactions'
import AddTransaction from './screens/AddTransaction'
import Stats from './screens/Stats'
import Settings from './screens/Settings'
import CategoriesSettings from './screens/settings/CategoriesSettings'
import AccountsSettings from './screens/settings/AccountsSettings'
import DebtsSettings from './screens/settings/DebtsSettings'
import GoalsSettings from './screens/settings/GoalsSettings'
import RecurringSettings from './screens/settings/RecurringSettings'
import SecuritySettings from './screens/settings/SecuritySettings'
import BackupSettings from './screens/settings/BackupSettings'
import BudgetsSettings from './screens/settings/BudgetsSettings'
import DialogHost from './components/DialogHost'

export default function App() {
  const ready = useStore((s) => s.ready)
  const locked = useStore((s) => s.locked)
  const init = useStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-gold text-3xl animate-pulse">€</div>
      </div>
    )
  }

  if (locked) return <Lock />

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/movimientos" element={<Transactions />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/editar/:id" element={<AddTransaction />} />
            <Route path="/estadisticas" element={<Stats />} />
            <Route path="/ajustes" element={<Settings />} />
            <Route path="/ajustes/categorias" element={<CategoriesSettings />} />
            <Route path="/ajustes/presupuestos" element={<BudgetsSettings />} />
            <Route path="/ajustes/cuentas" element={<AccountsSettings />} />
            <Route path="/ajustes/deudas" element={<DebtsSettings />} />
            <Route path="/ajustes/metas" element={<GoalsSettings />} />
            <Route path="/ajustes/recurrentes" element={<RecurringSettings />} />
            <Route path="/ajustes/seguridad" element={<SecuritySettings />} />
            <Route path="/ajustes/backup" element={<BackupSettings />} />
          </Route>
        </Routes>
      </HashRouter>
      <DialogHost />
    </>
  )
}
