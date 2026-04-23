import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'
import { Plus, X, Package, Loader2 } from 'lucide-react'

function Products() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ nom: '', prix: '', stock: '' })
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits, isLoading } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  // Fonction pour ajouter un produit
  const addMutation = useMutation({
    mutationFn: api.addProduit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      setShowForm(false)
      setFormData({ nom: '', prix: '', stock: '' })
      toast.success('Produit ajouté avec succes')
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de l ajout du produit')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addMutation.mutate({
      nom: formData.nom,
      prix: parseFloat(formData.prix),
      stock: parseInt(formData.stock),
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Liste des produits</h1>
          <p className="text-beige-600 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors"
        >
          <Plus size={20} />
          Ajouter un produit
        </button>
      </div>

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-beige-900">Nouveau produit</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-beige-500 hover:text-beige-700 hover:bg-beige-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Nom du produit
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="Ex: Shampooing Hydratant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Quantité en stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-beige-600"></div>
          </div>
        ) : produits?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50 border-b border-beige-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">
                    Nom
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">
                    Stock
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">
                    Prix
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {produits.map((produit) => (
                  <tr key={produit.id} className="hover:bg-beige-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-beige-100 rounded-lg flex items-center justify-center">
                          <Package size={18} className="text-beige-600" />
                        </div>
                        <span className="font-medium text-beige-900">{produit.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          produit.stock <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {produit.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-beige-900">
                      {produit.prix.toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package size={48} className="mx-auto text-beige-300 mb-4" />
            <p className="text-beige-600">Aucun produit enregistré</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
