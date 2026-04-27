import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers, Loader2, Plus, Power } from 'lucide-react'
import { api } from '../../api/mock'
import { useToast } from '../../context/ToastContext'

function Charges() {
  const [nom, setNom] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: charges = [], isLoading } = useQuery({
    queryKey: ['charges'],
    queryFn: api.getCharges,
  })

  const addMutation = useMutation({
    mutationFn: api.addCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      setNom('')
      toast.success('Charge ajoutee avec succes')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l ajout')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: api.toggleChargeActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Statut mis a jour')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addMutation.mutate({ nom })
  }

  const actives = charges.filter((c) => c.actif).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-beige-900">Charges</h1>
        <p className="text-beige-600 mt-1">
          Definissez les categories de depenses utilisees dans le module Depenses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm max-w-xs">
        <InfoCard label="Total" value={charges.length} />
        <InfoCard label="Actives" value={actives} tone="success" />
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl border border-beige-200 p-6">
        <h2 className="text-base font-semibold text-beige-900 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-beige-500" />
          Ajouter une charge
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
            placeholder="Ex: Loyer, Salaires, Entretien..."
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="px-5 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {addMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
          </div>
        ) : charges.length > 0 ? (
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">Charge</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-beige-900">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-beige-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {charges.map((charge) => (
                <tr key={charge.id} className="hover:bg-beige-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-beige-100 rounded-lg flex items-center justify-center">
                        <Layers size={15} className="text-beige-500" />
                      </div>
                      <span className="font-medium text-beige-900">{charge.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        charge.actif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {charge.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(charge.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-beige-50 transition-colors text-sm"
                    >
                      <Power size={14} />
                      {charge.actif ? 'Desactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <Layers size={40} className="mx-auto text-beige-300 mb-3" />
            <p className="text-beige-500">Aucune charge configuree</p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-beige-200 text-beige-900',
    success: 'bg-green-50 border-green-200 text-green-800',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

export default Charges