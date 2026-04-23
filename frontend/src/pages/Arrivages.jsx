import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'
import { AlertTriangle, Loader2, Package, TruckIcon } from 'lucide-react'

function Arrivages() {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: arrivages = [], isLoading } = useQuery({
    queryKey: ['arrivages'],
    queryFn: api.getArrivages,
  })

  const produitsList = [...produits].sort(
    (a, b) => a.stock - b.stock || a.nom.localeCompare(b.nom),
  )
  const lowStockProducts = produitsList.filter((produit) => produit.stock <= 5)
  const ruptureProducts = produitsList.filter((produit) => produit.stock === 0)
  const totalReceived = arrivages.reduce((total, arrivage) => total + arrivage.quantite, 0)

  const selectedProduit = produitsList.find((produit) => produit.id === Number.parseInt(selectedProduct, 10))
  const numericQuantity = Number.parseInt(quantity, 10) || 0
  const projectedStock = selectedProduit ? selectedProduit.stock + numericQuantity : null

  const addMutation = useMutation({
    mutationFn: api.addArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      setSelectedProduct('')
      setQuantity('')
      toast.success('Arrivage enregistre avec succes')
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de l enregistrement de l arrivage')
    },
  })

  const isSubmitDisabled = addMutation.isPending || !selectedProduit || numericQuantity <= 0

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedProduit || numericQuantity <= 0) {
      return
    }

    addMutation.mutate({
      produitId: selectedProduit.id,
      quantite: numericQuantity,
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Arrivages</h1>
          <p className="text-beige-600 mt-1">
            Reapprovisionnez le stock et verifiez immediatement l impact sur chaque produit.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Produits suivis" value={produitsList.length} />
          <InfoCard label="Stock faible" value={lowStockProducts.length} tone="warning" />
          <InfoCard label="En rupture" value={ruptureProducts.length} tone="danger" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <TruckIcon size={20} className="text-beige-600" />
            Enregistrer un arrivage
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Choisissez un produit, indiquez la quantite recue puis confirmez la mise a jour.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Produit
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                  setQuantity('')
                }}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
              >
                <option value="">-- Choisir un produit --</option>
                {produitsList.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} | Stock actuel {produit.stock}
                    {produit.stock === 0 ? ' | Rupture' : produit.stock <= 5 ? ' | Priorite' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Quantite recue
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="0"
              />
            </div>

            {selectedProduit && (
              <div className="rounded-xl border border-beige-200 bg-beige-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-beige-900">{selectedProduit.nom}</p>
                    <p className="text-sm text-beige-600">
                      Stock actuel: {selectedProduit.stock}
                    </p>
                  </div>
                  <StockBadge stock={selectedProduit.stock} />
                </div>

                {selectedProduit.stock <= 5 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Ce produit doit etre reapprovisionne en priorite.
                  </div>
                )}

                {numericQuantity > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryTile label="Stock actuel" value={selectedProduit.stock} />
                    <SummaryTile label="Quantite recue" value={numericQuantity} />
                    <SummaryTile
                      label="Stock apres arrivage"
                      value={projectedStock}
                      tone={projectedStock > 5 ? 'success' : 'warning'}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Confirmer l arrivage'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-beige-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-beige-900">Restockage prioritaire</h3>
              <span className="text-sm text-beige-500">{lowStockProducts.length} produit(s)</span>
            </div>
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-2">
                {lowStockProducts.slice(0, 5).map((produit) => (
                  <li
                    key={produit.id}
                    className="flex items-center justify-between rounded-lg border border-beige-200 bg-beige-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <Package size={16} className="text-beige-700" />
                      </div>
                      <p className="text-sm font-medium text-beige-900">{produit.nom}</p>
                    </div>
                    <span className="text-sm font-semibold text-beige-700">{produit.stock}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-beige-600">
                Aucun produit ne demande de restockage immediat.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des arrivages</h2>
              <p className="text-sm text-beige-600">
                Visualisez les dernieres entrees de stock en un coup d oeil.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-beige-500">Total recu</p>
              <p className="text-xl font-semibold text-beige-900">{totalReceived}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : arrivages.length > 0 ? (
            <ul className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
              {[...arrivages].reverse().map((arrivage) => (
                <li
                  key={arrivage.id}
                  className="rounded-xl border border-beige-200 bg-beige-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{arrivage.produitNom}</p>
                      <p className="text-sm text-beige-600 mt-1">
                        Entree de {arrivage.quantite} unite(s)
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      +{arrivage.quantite}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-beige-500">
                    <span>Reference #{arrivage.id}</span>
                    <span>
                      {new Date(arrivage.date).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <TruckIcon size={40} className="mx-auto text-beige-300 mb-3" />
              <p className="text-beige-600">Aucun arrivage enregistre</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[110px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

function SummaryTile({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-700',
  }

  return (
    <div className={`rounded-lg border px-3 py-3 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">Rupture</span>
  }

  if (stock <= 5) {
    return <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">Priorite: {stock}</span>
  }

  return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">Stable: {stock}</span>
}

export default Arrivages
