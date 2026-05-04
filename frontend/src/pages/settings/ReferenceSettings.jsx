import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Power, Tags, Trash2, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from '../../components/ConfirmModal'

function ReferenceSettings({
  title,
  description,
  queryKey,
  queryFn,
  addMutationFn,
  updateMutationFn = null,
  deleteMutationFn = null,
  toggleMutationFn = null,
  emptyLabel,
  extraField,
  addLabel = 'Ajouter',
  nomPlaceholder= 'Saisir un libelle',
}) {
  const [formData, setFormData] = useState({ nom: '', prix: '', localisation: '' })
  const [editingId, setEditingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
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
      setEditingId(null)
      toast.success(`${title.slice(0, -1)} ajoute avec succes`)
    },
    onError: (error) => toast.error(error.message || 'Erreur lors de l ajout'),
  })

  const updateMutation = useMutation({
    mutationFn: updateMutationFn ?? (() => Promise.resolve()),
    onSuccess: () => {
      invalidateData()
      setFormData({ nom: '', prix: '' })
      setEditingId(null)
      toast.success('Modifie avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur modification'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMutationFn ?? (() => Promise.resolve()),
    onSuccess: () => {
      invalidateData()
      setConfirmDeleteId(null)
      toast.success('Supprime avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur suppression'),
  })

  const handleEdit = (item) => {
    setEditingId(item.id)
    setFormData({ nom: item.nom, prix: item.prix ?? item.telephone ?? '', localisation: item.localisation ?? '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ nom: '', prix: '', localisation: '' })
  }

  const toggleMutation = useMutation({
    mutationFn: toggleMutationFn ?? (() => Promise.resolve()),
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
    if (editingId && updateMutationFn) {
      updateMutation.mutate({ id: editingId, nom: formData.nom, prix: formData.prix, localisation: formData.localisation })
    } else {
      addMutation.mutate({ nom: formData.nom, prix: formData.prix, localisation: formData.localisation })
    }
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
          <h2 className="text-lg font-semibold text-beige-900 mb-2">{editingId ? 'Modifier' : addLabel}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={formData.nom}
                onChange={(event) => setFormData((current) => ({ ...current, nom: event.target.value }))}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                placeholder={nomPlaceholder}
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

            {extraField?.type === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Telephone <span className="text-beige-400 font-normal">(Facultatif)</span>
                </label>
                <input
                  type="tel"
                  value={formData.prix}
                  onChange={(event) => {
                    // Formatage automatique CI : XX XX XX XX XX
                    let val = event.target.value.replace(/\D/g, '').slice(0, 10)
                    val = val.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
                    setFormData((current) => ({ ...current, prix: val }))
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="Ex: 07 00 11 22 33"
                />
              </div>
            )}

            {(extraField?.type === 'phone' || extraField?.withLocalisation) && (
              <div>
                <label className="block text-sm font-medium text-beige-700 mb-2">
                  Localisation <span className="text-beige-400 font-normal">(Facultatif)</span>
                </label>
                <input
                  type="text"
                  value={formData.localisation}
                  onChange={(event) => setFormData((current) => ({ ...current, localisation: event.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none"
                  placeholder="Ex: Abidjan Cocody"
                />
              </div>
            )}

            <div className="flex gap-2">
              {editingId && (
                <button type="button" onClick={handleCancelEdit}
                  className="flex-1 px-4 py-3 border border-beige-300 text-beige-700 rounded-lg hover:bg-beige-50 transition-colors flex items-center justify-center gap-2">
                  <X size={18} /> Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={addMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-3 bg-beige-900 text-white rounded-lg hover:bg-beige-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(addMutation.isPending || updateMutation.isPending) ? (
                  <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
                ) : (
                  <><Plus size={18} />{editingId ? 'Enregistrer' : 'Ajouter'}</>
                )}
              </button>
            </div>
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
                      {item.telephone != null && item.telephone !== '' && (
                        <p className="text-sm text-beige-600">{item.telephone}</p>
                      )}
                      {item.localisation != null && item.localisation !== '' && (
                        <p className="text-sm text-beige-500">{item.localisation}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {toggleMutationFn && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.actif ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.actif ? 'Actif' : 'Inactif'}
                      </span>
                    )}
                    {updateMutationFn && (
                      <button type="button" onClick={() => handleEdit(item)}
                        className="px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors flex items-center gap-2">
                        <Pencil size={16} />
                      </button>
                    )}
                    {toggleMutationFn && (
                      <button type="button" onClick={() => toggleMutation.mutate(item.id)}
                        className="px-3 py-2 rounded-lg border border-beige-300 text-beige-700 hover:bg-white transition-colors flex items-center gap-2">
                        <Power size={16} />
                        {/* {item.actif ? 'Desactiver' : 'Activer'} */}
                      </button>
                    )}
                    {deleteMutationFn && (
                      <button type="button" onClick={() => setConfirmDeleteId(item.id)}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <Trash2 size={16} />
                      </button>
                    )}
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

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => { deleteMutation.mutate(confirmDeleteId); setConfirmDeleteId(null) }}
        isPending={deleteMutation.isPending}
        title="Supprimer cet element ?"
        message="Cette action est irreversible. L element sera archive mais ne sera plus accessible dans l application."
      />
    </div>
  )
}

export default ReferenceSettings
