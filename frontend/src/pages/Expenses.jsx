import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Wallet } from 'lucide-react'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'

function Expenses() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    libelle: '',
    montant: '',
    fournisseurId: '',
    prestationId: '',
    notes: '',
  })
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: depenses = [], isLoading } = useQuery({
    queryKey: ['depenses'],
    queryFn: api.getDepenses,
  })

  const { data: fournisseurs = [] } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: api.getFournisseurs,
  })

  const { data: prestations = [] } = useQuery({
    queryKey: ['prestations'],
    queryFn: api.getPrestations,
  })

  const totalMois = useMemo(
    () =>
      depenses
        .filter((depense) => depense.date.startsWith(new Date().toISOString().slice(0, 7)))
        .reduce((total, depense) => total + depense.montant, 0),
    [depenses],
  )

  const addMutation = useMutation({
    mutationFn: api.addDepense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        libelle: '',
        montant: '',
        fournisseurId: '',
        prestationId: '',
        notes: '',
      })
      toast.success('Depense enregistree avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement de la depense')
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    addMutation.mutate({
      ...formData,
      montant: Number(formData.montant),
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">Depenses</h1>
          <p className="text-beige-600 mt-1">
            Suivez les sorties de caisse liees au fonctionnement du salon.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoCard label="Depenses du mois" value={`${totalMois.toLocaleString('fr-FR')} FCFA`} />
          <InfoCard label="Total depenses" value={depenses.length} tone="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <Wallet size={20} className="text-beige-600" />
            Nouvelle depense
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Rattachez une depense a un fournisseur ou a une prestation quand c est utile.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-beige-700 mb-2">Montant</label>
                <input
                  type="number"
                  min="0"
                  value={formData.montant}
                  onChange={(event) => setFormData((current) => ({ ...current, montant: event.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Libelle</label>
              <input
                type="text"
                value={formData.libelle}
                onChange={(event) => setFormData((current) => ({ ...current, libelle: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder="Ex: Achat gants, entretien sechoir..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Fournisseur</label>
                <select
                  value={formData.fournisseurId}
                  onChange={(event) => setFormData((current) => ({ ...current, fournisseurId: event.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                >
                  <option value="">-- Aucun --</option>
                  {fournisseurs.filter((item) => item.actif).map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">Prestation</label>
                <select
                  value={formData.prestationId}
                  onChange={(event) => setFormData((current) => ({ ...current, prestationId: event.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none bg-white"
                >
                  <option value="">-- Aucune --</option>
                  {prestations.filter((item) => item.actif).map((prestation) => (
                    <option key={prestation.id} value={prestation.id}>
                      {prestation.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-beige-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none resize-none"
                placeholder="Observation optionnelle"
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
                <>
                  <Plus size={18} />
                  Enregistrer la depense
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des depenses</h2>
              <p className="text-sm text-beige-600">Visualisez rapidement les postes engages.</p>
            </div>
            <span className="text-sm text-beige-500">{depenses.length} depense(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : depenses.length > 0 ? (
            <ul className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
              {[...depenses].reverse().map((depense) => (
                <li key={depense.id} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{depense.libelle}</p>
                      <p className="text-sm text-beige-600 mt-1">
                        Fournisseur: {depense.fournisseurNom} | Prestation: {depense.prestationNom}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                      {depense.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  {depense.notes && (
                    <p className="mt-3 text-sm text-beige-700">{depense.notes}</p>
                  )}
                  <div className="mt-3 text-xs text-beige-500">{depense.date}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-beige-600">Aucune depense enregistree</p>
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
    <div className={`rounded-lg border px-3 py-2 min-w-[130px] ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Expenses
