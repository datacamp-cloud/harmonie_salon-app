import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, CheckCircle2, FileDown, Pencil, Plus, Trash2, Wallet, X } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/date'
import ConfirmModal from '../components/ConfirmModal'
import { generateListeDepenses } from '../utils/pdfUtils'

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  chargeId: '',
  montant: '',
  notes: '',
  isValidated: false,
})

function Expenses() {
  const [formData, setFormData] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [confirmValidate, setConfirmValidate] = useState(null)
  const [confirmDelete, setConfirmDelete]     = useState(null)
  const [search, setSearch]                   = useState('')
  const [period, setPeriod]                   = useState('all')
  const [dateDebut, setDateDebut]             = useState('')
  const [dateFin, setDateFin]                 = useState('')
  const [listeResultats, setListeResultats]   = useState(null)
  const [loadingPdf, setLoadingPdf]           = useState(false)
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: depenses = [], isLoading } = useQuery({
    queryKey: ['depenses'],
    queryFn: api.getDepenses,
  })

  const { data: charges = [] } = useQuery({
    queryKey: ['charges'],
    queryFn: api.getCharges,
  })

  const chargesActives = charges.filter((c) => c.actif)

  const totalMois = useMemo(
    () =>
      depenses
        .filter((d) => d.date.startsWith(new Date().toISOString().slice(0, 7)))
        .reduce((t, d) => t + d.montant, 0),
    [depenses],
  )

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['depenses'] })
    queryClient.invalidateQueries({ queryKey: ['historique'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })
  }

  const addMutation = useMutation({
    mutationFn: api.addDepense,
    onSuccess: () => {
      invalidate()
      setFormData(emptyForm())
      toast.success('Depense enregistree avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur lors de l enregistrement'),
  })

  const updateMutation = useMutation({
    mutationFn: api.updateDepense,
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      setFormData(emptyForm())
      toast.success('Depense modifiee avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur modification'),
  })

  const validateMutation = useMutation({
    mutationFn: api.validateDepense,
    onSuccess: () => {
      invalidate()
      toast.success('Depense validee avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur validation'),
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteDepense,
    onSuccess: () => { invalidate(); toast.success('Depense supprimee') },
    onError: (error) => toast.error(error.message || 'Erreur suppression'),
  })

  const handleEdit = (depense) => {
    setEditingId(depense.id)
    setFormData({
      date: depense.date,
      chargeId: String(depense.chargeId),
      montant: String(depense.montant),
      notes: depense.notes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData(emptyForm())
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      date: formData.date,
      chargeId: Number(formData.chargeId),
      montant: Number(formData.montant),
      notes: formData.notes,
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload })
    } else {
      addMutation.mutate({ ...payload, isValidated: formData.isValidated ?? false })
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending

  const filteredDepenses = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const week  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const month = new Date().toISOString().slice(0, 7)
    return [...depenses]
      .filter((d) => {
        const matchSearch = !search ||
          d.chargeNom?.toLowerCase().includes(search.toLowerCase()) ||
          d.notes?.toLowerCase().includes(search.toLowerCase())
        const matchPeriod =
          period === 'all' ||
          (period === 'today' && d.date === today) ||
          (period === 'week'  && d.date >= week) ||
          (period === 'month' && d.date.startsWith(month))
        return matchSearch && matchPeriod
      })
      .reverse()
  }, [depenses, search, period])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-beige-900">Depenses</h1>
            <p className="text-beige-600 mt-1">Suivez les sorties de caisse liees au fonctionnement du salon.</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs text-beige-500 mb-1">Du</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                className="px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
            </div>
            <div>
              <label className="block text-xs text-beige-500 mb-1">Au</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                className="px-3 py-2 text-sm border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-beige-300" />
            </div>
            <button type="button" disabled={loadingPdf}
              onClick={async () => {
                if (!dateDebut || !dateFin) return toast.error('Selectionnez une periode')
                const results = depenses.filter((d) => d.date >= dateDebut && d.date <= dateFin)
                if (results.length === 0) return toast.error('Aucune depense sur cette periode')
                setLoadingPdf(true)
                try { await generateListeDepenses(results, dateDebut, dateFin) }
                catch { toast.error('Erreur PDF') }
                finally { setLoadingPdf(false) }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-beige-900 text-white text-sm rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50">
              <FileDown size={14} /> {loadingPdf ? 'Generation...' : 'Visualiser'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoCard label="Depenses du mois" value={`${totalMois.toLocaleString('fr-FR')} FCFA`} />
            <InfoCard label="Total depenses" value={depenses.length} tone="warning" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <Wallet size={20} className="text-beige-600" />
            {editingId ? 'Modifier la depense' : 'Nouvelle depense'}
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Associez chaque depense a une charge configuree dans les parametres.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-beige-700 mb-2">Montant (FCFA)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.montant}
                  onChange={(e) => setFormData((c) => ({ ...c, montant: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Charge</label>
              <select
                value={formData.chargeId}
                onChange={(e) => setFormData((c) => ({ ...c, chargeId: e.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
              >
                <option value="">-- Selectionnez une charge --</option>
                {chargesActives.map((charge) => (
                  <option key={charge.id} value={charge.id}>{charge.nom}</option>
                ))}
              </select>
              {chargesActives.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Aucune charge disponible. Ajoutez-en dans Parametres &gt; Charges.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">
                Notes <span className="text-beige-400 font-normal">(optionnel)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((c) => ({ ...c, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none resize-none"
                placeholder="Observation..."
              />
            </div>

            {!editingId && (
              <label className="flex items-center gap-3 rounded-lg border border-beige-200 bg-beige-50 px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isValidated ?? false}
                  onChange={(e) => setFormData((c) => ({ ...c, isValidated: e.target.checked }))}
                  className="rounded border-beige-300"
                />
                <div>
                  <span className="text-sm font-medium text-beige-800">Valider et comptabiliser la depense</span>
                  <p className="text-xs text-beige-500 mt-0.5">Une fois validee, la depense ne peut plus etre modifiee.</p>
                </div>
              </label>
            )}

            <div className="flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
                ) : (
                  <><Plus size={18} />{editingId ? 'Enregistrer les modifications' : 'Enregistrer la depense'}</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des depenses</h2>
              <p className="text-sm text-beige-600">Visualisez les postes de charges engages.</p>
            </div>
            <span className="text-sm text-beige-400">{filteredDepenses.length}/{depenses.length}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input type="text" placeholder="Rechercher charge ou note..."
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
          ) : depenses.length > 0 ? (
            <ul className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
              {filteredDepenses.map((depense) => (
                <li key={depense.id} className={`rounded-xl border p-5 transition-colors ${editingId === depense.id ? 'border-beige-400 bg-beige-100' : 'border-beige-200 bg-beige-50'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{depense.chargeNom}</p>
                      {depense.notes && (
                        <p className="text-sm text-beige-500 mt-0.5">{depense.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!depense.isValidated && (
                        <button type="button" onClick={() => handleEdit(depense)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-beige-700 text-xs hover:bg-white transition-colors">
                          <Pencil size={13} /> Modifier
                        </button>
                      )}
                      {!depense.isValidated && (
                        <button type="button" onClick={() => setConfirmDelete(depense.id)}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors disabled:opacity-50">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      )}
                      {!depense.isValidated && (
                        <button type="button" onClick={() => setConfirmValidate(depense.id)}
                          disabled={validateMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                          <CheckCircle2 size={13} /> Valider
                        </button>
                      )}
                      
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="font-semibold text-beige-900">
                        {depense.montant.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        depense.isValidated ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {depense.isValidated ? 'Validee' : 'En attente'}
                      </span>
                  </div>
                  <div className="mt-2 text-xs text-beige-400">{formatDate(depense.date)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-beige-500">Aucune depense enregistree</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmValidate !== null}
        onCancel={() => setConfirmValidate(null)}
        onConfirm={() => { validateMutation.mutate(confirmValidate); setConfirmValidate(null) }}
        isPending={validateMutation.isPending}
        title="Valider la depense ?"
        message="Cette action est irreversible. Une fois validee, la depense sera comptabilisee et ne pourra plus etre modifiee."
      />
      <ConfirmModal
        isOpen={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { deleteMutation.mutate(confirmDelete); setConfirmDelete(null) }}
        isPending={deleteMutation.isPending}
        title="Supprimer cette depense ?"
        message="La depense sera archivee. Cette action est irreversible."
      />
    </div>
  )
}

function InfoCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[130px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Expenses
