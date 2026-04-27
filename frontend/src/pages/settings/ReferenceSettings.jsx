import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Power, Tags } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

function ReferenceSettings({
  title,
  description,
  queryKey,
  queryFn,
  addMutationFn,
  toggleMutationFn,
  emptyLabel,
  extraField,
  addLabel = 'Ajouter',
}) {
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
  })
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn,
  })

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey })
  }

  const addMutation = useMutation({
    mutationFn: addMutationFn,
    onSuccess: () => {
      invalidateData()
      setFormData({ nom: '', prix: '' })
      toast.success(`${title.slice(0, -1)} ajoute avec succes`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de l ajout')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleMutationFn,
    onSuccess: () => {
      invalidateData()
      toast.success('Statut mis a jour')
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la mise a jour')
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    addMutation.mutate({
      nom: formData.nom,
      prix: formData.prix,
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-beige-900">{title}</h1>
          <p className="text-beige-600 mt-1">{description}</p>
        </div>
        <div className="rounded-lg border border-beige-200 bg-white px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-beige-500">Elements actifs</p>
          <p className="text-xl font-semibold text-beige-900">
            {data.filter((item) => item.actif).length}/{data.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-semibold text-beige-900 mb-2">{addLabel}</h2>
          {/* <p className="text-sm text-beige-600 mb-6">
            Les parametres actifs sont disponibles partout dans les formulaires.
          </p> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              {/* <label className="block text-sm font-medium text-beige-700 mb-2">
                Libelle
              </label> */}
              <input
                type="text"
                value={formData.nom}
                onChange={(event) => setFormData((current) => ({ ...current, nom: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                // placeholder="Saisir un libelle"
              />
            </div>

            {extraField?.type === 'price' && (
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Prix indicatif
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.prix}
                  onChange={(event) => setFormData((current) => ({ ...current, prix: event.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="0"
                />
              </div>
            )}

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
                  Ajouter
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-beige-900">Liste</h2>
              <p className="text-sm text-beige-600">Activez ou desactivez selon l usage reel.</p>
            </div>
            <span className="text-sm text-beige-500">{data.length} element(s)</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-600"></div>
            </div>
          ) : data.length > 0 ? (
            <ul className="space-y-3">
              {data.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-beige-200 bg-beige-50 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-beige-700">
                      <Tags size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-beige-900">{item.nom}</p>
                      {typeof item.prix === 'number' && (
                        <p className="text-sm text-beige-600">{item.prix.toLocaleString('fr-FR')} FCFA</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.actif
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate(item.id)}
                      className="px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors flex items-center gap-2"
                    >
                      <Power size={16} />
                      {item.actif ? 'Desactiver' : 'Activer'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-beige-600">{emptyLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReferenceSettings
