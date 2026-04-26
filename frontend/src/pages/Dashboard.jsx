import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, Package, ShoppingCart, Wallet } from 'lucide-react'
import { api } from '../api/mock'

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: historique = [], isLoading: historyLoading } = useQuery({
    queryKey: ['historique'],
    queryFn: api.getHistorique,
  })

  const recentEvents = [...historique].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-beige-900">Tableau de bord</h1>
        <p className="text-beige-600 mt-1">
          Vue rapide du salon avec stock calcule, activite commerciale et depenses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Ventes du jour" value={`${stats?.ventesJour?.toLocaleString('fr-FR') || 0} FCFA`} icon={ShoppingCart} color="bg-green-50 text-green-700" />
        <StatCard title="Nombre de ventes" value={stats?.nombreVentesJour || 0} icon={ClipboardList} color="bg-blue-50 text-blue-700" />
        <StatCard title="Produits actifs" value={stats?.totalProduitsActifs || 0} icon={Package} color="bg-beige-100 text-beige-700" />
        <StatCard title="Stock faible" value={stats?.produitsStockFaible?.length || 0} icon={AlertTriangle} color="bg-amber-50 text-amber-700" />
        <StatCard title="Depenses du mois" value={`${stats?.depensesMois?.toLocaleString('fr-FR') || 0} FCFA`} icon={Wallet} color="bg-rose-50 text-rose-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" />
            Produits a surveiller
          </h2>
          {stats?.produitsStockFaible?.length > 0 ? (
            <ul className="space-y-3">
              {stats.produitsStockFaible.map((produit) => (
                <li key={produit.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium text-beige-900">{produit.nom}</p>
                    <p className="text-sm text-beige-600">{produit.typeNom}</p>
                  </div>
                  <span className="text-sm text-amber-700 font-medium">{produit.stock} en stock</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-600 text-center py-4">Aucun produit en stock faible</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <ClipboardList size={20} className="text-beige-600" />
            Activite recente
          </h2>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : recentEvents.length > 0 ? (
            <ul className="space-y-3">
              {recentEvents.map((item) => (
                <li key={item.id} className="p-3 bg-beige-50 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-beige-900">{item.titre}</p>
                    <span className="text-xs text-beige-500">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-beige-600 mt-1">{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-600 text-center py-4">Aucune activite recente</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-beige-200 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-beige-600 mb-1">{title}</p>
          <p className="text-xl font-semibold text-beige-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
