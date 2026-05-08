import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Package, Pencil, Plus, Power, Tag, Trash2, X, FileDown } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from '../../components/ConfirmModal'
import { generateEtatStock } from '../../utils/pdfUtils'

function Products() {
  const [showForm, setShowForm] = useState(false)
  const [editModal, setEditModal] = useState(null) // null ou le produit à modifier
  const [formData, setFormData] = useState({ nom: '', typeId: '', prix: '', actif: true })
  const [editData, setEditData] = useState({ nom: '', typeId: '', prix: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [dateStock, setDateStock]   = useState(new Date().toISOString().slice(0, 10))
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: produits = [], isLoading } = useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })

  const { data: typesProduits = [] } = useQuery({
    queryKey: ['types-produits'],
    queryFn: api.getTypesProduits,
  })

  const { data: arrivages  = [] } = useQuery({ queryKey: ['arrivages'],  queryFn: api.getArrivages })
  const { data: ventes     = [] } = useQuery({ queryKey: ['ventes'],     queryFn: api.getVentes })
  const { data: inventaires = [] } = useQuery({ queryKey: ['inventaires'], queryFn: api.getInventaires })

  // Calcul du stock de chaque produit à la date choisie
  const produitsAtDate = useMemo(() => {
    return produits.map((p) => {
      const entrees = arrivages
        .filter((a) => a.isValidated && a.date <= dateStock)
        .flatMap((a) => a.items || [])
        .filter((i) => i.produitId === p.id)
        .reduce((t, i) => t + i.quantite, 0)

      const sorties = ventes
        .filter((v) => v.isValidated && v.date <= dateStock)
        .flatMap((v) => v.items || [])
        .filter((i) => i.produitId === p.id)
        .reduce((t, i) => t + i.quantite, 0)

      const ecarts = inventaires
        .filter((inv) => inv.isValidated && inv.date <= dateStock && inv.produitId === p.id)
        .reduce((t, inv) => t + inv.ecart, 0)

      return { ...p, stock: entrees - sorties + ecarts }
    })
  }, [produits, arrivages, ventes, inventaires, dateStock])

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['produits'] })
    queryClient.invalidateQueries({ queryKey: ['historique'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
  }

  const addMutation = useMutation({
    mutationFn: api.addProduit,
    onSuccess: () => {
      invalidateData()
      setShowForm(false)
      setFormData({ nom: '', typeId: '', prix: '', actif: true })
      toast.success('Produit ajoute avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l ajout du produit')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteProduit,
    onSuccess: () => {
      invalidateData()
      setConfirmDelete(null)
      toast.success('Produit supprime')
    },
    onError: (error) => toast.error(error.message || 'Erreur suppression'),
  })

  const toggleMutation = useMutation({
    mutationFn: api.toggleProduitActif,
    onSuccess: () => {
      invalidateData()
      toast.success('Statut du produit mis a jour')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise a jour')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.updateProduit ?? (() => Promise.resolve()),
    onSuccess: () => {
      invalidateData()
      setEditModal(null)
      toast.success('Produit modifie avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur modification'),
  })

  const activeTypes = typesProduits.filter((type) => type.actif)
  const activeProducts = produits.filter((produit) => produit.actif)

  const handleSubmit = (event) => {
    event.preventDefault()

    addMutation.mutate({
      nom: formData.nom,
      typeId: Number(formData.typeId),
      prix: Number(formData.prix || 0),
      actif: formData.actif,
    })
  }

  const handleEditSubmit = (event) => {
    event.preventDefault()
    updateMutation.mutate({
      id: editModal.id,
      nom: editData.nom,
      typeId: Number(editData.typeId),
      prix: Number(editData.prix || 0),
    })
  }

  const openEditModal = (produit) => {
    setEditData({ nom: produit.nom, typeId: String(produit.typeId), prix: String(produit.prix) })
    setEditModal(produit)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Produits</h1>
          <p className="text-beige-600 mt-1">
            Enregistrez vos différents produits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <KpiCard label="Produits actifs" value={activeProducts.length} />
          <KpiCard label="Stock faible" value={produits.filter((produit) => produit.stock <= 5).length} tone="warning" />
          <div>
            <label className="block text-xs text-beige-500 mb-1">Etat de stock au</label>
            <input type="date" value={dateStock} onChange={(e) => setDateStock(e.target.value)}
              className="px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
          </div>
          <button type="button" disabled={loadingPdf || produits.length === 0}
            onClick={async () => {
              setLoadingPdf(true)
              try { await generateEtatStock(produitsAtDate, dateStock) }
              catch { toast.error('Erreur PDF') }
              finally { setLoadingPdf(false) }
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors disabled:opacity-40 text-sm">
            <FileDown size={16} />
            {loadingPdf ? 'Generation...' : 'Etat de stock'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors"
          >
            <Plus size={20} />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Modal d'édition */}
      {editModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-beige-900">Modifier le produit</h2>
              <button type="button" onClick={() => setEditModal(null)}
                className="p-2 text-beige-500 hover:text-beige-700 hover:bg-beige-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Libelle</label>
                <input type="text" value={editData.nom}
                  onChange={(e) => setEditData((c) => ({ ...c, nom: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Type de produit</label>
                <select value={editData.typeId}
                  onChange={(e) => setEditData((c) => ({ ...c, typeId: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white">
                  <option value="">-- Choisir un type --</option>
                  {typesProduits.map((type) => (
                    <option key={type.id} value={type.id}>{type.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Prix unitaire (FCFA)</label>
                <input type="number" min="0" value={editData.prix}
                  onChange={(e) => setEditData((c) => ({ ...c, prix: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {updateMutation.isPending ? <><Loader2 size={18} className="animate-spin" /> Modification...</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-beige-900">Nouveau produit</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-beige-500 hover:text-beige-700 hover:bg-beige-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Libelle</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(event) => setFormData((current) => ({ ...current, nom: event.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="Ex: Shampooing hydratant"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Type de produit</label>
                <select
                  value={formData.typeId}
                  onChange={(event) => setFormData((current) => ({ ...current, typeId: event.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                >
                  <option value="">-- Choisir un type --</option>
                  {activeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Prix unitaire</label>
                <input
                  type="number"
                  min="0"
                  value={formData.prix}
                  onChange={(event) => setFormData((current) => ({ ...current, prix: event.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(event) => setFormData((current) => ({ ...current, actif: event.target.checked }))}
                  className="rounded border-beige-300"
                />
                <span className="text-sm text-beige-800">Produit actif a la creation</span>
              </label>

              <div className="flex gap-3 pt-2">
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
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-beige-600"></div>
          </div>
        ) : produits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="bg-beige-50 border-b border-beige-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">Produit</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">Type</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">Stock calcule</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">Prix</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-beige-900">Statut</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">Action</th>
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
                        <div>
                          <p className="font-medium text-beige-900">{produit.nom}</p>
                          <p className="text-xs text-beige-500">Reference #{produit.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beige-100 text-beige-700 text-sm">
                        <Tag size={14} />
                        {produit.typeNom}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StockBadge stock={produit.stock} />
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-beige-900">
                      {produit.prix.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          produit.actif
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {produit.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button" 
                          onClick={() => openEditModal(produit)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors">
                          <Pencil size={16} />
                          
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(produit.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors"
                        >
                          <Power size={16} />
                          {/* {produit.actif ? 'Desactiver' : 'Activer'} */}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setConfirmDelete(produit.id)}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Package size={48} className="mx-auto text-beige-300 mb-4" />
            <p className="text-beige-600">Aucun produit enregistre</p>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { deleteMutation.mutate(confirmDelete); setConfirmDelete(null) }}
        isPending={deleteMutation.isPending}
        title="Supprimer ce produit ?"
        message="Le produit sera archive. Cette action est irreversible."
      />
    </div>
  )
}

function KpiCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  }

  return (
    <div className={`rounded-lg border px-4 py-3 min-w-[130px] ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}

function StockBadge({ stock }) {
  const tone =
    stock <= 0
      ? 'bg-red-100 text-red-700'
      : stock <= 5
        ? 'bg-amber-100 text-amber-800'
        : 'bg-green-100 text-green-700'

  return <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${tone}`}>{stock}</span>
}

export default Products
