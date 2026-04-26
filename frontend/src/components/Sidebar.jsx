import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Tags,
  TruckIcon,
  Users,
  Wallet,
  X,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/produits', label: 'Produits', icon: Package },
  { path: '/inventaire', label: 'Inventaire', icon: ClipboardList },
  { path: '/arrivages', label: 'Arrivages', icon: TruckIcon },
  { path: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { path: '/depenses', label: 'Depenses', icon: Wallet },
  { path: '/historique', label: 'Historique', icon: Clock },
]

const settingsItems = [
  { path: '/parametres/fournisseurs', label: 'Fournisseurs', icon: Users },
  { path: '/parametres/types-produits', label: 'Types de produits', icon: Tags },
  { path: '/parametres/prestations', label: 'Prestations', icon: Receipt },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const settingsIsActive = useMemo(
    () => settingsItems.some((item) => location.pathname.startsWith(item.path)),
    [location.pathname],
  )
  const [settingsOpen, setSettingsOpen] = useState(settingsIsActive)

  useEffect(() => {
    if (settingsIsActive) {
      setSettingsOpen(true)
    }
  }, [settingsIsActive])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen((value) => !value)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-beige-100 text-beige-800 hover:bg-beige-200 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-beige-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-beige-200">
          <h1 className="text-2xl font-semibold text-beige-900">WebStock</h1>
          <p className="text-sm text-beige-600 mt-1">Gestion salon beaute et stock calcule</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-beige-100 text-beige-900 font-medium'
                        : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}

            <li className="pt-2">
              <button
                type="button"
                onClick={() => setSettingsOpen((value) => !value)}
                className={`flex w-full items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  settingsIsActive
                    ? 'bg-beige-100 text-beige-900 font-medium'
                    : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings size={20} />
                  <span>Parametres</span>
                </span>
                {settingsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {settingsOpen && (
                <ul className="mt-2 space-y-1">
                  {settingsItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `ml-4 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-beige-100 text-beige-900 font-medium'
                              : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                          }`
                        }
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-beige-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-beige-200 flex items-center justify-center">
              <span className="text-sm font-medium text-beige-700">
                {user?.nom?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-beige-900 truncate">
                {user?.nom || 'Utilisateur'}
              </p>
              <p className="text-xs text-beige-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-beige-700 hover:bg-beige-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
