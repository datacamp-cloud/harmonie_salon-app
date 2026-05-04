import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Tags,
  TruckIcon,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react'


const navItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/arrivages', label: 'Arrivages', icon: TruckIcon },
  { path: '/ventes', label: 'Ventes de produits', icon: ShoppingCart },
  { path: '/recettes', label: 'Recettes', icon: Receipt },
  { path: '/depenses', label: 'Depenses', icon: Wallet },
  { path: '/inventaire', label: 'Inventaire', icon: ClipboardList },
  { path: '/historique', label: 'Historique', icon: Clock },
]

const settingsItems = [
  { path: '/parametres/types-produits', label: 'Types de produits', icon: Tags },
  { path: '/parametres/produits', label: 'Produits', icon: Package },
  { path: '/parametres/prestations', label: 'Prestations', icon: Receipt },
  { path: '/parametres/clients', label: 'Clients', icon: UserCheck },
  { path: '/parametres/fournisseurs', label: 'Fournisseurs', icon: Users },
  { path: '/parametres/charges', label: 'Charges', icon: Layers },
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
    if (settingsIsActive) setSettingsOpen(true)
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
        onClick={() => setIsMobileMenuOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-beige-100 text-beige-800 hover:bg-beige-200 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-30" onClick={closeMobileMenu} />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-beige-200 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-beige-200 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Harmonie Salon"
            className="h-10 w-10 object-contain rounded-lg"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            {/* <h1 className="text-lg font-semibold text-beige-900 leading-tight">Harmonie Salon</h1> */}

            <p className="text-xs text-beige-500">WebStock</p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {/* Tableau de bord */}
            <li key="/">
              <NavLink
                to="/"
                end
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-beige-100 text-beige-900 font-medium'
                      : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                  }`
                }
              >
                <LayoutDashboard size={18} />
                <span className="text-sm">Tableau de bord</span>
              </NavLink>
            </li>

            {/* Paramètres — juste après le tableau de bord */}
            <li className="pt-1">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={`flex w-full items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                  settingsIsActive
                    ? 'bg-beige-100 text-beige-900 font-medium'
                    : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Settings size={18} />
                  <span className="text-sm">Parametres</span>
                </span>
                {settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {settingsOpen && (
                <ul className="mt-1 space-y-0.5">
                  {settingsItems.map((item) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `ml-3 flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-beige-100 text-beige-900 font-medium'
                              : 'text-beige-600 hover:bg-beige-50 hover:text-beige-900'
                          }`
                        }
                      >
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Reste des menus */}
            {navItems.filter((item) => item.path !== '/').map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-beige-100 text-beige-900 font-medium'
                        : 'text-beige-700 hover:bg-beige-50 hover:text-beige-900'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Utilisateur */}
        <div className="p-4 border-t border-beige-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-beige-200 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-beige-700">
                {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-beige-900 truncate">{user?.pseudo || 'Utilisateur'}</p>
              <p className="text-xs text-beige-500 truncate">
                {user?.role === 'admin' ? 'Administrateur' : user?.role === 'caissier' ? 'Caissier' : user?.role || ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-beige-600 hover:bg-beige-50 hover:text-beige-900 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Deconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar