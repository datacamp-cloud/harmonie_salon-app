import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, Package, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useEffect } from 'react'

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: historique = [], isLoading: historyLoading } = useQuery({
    queryKey: ['historique'],
    queryFn: api.getHistorique,
  })

  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (user?.pseudo) {
      toast.success(`Bonjour ${user.pseudo} 🌟`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const recentEvents = [...historique]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beige-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Tableau de bord</h1>
          <p className="text-sm text-beige-500 mt-0.5 capitalize">{today}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Ventes du jour"
          value={`${stats?.ventesJour?.toLocaleString('fr-FR') || 0} FCFA`}
          icon={ShoppingCart}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          title="Recettes du jour"
          value={`${stats?.recettesJour?.toLocaleString('fr-FR') || 0} FCFA`}
          icon={Receipt}
          color="bg-violet-50 text-violet-700"
        />
        <StatCard
          title="Depenses du jour"
          value={`${stats?.depensesJour?.toLocaleString('fr-FR') || 0} FCFA`}
          icon={Wallet}
          color="bg-rose-50 text-rose-700"
        />
        <StatCard
          title="Etat de caisse"
          value={`${stats?.etatCaisse?.toLocaleString('fr-FR') || 0} FCFA`}
          icon={TrendingUp}
          color={!stats || stats.etatCaisse >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
        />
      </div>

      {/* KPIs secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Nombre de ventes"
          value={stats?.nombreVentesJour || 0}
          icon={ClipboardList}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Produits actifs"
          value={stats?.totalProduitsActifs || 0}
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

      {/* Alertes + activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Produits à surveiller */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-base font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Produits a surveiller
          </h2>
          {stats?.produitsStockFaible?.length > 0 ? (
            <ul className="space-y-2">
              {stats.produitsStockFaible.map((produit) => (
                <li
                  key={produit.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-beige-900">{produit.nom}</p>
                    <p className="text-xs text-beige-500">{produit.typeNom}</p>
                  </div>
                  <span className="text-sm text-amber-700 font-semibold">
                    {produit.stock} en stock
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-500 text-sm text-center py-6">
              Aucun produit en stock faible
            </p>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-base font-semibold text-beige-900 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-beige-500" />
            Activite recente
          </h2>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
            </div>
          ) : recentEvents.length > 0 ? (
            <ul className="space-y-2">
              {recentEvents.map((item) => (
                <li key={item.id} className="p-3 bg-beige-50 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-beige-900">{item.titre}</p>
                    <span className="text-xs text-beige-400 shrink-0">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-xs text-beige-500 mt-0.5">{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-beige-500 text-sm text-center py-6">Aucune activite recente</p>
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
          <p className="text-xs text-beige-500 mb-1 uppercase tracking-wide">{title}</p>
          <p className="text-xl font-semibold text-beige-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard