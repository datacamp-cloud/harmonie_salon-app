import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/settings/Products'
import Inventory from './pages/Inventory'
import Arrivages from './pages/Arrivages'
import Sales from './pages/Sales'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import History from './pages/History'
import Suppliers from './pages/settings/Suppliers'
import ProductTypes from './pages/settings/ProductTypes'
import Services from './pages/settings/Services'
import Charges from './pages/settings/Charges'
import Clients from './pages/settings/Customers'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  // Chargement de la page
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventaire" element={<Inventory />} />
        <Route path="arrivages" element={<Arrivages />} />
        <Route path="ventes" element={<Sales />} />
        <Route path="recettes" element={<Income />} />
        <Route path="depenses" element={<Expenses />} />
        <Route path="historique" element={<History />} />
        <Route path="parametres/fournisseurs" element={<Suppliers />} />
        <Route path="parametres/types-produits" element={<ProductTypes />} />
        <Route path="parametres/prestations" element={<Services />} /> 
        <Route path="parametres/produits" element={<Products />} /> 
        <Route path="parametres/charges" element={<Charges />} />
        <Route path="parametres/clients" element={<Clients />} />
       
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
