import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, Clock, Package, Search, ShoppingCart, TruckIcon, Wallet } from 'lucide-react'
import { api } from '../api/mock'

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'vente', label: 'Ventes' },
  { id: 'arrivage', label: 'Arrivages' },
  { id: 'inventaire', label: 'Inventaires' },
  { id: 'produit', label: 'Produits' },
  { id: 'depense', label: 'Depenses' },
]

function getEventType(item) {
  const titre = item.titre.toLowerCase()

  if (titre.startsWith('vente')) return 'vente'
  if (titre.startsWith('arrivage')) return 'arrivage'
  if (titre.startsWith('inventaire')) return 'inventaire'
  if (titre.startsWith('nouveau produit') || titre.startsWith('produit mis')) return 'produit'
  if (titre.startsWith('depense')) return 'depense'
  return 'all'
}

function History() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ['historique'],
    queryFn: api.getHistorique,
  })

  const counts = useMemo(() => ({
    all: data.length,
    vente: data.filter((item) => getEventType(item) === 'vente').length,
    arrivage: data.filter((item) => getEventType(item) === 'arrivage').length,
    inventaire: data.filter((item) => getEventType(item) === 'inventaire').length,
    produit: data.filter((item) => getEventType(item) === 'produit').length,
    depense: data.filter((item) => getEventType(item) === 'depense').length,
  }), [data])

  const historique = useMemo(() => {
    const terme = search.trim().toLowerCase()

    return [...data]
      .filter((item) => {
        const matchesFilter = activeFilter === 'all' || getEventType(item) === activeFilter
        const matchesSearch =
          !terme ||
          item.titre.toLowerCase().includes(terme) ||
          item.description.toLowerCase().includes(terme)

        return matchesFilter && matchesSearch
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [activeFilter, data, search])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Historique</h1>
          <p className="text-beige-600 mt-1">
            Suivez les ventes, les arrivages, les inventaires, les depenses et les produits.
          </p>
        </div>
        <span className="text-sm text-beige-500">
          {historique.length} element{historique.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricCard label="Toutes les actions" value={counts.all} />
        <MetricCard label="Ventes" value={counts.vente} icon={ShoppingCart} tone="success" />
        <MetricCard label="Arrivages" value={counts.arrivage} icon={TruckIcon} />
        <MetricCard label="Inventaires" value={counts.inventaire} icon={ClipboardList} tone="warning" />
        <MetricCard label="Produits" value={counts.produit} icon={Package} tone="warning" />
        <MetricCard label="Depenses" value={counts.depense} icon={Wallet} tone="danger" />
      </div>

      <div className="bg-white rounded-xl border border-beige-200 p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-beige-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou description"
            className="w-full pl-11 pr-4 py-3 border border-beige-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-300"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-beige-900 text-white'
                    : 'bg-beige-50 text-beige-700 border border-beige-200 hover:bg-beige-100'
                }`}
              >
                {filter.label} ({counts[filter.id] || 0})
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">
          <p className="text-beige-600">Chargement de l historique...</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-red-700">
            Erreur: {error?.message || 'Impossible de charger l historique'}
          </p>
        </div>
      ) : historique.length > 0 ? (
        <div className="space-y-3">
          {historique.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-beige-200 bg-white py-12 text-center">
          <Clock size={40} className="mx-auto text-beige-300 mb-3" />
          <p className="text-beige-700 font-medium">Aucun resultat pour ce filtre</p>
          <p className="text-sm text-beige-500 mt-1">
            Essayez une autre recherche ou revenez sur tous les evenements.
          </p>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon: Icon = Clock, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm opacity-75">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function HistoryCard({ item }) {
  const type = getEventType(item)
  const styles = {
    vente: {
      label: 'Vente',
      icon: ShoppingCart,
      container: 'border-green-200 bg-green-50',
      iconBox: 'bg-white text-green-700',
      badge: 'bg-green-100 text-green-700',
    },
    arrivage: {
      label: 'Arrivage',
      icon: TruckIcon,
      container: 'border-blue-200 bg-blue-50',
      iconBox: 'bg-white text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
    },
    inventaire: {
      label: 'Inventaire',
      icon: ClipboardList,
      container: 'border-amber-200 bg-amber-50',
      iconBox: 'bg-white text-amber-700',
      badge: 'bg-amber-100 text-amber-700',
    },
    produit: {
      label: 'Produit',
      icon: Package,
      container: 'border-beige-200 bg-beige-50',
      iconBox: 'bg-white text-beige-700',
      badge: 'bg-beige-100 text-beige-700',
    },
    depense: {
      label: 'Depense',
      icon: Wallet,
      container: 'border-red-200 bg-red-50',
      iconBox: 'bg-white text-red-700',
      badge: 'bg-red-100 text-red-700',
    },
    all: {
      label: 'Activite',
      icon: Clock,
      container: 'border-beige-200 bg-beige-50',
      iconBox: 'bg-white text-beige-700',
      badge: 'bg-beige-100 text-beige-700',
    },
  }[type]

  const Icon = styles.icon

  return (
    <article className={`rounded-xl border p-4 ${styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBox}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                  {styles.label}
                </span>
                <span className="text-xs text-beige-500">Reference #{item.id}</span>
              </div>
              <h2 className="font-semibold text-beige-900">{item.titre}</h2>
            </div>
            <time className="text-sm text-beige-500">
              {new Date(item.date).toLocaleString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
          <p className="mt-3 text-sm text-beige-700 leading-6">{item.description}</p>
        </div>
      </div>
    </article>
  )
}

export default History
