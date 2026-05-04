import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Loader2, Pencil, Plus, X } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/date'

function Inventory() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    produitId: '',
    quantitePhysique: '',
    isValidated: true,
  })
  const [editingId, setEditingId] = useState(null)
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: inventaires = [], isLoading } = useQuery({
    queryKey: ['inventaires'],
    queryFn: api.getInventaires,
  })

  const selectedProduct = produits.find((produit) => produit.id === Number(formData.produitId))
  const quantity = Number(formData.quantitePhysique || 0)
  const ecart = selectedProduct ? quantity - selectedProduct.stock : 0

  const addMutation = useMutation({
    mutationFn: api.addInventaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaires'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        produitId: '',
        quantitePhysique: '',
        isValidated: true,
      })
      toast.success('Inventaire enregistre avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement de l inventaire')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.updateInventaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaires'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setEditingId(null)
      setFormData({ date: new Date().toISOString().slice(0, 10), produitId: '', quantitePhysique: '', isValidated: true })
      toast.success('Inventaire modifie avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur modification'),
  })

  const handleEdit = (inventaire) => {
    setEditingId(inventaire.id)
    setFormData({
      date: inventaire.date,
      produitId: String(inventaire.produitId),
      quantitePhysique: String(inventaire.quantitePhysique),
      isValidated: inventaire.isValidated,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ date: new Date().toISOString().slice(0, 10), produitId: '', quantitePhysique: '', isValidated: true })
  }

  const monthlyCount = useMemo(
    () => inventaires.filter((inventaire) => inventaire.date.startsWith(new Date().toISOString().slice(0, 7))).length,
    [inventaires],
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        date: formData.date,
        produitId: Number(formData.produitId),
        quantitePhysique: Number(formData.quantitePhysique),
      })
    } else {
      addMutation.mutate({
        date: formData.date,
        produitId: Number(formData.produitId),
        quantitePhysique: Number(formData.quantitePhysique),
        isValidated: formData.isValidated,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Inventaire</h1>
          <p className="text-beige-600 mt-1">
            La quantite physique saisie produit un ecart. Le stock n est jamais saisi directement.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoCard label="Produits suivis" value={produits.length} />
          <InfoCard label="Inventaires du mois" value={monthlyCount} tone="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <ClipboardList size={20} className="text-beige-600" />
            {editingId ? 'Modifier l inventaire' : 'Nouvel inventaire'}
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Saisissez la quantite physique observee. L ecart ajuste ensuite le stock calcule.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Produit</label>
              <select
                value={formData.produitId}
                onChange={(event) => setFormData((current) => ({ ...current, produitId: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
              >
                <option value="">-- Choisir un produit --</option>
                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom} | Stock theorique {produit.stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Quantite physique</label>
              <input
                type="number"
                min="0"
                value={formData.quantitePhysique}
                onChange={(event) => setFormData((current) => ({ ...current, quantitePhysique: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="0"
              />
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3">
              <input
                type="checkbox"
                checked={formData.isValidated}
                onChange={(event) => setFormData((current) => ({ ...current, isValidated: event.target.checked }))}
                className="rounded border-beige-300"
              />
              <span className="text-sm text-beige-800">Valider l inventaire pour appliquer l ecart</span>
            </label>

            {selectedProduct && (
              <div className="rounded-xl border border-beige-200 bg-beige-50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricTile label="Stock theorique" value={selectedProduct.stock} />
                <MetricTile label="Quantite comptee" value={quantity} />
                <MetricTile
                  label="Ecart"
                  value={ecart > 0 ? `+${ecart}` : ecart}
                  tone={ecart === 0 ? 'default' : ecart > 0 ? 'success' : 'warning'}
                />
              </div>
            )}

            <div className="flex gap-3">
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors flex items-center justify-center gap-2">
                  <X size={18} /> Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={(addMutation.isPending || updateMutation.isPending) || !selectedProduct}
                className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(addMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
                ) : (
                  <><Plus size={18} />{editingId ? 'Enregistrer les modifications' : 'Enregistrer l inventaire'}</>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des inventaires</h2>
              <p className="text-sm text-beige-600">Chaque inventaire cree un ecart exploite dans le stock.</p>
            </div>
            <span className="text-sm text-beige-500">{inventaires.length} element(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : inventaires.length > 0 ? (
            <ul className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
              {[...inventaires].reverse().map((inventaire) => (
                <li key={inventaire.id} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{inventaire.produitNom}</p>
                      <p className="text-sm text-beige-600 mt-1">
                        Stock theorique {inventaire.stockTheorique} | Quantite comptee {inventaire.quantitePhysique}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!inventaire.isValidated && (
                        <button type="button" onClick={() => handleEdit(inventaire)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-beige-700 text-xs hover:bg-white transition-colors">
                          <Pencil size={13} /> Modifier
                        </button>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          inventaire.ecart === 0
                            ? 'bg-beige-100 text-beige-700'
                            : inventaire.ecart > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Ecart {inventaire.ecart > 0 ? `+${inventaire.ecart}` : inventaire.ecart}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-beige-500">
                    <span>{inventaire.isValidated ? 'Valide' : 'En attente'}</span>
                    <span>{formatDate(inventaire.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-beige-600">Aucun inventaire enregistre</p>
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

function MetricTile({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  }

  return (
    <div className={`rounded-lg border px-3 py-3 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Inventory
