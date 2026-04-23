import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'
import { AlertTriangle, Loader2, Package, ShoppingCart } from 'lucide-react'

function Sales() {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: ventes = [], isLoading } = useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })

  const produitsList = [...produits].sort((a, b) => a.nom.localeCompare(b.nom))
  const lowStockProducts = produitsList.filter((produit) => produit.stock > 0 && produit.stock <= 5)
  const outOfStockProducts = produitsList.filter((produit) => produit.stock === 0)

  const selectedProduit = produitsList.find((produit) => produit.id === Number.parseInt(selectedProduct, 10))
  const numericQuantity = Number.parseInt(quantity, 10) || 0
  const totalPrice = selectedProduit && numericQuantity > 0 ? selectedProduit.prix * numericQuantity : 0
  const stockAfterSale = selectedProduit ? selectedProduit.stock - numericQuantity : null
  const isQuantityInvalid = selectedProduit ? numericQuantity > selectedProduit.stock : false

  const addMutation = useMutation({
    mutationFn: api.addVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      setSelectedProduct('')
      setQuantity('')
      toast.success('Vente enregistree avec succes')
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de l enregistrement de la vente')
    },
  })

  const isSubmitDisabled =
    addMutation.isPending ||
    !selectedProduit ||
    numericQuantity <= 0 ||
    isQuantityInvalid ||
    selectedProduit.stock === 0

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedProduit || numericQuantity <= 0 || numericQuantity > selectedProduit.stock) {
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
          <h1 className="text-2xl font-semibold text-beige-900">Ventes</h1>
          <p className="text-beige-600 mt-1">
            Enregistrez rapidement une sortie de stock sans perdre de vue les produits sensibles.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Produits actifs" value={produitsList.length - outOfStockProducts.length} />
          <InfoCard label="Stock faible" value={lowStockProducts.length} tone="warning" />
          <InfoCard label="Rupture" value={outOfStockProducts.length} tone="danger" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <ShoppingCart size={20} className="text-beige-600" />
            Nouvelle vente
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Selectionnez un produit, verifiez le stock disponible puis validez la sortie.
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
                  <option
                    key={produit.id}
                    value={produit.id}
                    disabled={produit.stock === 0}
                  >
                    {produit.nom} - {produit.prix.toLocaleString()} FCFA | Stock {produit.stock}
                    {produit.stock === 0 ? ' | Rupture' : produit.stock <= 5 ? ' | Stock faible' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Quantite
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduit?.stock || 999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="0"
              />
              {selectedProduit && (
                <p className="mt-2 text-sm text-beige-600">
                  Stock disponible: {selectedProduit.stock}
                </p>
              )}
              {isQuantityInvalid && (
                <p className="mt-2 text-sm text-red-600">
                  La quantite saisie depasse le stock disponible.
                </p>
              )}
            </div>

            {selectedProduit && (
              <div className="rounded-xl border border-beige-200 bg-beige-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-beige-900">{selectedProduit.nom}</p>
                    <p className="text-sm text-beige-600">
                      Prix unitaire: {selectedProduit.prix.toLocaleString()} FCFA
                    </p>
                  </div>
                  <StockBadge stock={selectedProduit.stock} />
                </div>

                {selectedProduit.stock === 0 ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Ce produit est en rupture. Il ne peut pas etre vendu pour le moment.
                  </div>
                ) : selectedProduit.stock <= 5 ? (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Stock faible. Pensez a planifier un reassort rapidement.
                  </div>
                ) : null}

                {numericQuantity > 0 && !isQuantityInvalid && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SummaryTile label="Quantite vendue" value={numericQuantity} />
                    <SummaryTile label="Total" value={`${totalPrice.toLocaleString()} FCFA`} />
                    <SummaryTile
                      label="Stock apres vente"
                      value={stockAfterSale}
                      tone={stockAfterSale <= 5 ? 'warning' : 'default'}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Validation...
                </>
              ) : (
                'Valider la vente'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-beige-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-beige-900">Produits a surveiller</h3>
              <span className="text-sm text-beige-500">{lowStockProducts.length} alerte(s)</span>
            </div>
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-2">
                {lowStockProducts.slice(0, 4).map((produit) => (
                  <li
                    key={produit.id}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <Package size={16} className="text-amber-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-beige-900">{produit.nom}</p>
                        <p className="text-xs text-beige-600">
                          {produit.prix.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-amber-800">{produit.stock}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-beige-600">
                Aucun produit sensible pour le moment.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Dernieres ventes</h2>
              <p className="text-sm text-beige-600">
                Un apercu rapide des sorties de stock les plus recentes.
              </p>
            </div>
            <span className="text-sm text-beige-500">{ventes.length} vente(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : ventes.length > 0 ? (
            <ul className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
              {[...ventes].reverse().map((vente) => (
                <li
                  key={vente.id}
                  className="rounded-xl border border-beige-200 bg-beige-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{vente.produitNom}</p>
                      <p className="text-sm text-beige-600 mt-1">
                        {vente.quantite} unite(s) x {vente.prixUnitaire.toLocaleString()} FCFA
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      {vente.total.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-beige-500">
                    <span>Reference #{vente.id}</span>
                    <span>
                      {new Date(vente.date).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
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
              <ShoppingCart size={40} className="mx-auto text-beige-300 mb-3" />
              <p className="text-beige-600">Aucune vente enregistree</p>
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
    return <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">Stock faible: {stock}</span>
  }

  return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">Stock sain: {stock}</span>
}

export default Sales
