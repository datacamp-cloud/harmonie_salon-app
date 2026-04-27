import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Wallet } from 'lucide-react'
import { api } from '../api/mock'
import { useToast } from '../context/ToastContext'

function Expenses() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    chargeId: '',
    montant: '',
    notes: '',
  })
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

  const addMutation = useMutation({
    mutationFn: api.addDepense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        chargeId: '',
        montant: '',
        notes: '',
      })
      toast.success('Depense enregistree avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l enregistrement')
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    addMutation.mutate({
      date: formData.date,
      chargeId: Number(formData.chargeId),
      montant: Number(formData.montant),
      notes: formData.notes,
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

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2 flex items-center gap-2">
            <Wallet size={20} className="text-beige-600" />
            Nouvelle depense
          </h2>
          <p className="text-sm text-beige-600 mb-6">
            Associez chaque depense a une charge configuree dans les parametres.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Date + Montant sur la même ligne */}
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

            {/* Charge */}
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
                  <option key={charge.id} value={charge.id}>
                    {charge.nom}
                  </option>
                ))}
              </select>
              {chargesActives.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Aucune charge disponible. Ajoutez-en dans Parametres &gt; Charges.
                </p>
              )}
            </div>

            {/* Notes */}
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

        {/* Historique */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Historique des depenses</h2>
              <p className="text-sm text-beige-600">Visualisez les postes de charges engages.</p>
            </div>
            <span className="text-sm text-beige-400">{depenses.length} depense(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
            </div>
          ) : depenses.length > 0 ? (
            <ul className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
              {[...depenses].reverse().map((depense) => (
                <li key={depense.id} className="rounded-xl border border-beige-200 bg-beige-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-beige-900">{depense.chargeNom}</p>
                      {depense.notes && (
                        <p className="text-sm text-beige-500 mt-0.5">{depense.notes}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-700">
                      {depense.montant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-beige-400">{depense.date}</div>
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