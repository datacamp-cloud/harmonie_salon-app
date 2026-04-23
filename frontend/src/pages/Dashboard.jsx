import { useQuery } from '@tanstack/react-query'
import { api } from '../api/mock'
import { TrendingUp, Package, AlertTriangle, ShoppingCart } from 'lucide-react'

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: ventes, isLoading: ventesLoading } = useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })

  const lastSales = ventes?.slice(-5).reverse() || []

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-beige-900">Tableau de bord</h1>
        <p className="text-beige-600 mt-1">Bienvenue sur votre espace de gestion</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ventes du jour"
          value={`${stats?.ventesJour?.toLocaleString() || '0'} FCFA`}
          icon={TrendingUp}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          title="Nombre de ventes"
          value={stats?.nombreVentesJour || 0}
          icon={ShoppingCart}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Total produits"
          value={stats?.totalProduits || 0}
          icon={Package}
          color="bg-beige-100 text-beige-700"
        />
        <StatCard
          title="Stock faible"
          value={stats?.produitsStockFaible?.length || 0}
          icon={AlertTriangle}
          color="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Produits en stock faible
          </h2>
          {stats?.produitsStockFaible?.length > 0 ? (
            <ul className="space-y-3">
              {stats.produitsStockFaible.map((produit) => (
                <li
                  key={produit.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <span className="font-medium text-beige-900">{produit.nom}</span>
                  <span className="text-sm text-amber-700 font-medium">
                    {produit.stock} en stock
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-600 text-center py-4">
              Aucun produit en stock faible
            </p>
          )}
        </div>

        {/* Last Sales */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} className="text-beige-600" />
            Dernières ventes
          </h2>
          {ventesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : lastSales.length > 0 ? (
            <ul className="space-y-3">
              {lastSales.map((vente) => (
                <li
                  key={vente.id}
                  className="flex items-center justify-between p-3 bg-beige-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-beige-900">{vente.produitNom}</p>
                    <p className="text-sm text-beige-600">
                      {vente.quantite} x {vente.prixUnitaire.toLocaleString()} FCFA
                    </p>
                  </div>
                  <span className="font-semibold text-beige-900">
                    {vente.total.toLocaleString()} FCFA
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-600 text-center py-4">
              Aucune vente enregistrée
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-beige-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-beige-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-beige-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
