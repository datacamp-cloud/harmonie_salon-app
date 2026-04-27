import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, Loader2, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'

const createItem = () => ({ produitId: '', quantite: '' })

function Sales() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    clientId: '',
    items: [createItem()],
    isValidated: false,
  })
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: api.getClients,
  })

  const { data: ventes = [], isLoading } = useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const activeProducts = produits.filter((p) => p.actif)

  const totalVente = useMemo(
    () =>
      formData.items.reduce((total, item) => {
        const produit = produits.find((p) => p.id === Number(item.produitId))
        return total + (produit?.prix || 0) * Number(item.quantite || 0)
      }, 0),
    [formData.items, produits],
  )

  const hasShortage = useMemo(
    () =>
      formData.items.some((item) => {
        const produit = produits.find((p) => p.id === Number(item.produitId))
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
        clientId: '',
        items: [createItem()],
        isValidated: false,
      })
      toast.success('Vente enregistree avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement de la vente')
    },
  })

  const validateMutation = useMutation({
    mutationFn: api.validateVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Vente validee avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la validation')
    },
  })

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const addLine = () => setFormData((c) => ({ ...c, items: [...c.items, createItem()] }))

  const removeLine = (index) =>
    setFormData((c) => ({
      ...c,
      items: c.items.length === 1 ? c.items : c.items.filter((_, i) => i !== index),
    }))

  const handleSubmit = (event) => {
    event.preventDefault()
    addMutation.mutate({
      date: formData.date,
      clientId: formData.clientId ? Number(formData.clientId) : null,
      items: formData.items.map((item) => ({
        produitId: Number(item.produitId),
        quantite: Number(item.quantite),
      })),
      isValidated: formData.isValidated,
    })
  }

  const lowStockProducts = produits.filter((p) => p.stock > 0 && p.stock <= 5)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Ventes de produits</h1>
          <p className="text-beige-600 mt-1">
            Le stock baisse uniquement apres validation.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Produits actifs" value={activeProducts.length} />
          <InfoCard label="Stock faible" value={lowStockProducts.length} tone="warning" />
          <InfoCard label="Ventes du jour" value={`${(stats?.ventesJour || 0).toLocaleString('fr-FR')} FCFA`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6">

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <ShoppingCart size={20} className="text-beige-600" />
            Nouvelle vente
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Verifiez le stock disponible avant de valider la sortie.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Date + Client sur la même ligne */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((c) => ({ ...c, date: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Client <span className="text-beige-400 font-normal">(optionnel)</span>
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData((c) => ({ ...c, clientId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                >
                  <option value="">-- Client anonyme --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lignes produits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-beige-700">Produits vendus</label>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-sm text-beige-700 hover:text-beige-900 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter une ligne
                </button>
              </div>

              {formData.items.map((item, index) => {
                const produit = produits.find((p) => p.id === Number(item.produitId))
                const quantity = Number(item.quantite || 0)
                const isInvalid = produit && quantity > produit.stock

                return (
                  <div
                    key={`${index}-${item.produitId}`}
                    className="rounded-xl border border-beige-200 bg-beige-50 p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3">
                      <select
                        value={item.produitId}
                        onChange={(e) => handleItemChange(index, 'produitId', e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                      >
                        <option value="">-- Choisir un produit --</option>
                        {activeProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nom} | Stock {p.stock}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantite}
                        onChange={(e) => handleItemChange(index, 'quantite', e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                        placeholder="Quantite"
                      />

                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        disabled={formData.items.length === 1}
                        className="px-3 py-3 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {produit && (
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span className="text-beige-600">
                          Stock disponible : <strong className="text-beige-900">{produit.stock}</strong>
                        </span>
                        <span className="text-beige-600">
                          Sous-total : <strong className="text-beige-900">{(produit.prix * quantity).toLocaleString('fr-FR')} FCFA</strong>
                        </span>
                      </div>
                    )}

                    {isInvalid && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        La quantite saisie depasse le stock disponible.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Validation */}
            <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isValidated}
                onChange={(e) => setFormData((c) => ({ ...c, isValidated: e.target.checked }))}
                className="rounded border-beige-300"
              />
              <div>
                <span className="text-sm font-medium text-beige-800">
                  Valider la vente après verification
                </span>
                <p className="text-xs text-beige-500 mt-0.5">
                  Une fois validee, la vente ne peut plus etre modifiee.
                </p>
              </div>
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

        {/* Historique */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Dernieres ventes</h2>
              {/* <p className="text-sm text-beige-600">Chaque vente regroupe ses lignes produits.</p> */}
            </div>
            <span className="text-sm text-beige-400">{ventes.length} document(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
            </div>
          ) : ventes.length > 0 ? (
            <ul className="space-y-3 max-h-[40rem] overflow-y-auto pr-1">
              {[...ventes].reverse().map((vente) => (
                <li key={vente.id} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">
                        {vente.clientNom || 'Client anonyme'}
                      </p>
                      <p className="text-sm text-beige-500 mt-0.5">
                        {vente.items.length} produit(s) · {vente.totalQuantite} unite(s) · {vente.total.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!vente.isValidated && (
                        <button
                          type="button"
                          onClick={() => validateMutation.mutate(vente.id)}
                          disabled={validateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          Valider
                        </button>
                      )}
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
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {vente.items.map((item) => (
                      <li
                        key={`${vente.id}-${item.produitId}`}
                        className="flex items-center justify-between text-sm text-beige-700"
                      >
                        <span>{item.produitNom}</span>
                        <span>{item.quantite} × {item.prixUnitaire.toLocaleString('fr-FR')} FCFA</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 text-xs text-beige-400">{vente.date}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-beige-500">Aucune vente enregistree</p>
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