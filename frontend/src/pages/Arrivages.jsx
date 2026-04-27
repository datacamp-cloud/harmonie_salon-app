import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Package, Plus, CheckCircle2, Trash2, TruckIcon } from 'lucide-react'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'

const createItem = () => ({ produitId: '', quantite: '' })

function Arrivages() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    fournisseurId: '',
    items: [createItem()],
    isValidated: false,
  })
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: fournisseurs = [] } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: api.getFournisseurs,
  })

  const { data: arrivages = [], isLoading } = useQuery({
    queryKey: ['arrivages'],
    queryFn: api.getArrivages,
  })

  const totalQuantite = useMemo(
    () => formData.items.reduce((total, item) => total + Number(item.quantite || 0), 0),
    [formData.items],
  )

  const addMutation = useMutation({
    mutationFn: api.addArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        fournisseurId: '',
        items: [createItem()],
        isValidated: false,
      })
      toast.success('Arrivage enregistre avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement de l arrivage')
    },
  })

  const validateMutation = useMutation({
    mutationFn: api.validateArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Arrivage valide avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la validation')
    },
  })

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        // Si on change le produit, on remet le fournisseur à zéro
        // car les fournisseurs disponibles vont changer
        if (field === 'produitId') {
          return { ...item, produitId: value, fournisseurId: '' }
        }
        return { ...item, [field]: value }
      }),
    }))
  }

  const addLine = () => {
    setFormData((current) => ({ ...current, items: [...current.items, createItem()] }))
  }

  const removeLine = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    addMutation.mutate({
      date: formData.date,
      items: formData.items.map((item) => ({
        produitId: Number(item.produitId),
        quantite: Number(item.quantite),
        fournisseurId: Number(formData.fournisseurId),
      })),
      isValidated: formData.isValidated,
    })
  }

  const arrivagesCount = arrivages.length
  const activeSuppliers = fournisseurs.filter((f) => f.actif)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Arrivages</h1>
          <p className="text-beige-600 mt-1">
            Le stock est mis a jour apres validation.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Arrivages" value={arrivagesCount} />
          <InfoCard label="Fournisseurs actifs" value={activeSuppliers.length} />
          <InfoCard label="Total saisie" value={totalQuantite} tone="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6">
        {/* ── Formulaire ── */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <TruckIcon size={20} className="text-beige-600" />
            Enregistrer un arrivage
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            La validation ajoute les quantites au stock calcule. Sinon, le document reste en attente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date + Fournisseur sur la même ligne */}
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
          <label className="block text-sm font-medium text-beige-700 mb-2">Fournisseur</label>
          <select
            value={formData.fournisseurId}
            onChange={(e) => setFormData((c) => ({ ...c, fournisseurId: e.target.value }))}
            required
            className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
          >
            <option value="">-- Choisir un fournisseur --</option>
            {fournisseurs.filter((f) => f.actif).map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lignes produits — produit + quantité uniquement */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-beige-700">
            Produits de l arrivage
          </label>
          <button type="button" onClick={addLine}
            className="text-sm text-beige-700 hover:text-beige-900 flex items-center gap-2">
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>

              {formData.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="grid grid-cols-[1fr_160px_auto] gap-3">
                    <select
                      value={item.produitId}
                      onChange={(e) => handleItemChange(index, 'produitId', e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                    >
                      <option value="">-- Choisir un produit --</option>
                      {produits.map((p) => (
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
                      placeholder="Qte"
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
                </div>
              ))}              
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
                  Valider l arrivage et mettre a jour le stock
                </span>
                <p className="text-xs text-beige-500 mt-0.5">
                  Une fois valide, l arrivage ne peut plus etre modifie.
                </p>
              </div>
            </label>

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
                'Enregistrer l arrivage'
              )}
            </button>
          </form>
        </div>

        {/* ── Historique ── */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des arrivages</h2>
              <p className="text-sm text-beige-600">
                Chaque document garde son statut et ses lignes produits.
              </p>
            </div>
            <span className="text-sm text-beige-500">{arrivages.length} document(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600" />
            </div>
          ) : arrivages.length > 0 ? (
            <ul className="space-y-3 max-h-[40rem] overflow-y-auto pr-1">
              {[...arrivages].reverse().map((arrivage) => (
                <li
                  key={arrivage.id}
                  className="rounded-xl border border-beige-200 bg-beige-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {/* Fournisseurs uniques de l'arrivage */}
                      <p className="font-medium text-beige-900">
                        {arrivage.fournisseurNoms.length > 0
                          ? arrivage.fournisseurNoms.join(', ')
                          : 'Sans fournisseur'}
                      </p>
                      <p className="text-sm text-beige-600 mt-1">
                        {arrivage.items.length} produit(s) | {arrivage.totalQuantite} unite(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!arrivage.isValidated && (
                        <button
                          type="button"
                          onClick={() => validateMutation.mutate(arrivage.id)}
                          disabled={validateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          Valider
                        </button>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          arrivage.isValidated
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {arrivage.isValidated ? 'Valide' : 'En attente'}
                      </span>
                    </div>
                  </div>

                  {/* Détail par ligne avec fournisseur */}
                  <ul className="mt-3 space-y-2">
                    {arrivage.items.map((item) => (
                      <li
                        key={`${arrivage.id}-${item.produitId}`}
                        className="flex items-center justify-between text-sm text-beige-700"
                      >
                        <span className="flex items-center gap-2">
                          <Package size={14} className="text-beige-400" />
                          {item.produitNom}
                          {item.fournisseurNom && item.fournisseurNom !== '-' && (
                            <span className="text-xs text-beige-400">({item.fournisseurNom})</span>
                          )}
                        </span>
                        <span className="font-medium">+{item.quantite}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 text-xs text-beige-400">{arrivage.date}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
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
  }
  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[120px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Arrivages