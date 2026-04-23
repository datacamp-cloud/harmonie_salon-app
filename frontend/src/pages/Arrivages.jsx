import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'
import { TruckIcon, Loader2 } from 'lucide-react'

function Arrivages() {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: arrivages, isLoading } = useQuery({
    queryKey: ['arrivages'],
    queryFn: api.getArrivages,
  })

  // Fonction pour ajouter un arrivage
  const addMutation = useMutation({
    mutationFn: api.addArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      setSelectedProduct('')
      setQuantity('')
      toast.success('Arrivage enregistré avec succes')
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de l enregistrement de l arrivage')
    },
  })

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
        <h1 className="text-2xl font-semibold text-beige-900">Arrivages</h1>
        <p className="text-beige-600 mt-1">Enregistrez les nouvelles livraisons de stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Arrivage Form */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-6 flex items-center gap-2">
            <TruckIcon size={20} className="text-beige-600" />
            Ajouter un arrivage
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Sélectionner un produit
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
              >
                <option value="">-- Choisir un produit --</option>
                {produits?.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} (Stock actuel: {produit.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Quantité reçue
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
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer l\'arrivage'
              )}
            </button>
          </form>
        </div>

        {/* Recent Arrivages */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-6">
            Historique des arrivages
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : arrivages?.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {[...arrivages].reverse().map((arrivage) => (
                <li
                  key={arrivage.id}
                  className="p-4 bg-beige-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-beige-900">{arrivage.produitNom}</span>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      +{arrivage.quantite}
                    </span>
                  </div>
                  <p className="text-sm text-beige-600">
                    {new Date(arrivage.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <TruckIcon size={40} className="mx-auto text-beige-300 mb-3" />
              <p className="text-beige-600">Aucun arrivage enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Arrivages
