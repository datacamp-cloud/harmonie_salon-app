import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, CheckCircle2, FileDown, Receipt, Trash2, X } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/date'
import ConfirmModal from '../components/ConfirmModal'
import { generateRecuRecette } from '../utils/pdfUtils'

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  clientId: '',
  prestationId: '',
  prixApplique: '',
  notes: '',
  isValidated: false,
})

function Income() {
  const [formData, setFormData] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [confirmValidate, setConfirmValidate] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('all')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: prestations = [] } = useQuery({ queryKey: ['prestations'], queryFn: api.getPrestations })
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: api.getClients })
  const { data: recettes = [], isLoading } = useQuery({ queryKey: ['recettes'], queryFn: api.getRecettes })

  const prestationsActives = prestations.filter((p) => p.actif)

  const handlePrestationChange = (prestationId) => {
    const prestation = prestations.find((p) => p.id === Number(prestationId))
    setFormData((c) => ({ ...c, prestationId, prixApplique: prestation ? String(prestation.prix) : '' }))
  }

  const totalMois = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7)
    return recettes.filter((r) => r.isValidated && r.date.startsWith(month)).reduce((t, r) => t + r.prixApplique, 0)
  }, [recettes])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['recettes'] })
    queryClient.invalidateQueries({ queryKey: ['historique'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
  }

  const addMutation = useMutation({
    mutationFn: api.addRecette,
    onSuccess: () => { invalidate(); setFormData(emptyForm()); toast.success('Recette enregistree avec succes') },
    onError: (error) => toast.error(error.message || 'Erreur lors de l enregistrement'),
  })

  const updateMutation = useMutation({
    mutationFn: api.updateRecette,
    onSuccess: () => { invalidate(); setEditingId(null); setFormData(emptyForm()); toast.success('Recette modifiee avec succes') },
    onError: (error) => toast.error(error.message || 'Erreur modification'),
  })

  const validateMutation = useMutation({
    mutationFn: api.validateRecette,
    onSuccess: () => { invalidate(); toast.success('Recette validee avec succes') },
    onError: (error) => toast.error(error.message || 'Erreur lors de la validation'),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteRecette,
    onSuccess: () => { invalidate(); toast.success('Recette supprimee') },
    onError: (error) => toast.error(error.message || 'Erreur suppression'),
  })

  const handleEdit = (recette) => {
    setEditingId(recette.id)
    setFormData({
      date: recette.date,
      clientId: recette.clientId ? String(recette.clientId) : '',
      prestationId: String(recette.prestationId),
      prixApplique: String(recette.prixApplique),
      notes: recette.notes || '',
      isValidated: false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => { setEditingId(null); setFormData(emptyForm()) }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      date: formData.date,
      clientId: formData.clientId ? Number(formData.clientId) : null,
      prestationId: Number(formData.prestationId),
      prixApplique: Number(formData.prixApplique),
      notes: formData.notes,
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload })
    } else {
      addMutation.mutate({ ...payload, isValidated: formData.isValidated })
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending
  const recettesValidees = recettes.filter((r) => r.isValidated).length

  const filteredRecettes = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const week  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const month = new Date().toISOString().slice(0, 7)
    return [...recettes]
      .filter((r) => {
        const matchSearch = !search ||
          r.prestationNom?.toLowerCase().includes(search.toLowerCase()) ||
          r.clientNom?.toLowerCase().includes(search.toLowerCase())
        const matchPeriod =
          period === 'all' ||
          (period === 'today' && r.date === today) ||
          (period === 'week'  && r.date >= week) ||
          (period === 'month' && r.date.startsWith(month))
        return matchSearch && matchPeriod
      })
      .reverse()
  }, [recettes, search, period])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Recettes</h1>
          <p className="text-beige-600 mt-1">Enregistrez les prestations realisees et leur montant encaisse.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <InfoCard label="Total recettes" value={recettes.length} />
          <InfoCard label="Validees" value={recettesValidees} tone="success" />
          <InfoCard label="CA prestations/mois" value={`${totalMois.toLocaleString('fr-FR')} FCFA`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-6">

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <Receipt size={20} className="text-beige-600" />
            {editingId ? 'Modifier la recette' : 'Nouvelle recette'}
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Le prix est pre-rempli depuis le tarif de la prestation. Modifiez-le si besoin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Date</label>
                <input type="date" value={formData.date}
                  onChange={(e) => setFormData((c) => ({ ...c, date: e.target.value }))}
                  required className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Client <span className="text-beige-400 font-normal">(optionnel)</span>
                </label>
                <select value={formData.clientId}
                  onChange={(e) => setFormData((c) => ({ ...c, clientId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white">
                  <option value="">-- Client anonyme --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Prestation</label>
              <select value={formData.prestationId} onChange={(e) => handlePrestationChange(e.target.value)}
                required className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white">
                <option value="">-- Choisir une prestation --</option>
                {prestationsActives.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom} — {p.prix.toLocaleString('fr-FR')} FCFA</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Prix encaisse (FCFA)</label>
              <input type="number" min="0" value={formData.prixApplique}
                onChange={(e) => setFormData((c) => ({ ...c, prixApplique: e.target.value }))}
                required className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="0" />
              {formData.prestationId && formData.prixApplique && (() => {
                const prestation = prestations.find((p) => p.id === Number(formData.prestationId))
                if (!prestation) return null
                const diff = Number(formData.prixApplique) - prestation.prix
                if (diff === 0) return null
                return (
                  <p className={`text-xs mt-1 ${diff > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                    {diff > 0 ? '+' : ''}{diff.toLocaleString('fr-FR')} FCFA par rapport au tarif ({prestation.prix.toLocaleString('fr-FR')} FCFA)
                  </p>
                )
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Notes <span className="text-beige-400 font-normal">(optionnel)</span>
              </label>
              <textarea value={formData.notes}
                onChange={(e) => setFormData((c) => ({ ...c, notes: e.target.value }))}
                rows={2} placeholder="Observation..."
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none resize-none" />
            </div>

            {/* Validation — masquée en mode édition */}
            {!editingId && (
              <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3 cursor-pointer">
                <input type="checkbox" checked={formData.isValidated}
                  onChange={(e) => setFormData((c) => ({ ...c, isValidated: e.target.checked }))}
                  className="rounded border-beige-300" />
                <div>
                  <span className="text-sm font-medium text-beige-800">Valider et comptabiliser dans la caisse</span>
                  <p className="text-xs text-beige-500 mt-0.5">Une fois validee, la recette ne peut plus etre modifiee.</p>
                </div>
              </label>
            )}

            <div className="flex gap-3">
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors flex items-center justify-center gap-2">
                  <X size={18} /> Annuler
                </button>
              )}
              <button type="submit" disabled={isPending}
                className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isPending ? <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
                  : <><Plus size={18} />{editingId ? 'Enregistrer les modifications' : 'Enregistrer la recette'}</>}
              </button>
            </div>
          </form>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des recettes</h2>
              <p className="text-sm text-beige-600">Prestations realisees et montants encaisses.</p>
            </div>
            <span className="text-sm text-beige-400">{filteredRecettes.length}/{recettes.length}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input type="text" placeholder="Rechercher prestation ou client..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-beige-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-beige-300">
              <option value="all">Toute la periode</option>
              <option value="today">Aujourd hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">Ce mois</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
            </div>
          ) : recettes.length > 0 ? (
            <ul className="space-y-3 max-h-[42rem] overflow-y-auto pr-1">
              {filteredRecettes.map((recette) => (
                <li key={recette.id} className={`rounded-xl border p-4 transition-colors ${editingId === recette.id ? 'border-beige-400 bg-beige-100' : 'border-beige-200 bg-beige-50'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{recette.prestationNom}</p>
                      <p className="text-sm text-beige-500 mt-0.5">{recette.clientNom || 'Client anonyme'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {recette.isValidated && (
                        <button type="button" onClick={() => generateRecuRecette(recette)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-beige-700 text-xs hover:bg-white transition-colors">
                          <FileDown size={13} /> Reçu
                        </button>
                      )}
                      {!recette.isValidated && (
                        <button type="button" onClick={() => handleEdit(recette)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-beige-700 text-xs hover:bg-white transition-colors">
                          <Pencil size={13} /> Modifier
                        </button>
                      )}
                      {!recette.isValidated && (
                        <button type="button" onClick={() => setConfirmDelete(recette.id)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors disabled:opacity-50">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      )}
                      {!recette.isValidated && (
                        <button type="button" onClick={() => setConfirmValidate(recette.id)}
                          disabled={validateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                          <CheckCircle2 size={13} /> Valider
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${recette.isValidated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                          {recette.isValidated ? 'Validee' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {recette.prixApplique !== recette.prixReference && (
                    <p className={`text-xs mt-2 ${recette.prixApplique > recette.prixReference ? 'text-green-600' : 'text-amber-600'}`}>
                      Tarif de reference : {recette.prixReference.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                  <span className="font-semibold text-beige-900">{recette.prixApplique.toLocaleString('fr-FR')} FCFA</span>
                  {recette.notes && <p className="text-xs text-beige-500 mt-2">{recette.notes}</p>}
                  <div className="mt-2 text-xs text-beige-400">{formatDate(recette.date)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <Receipt size={40} className="mx-auto text-beige-300 mb-3" />
              <p className="text-beige-500">Aucune recette enregistree</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmValidate !== null}
        onCancel={() => setConfirmValidate(null)}
        onConfirm={() => { validateMutation.mutate(confirmValidate); setConfirmValidate(null) }}
        isPending={validateMutation.isPending}
        title="Valider la recette ?"
        message="Cette action est irreversible. Une fois validee, la recette sera comptabilisee dans la caisse et ne pourra plus etre modifiee."
      />
      <ConfirmModal
        isOpen={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { deleteMutation.mutate(confirmDelete); setConfirmDelete(null) }}
        isPending={deleteMutation.isPending}
        title="Supprimer cette recette ?"
        message="La recette sera archivee. Cette action est irreversible."
      />
    </div>
  )
}

function InfoCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    success: 'bg-green-50 border-green-200 text-green-800',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[120px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Income
