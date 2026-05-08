import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, FileDown, Package, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useEffect, useState } from 'react'
import { generateEtatCaisse } from '../utils/pdfUtils'

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

  const { data: ventes   = [] } = useQuery({ queryKey: ['ventes'],   queryFn: api.getVentes })
  const { data: recettes = [] } = useQuery({ queryKey: ['recettes'], queryFn: api.getRecettes })
  const { data: depenses = [] } = useQuery({ queryKey: ['depenses'], queryFn: api.getDepenses })
  const [loadingCaisse, setLoadingCaisse] = useState(false)

  const handleEtatCaisse = async () => {
    setLoadingCaisse(true)
    const mois = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    try { await generateEtatCaisse(ventes, recettes, depenses, `Mois de ${mois}`) }
    catch { toast.error('Erreur generation PDF') }
    finally { setLoadingCaisse(false) }
  }

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
          onExport={handleEtatCaisse}
          exportLoading={loadingCaisse}
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

function StatCard({ title, value, icon: Icon, color, onExport, exportLoading }) {
  return (
    <div className="bg-white rounded-xl border border-beige-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-beige-500 mb-1 uppercase tracking-wide">{title}</p>
          <p className="text-xl font-semibold text-beige-900 truncate">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      {onExport && (
        <button type="button" onClick={onExport} disabled={exportLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-beige-900 text-white text-xs rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50">
          {exportLoading
            ? <><span className="animate-spin">⏳</span> Generation...</>
            : <><FileDown size={13} /> Voir l etat de caisse</>}
        </button>
      )}
    </div>
  )
}

export default Dashboard