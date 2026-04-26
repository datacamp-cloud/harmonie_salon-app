import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Loader2, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'

const createItem = () => ({ produitId: '', quantite: '' })

function Sales() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    items: [createItem()],
    isValidated: true,
  })
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

  const activeProducts = produits.filter((produit) => produit.actif)

  const totalVente = useMemo(
    () => formData.items.reduce((total, item) => {
      const produit = produits.find((entry) => entry.id === Number(item.produitId))
      return total + (produit?.prix || 0) * Number(item.quantite || 0)
    }, 0),
    [formData.items, produits],
  )

  const hasShortage = useMemo(
    () => formData.items.some((item) => {
      const produit = produits.find((entry) => entry.id === Number(item.produitId))
      return produit && Number(item.quantite || 0) > produit.stock
    }),
    [formData.items, produits],
  )

  const addMutation = useMutation({
    mutationFn: api.addVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        items: [createItem()],
        isValidated: true,
      })
      toast.success('Vente enregistree avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement de la vente')
    },
  })

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    addMutation.mutate({
      date: formData.date,
      items: formData.items.map((item) => ({
        produitId: Number(item.produitId),
        quantite: Number(item.quantite),
      })),
      isValidated: formData.isValidated,
    })
  }

  const lowStockProducts = produits.filter((produit) => produit.stock > 0 && produit.stock <= 5)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Ventes</h1>
          <p className="text-beige-600 mt-1">
            Une vente peut contenir un ou plusieurs produits. Le stock baisse uniquement apres validation.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Produits actifs" value={activeProducts.length} />
          <InfoCard label="Stock faible" value={lowStockProducts.length} tone="warning" />
          <InfoCard label="Total courant" value={`${totalVente.toLocaleString('fr-FR')} FCFA`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <ShoppingCart size={20} className="text-beige-600" />
            Nouvelle vente
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Controlez le stock disponible produit par produit avant de valider la sortie.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-beige-700">Produits vendus</label>
                <button
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, items: [...current.items, createItem()] }))}
                  className="text-sm text-beige-700 hover:text-beige-900 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter une ligne
                </button>
              </div>

              {formData.items.map((item, index) => {
                const produit = produits.find((entry) => entry.id === Number(item.produitId))
                const quantity = Number(item.quantite || 0)
                const isInvalid = produit && quantity > produit.stock

                return (
                  <div key={`${index}-${item.produitId}`} className="rounded-xl border border-beige-200 bg-beige-50 p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3">
                      <select
                        value={item.produitId}
                        onChange={(event) => handleItemChange(index, 'produitId', event.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                      >
                        <option value="">-- Choisir un produit --</option>
                        {activeProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.nom} | Stock {product.stock}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantite}
                        onChange={(event) => handleItemChange(index, 'quantite', event.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                        placeholder="Quantite"
                      />

                      <button
                        type="button"
                        onClick={() => setFormData((current) => ({
                          ...current,
                          items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
                        }))}
                        className="px-3 py-3 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {produit && (
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="text-beige-600">
                          Stock disponible: <strong className="text-beige-900">{produit.stock}</strong>
                        </span>
                        <span className="text-beige-600">
                          Sous-total: <strong className="text-beige-900">{(produit.prix * quantity).toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      </div>
                    )}

                    {isInvalid && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        La quantite saisie depasse le stock calcule disponible.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3">
              <input
                type="checkbox"
                checked={formData.isValidated}
                onChange={(event) => setFormData((current) => ({ ...current, isValidated: event.target.checked }))}
                className="rounded border-beige-300"
              />
              <span className="text-sm text-beige-800">Valider la vente et sortir les produits du stock</span>
            </label>

            <button
              type="submit"
              disabled={addMutation.isPending || (formData.isValidated && hasShortage)}
              className="w-full px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer la vente'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Dernieres ventes</h2>
              <p className="text-sm text-beige-600">Chaque vente regroupe ses lignes produits.</p>
            </div>
            <span className="text-sm text-beige-500">{ventes.length} document(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : ventes.length > 0 ? (
            <ul className="space-y-3 max-h-[40rem] overflow-y-auto pr-1">
              {[...ventes].reverse().map((vente) => (
                <li key={vente.id} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{vente.items.length} produit(s)</p>
                      <p className="text-sm text-beige-600 mt-1">
                        {vente.totalQuantite} unite(s) pour {vente.total.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        vente.isValidated
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {vente.isValidated ? 'Validee' : 'En attente'}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2">
                    {vente.items.map((item) => (
                      <li key={`${vente.id}-${item.produitId}`} className="flex items-center justify-between text-sm text-beige-700">
                        <span>{item.produitNom}</span>
                        <span>{item.quantite} x {item.prixUnitaire.toLocaleString('fr-FR')} FCFA</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 text-xs text-beige-500">{vente.date}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
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
  }

  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[120px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Sales
