import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/movimientos', label: 'Movimientos', icon: '📋' },
  { to: '/add', label: '', icon: '+' },
  { to: '/estadisticas', label: 'Gráficas', icon: '📊' },
  { to: '/ajustes', label: 'Ajustes', icon: '⚙️' },
]

export default function Layout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <main className="flex-1 overflow-y-auto pb-24 safe-top">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border safe-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
          {NAV_ITEMS.map((item) =>
            item.icon === '+' ? (
              <button
                key={item.to}
                onClick={() => navigate('/add')}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gold text-[#161302] text-2xl font-bold -mt-6 shadow-lg shadow-black/40 active:scale-95 transition"
                aria-label="Añadir movimiento"
              >
                +
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] ${
                    isActive ? 'text-gold' : 'text-ink-faint'
                  }`
                }
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ),
          )}
        </div>
      </nav>
    </div>
  )
}
