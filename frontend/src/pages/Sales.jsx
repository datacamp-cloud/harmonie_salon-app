import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'
import { ShoppingCart, Loader2 } from 'lucide-react'

function Sales() {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: ventes, isLoading } = useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })

  // Fonction pour ajouter une vente
  const addMutation = useMutation({
    mutationFn: api.addVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      setSelectedProduct('')
      setQuantity('')
      toast.success('Vente enregistrée avec succes')
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de l enregistrement de la vente')
    },
  })

  // Fonction pour calculer le prix total de la vente
  const selectedProduit = produits?.find((p) => p.id === parseInt(selectedProduct))
  const totalPrice = selectedProduit && quantity ? selectedProduit.prix * parseInt(quantity) : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    addMutation.mutate({
      produitId: parseInt(selectedProduct),
      quantite: parseInt(quantity),
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-beige-900">Ventes</h1>
        <p className="text-beige-600 mt-1">Enregistrez vos ventes de produits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Sale Form */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-6 flex items-center gap-2">
            <ShoppingCart size={20} className="text-beige-600" />
            Nouvelle vente
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Sélectionner un produit
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                }}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
              >
                <option value="">-- Choisir un produit --</option>
                {produits?.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} - {produit.prix.toLocaleString()} FCFA (Stock: {produit.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduit?.stock || 999}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value)
                }}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="0"
              />
              {selectedProduit && (
                <p className="mt-1 text-sm text-beige-600">
                  Stock disponible: {selectedProduit.stock}
                </p>
              )}
            </div>

            {/* Price Summary */}
            {selectedProduit && quantity && parseInt(quantity) > 0 && (
              <div className="p-4 bg-beige-50 rounded-lg">
                <div className="flex justify-between items-center text-sm text-beige-700 mb-2">
                  <span>Prix unitaire</span>
                  <span>{selectedProduit.prix.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-sm text-beige-700 mb-2">
                  <span>Quantité</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t border-beige-200 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold text-beige-900">
                    <span>Total</span>
                    <span className="text-lg">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={addMutation.isPending || !selectedProduct || !quantity}
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
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-6">
            Historique des ventes
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : ventes?.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {[...ventes].reverse().map((vente) => (
                <li
                  key={vente.id}
                  className="p-4 bg-beige-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-beige-900">{vente.produitNom}</span>
                    <span className="font-semibold text-beige-900">
                      {vente.total.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-beige-600">
                    <span>
                      {vente.quantite} x {vente.prixUnitaire.toLocaleString()} FCFA
                    </span>
                    <span>
                      {new Date(vente.date).toLocaleDateString('fr-FR', {
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
              <p className="text-beige-600">Aucune vente enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sales
