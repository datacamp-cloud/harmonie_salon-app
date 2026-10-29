import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, RotateCcw, Loader2 } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const LABELS = {
  arrivage: 'Arrivage',
  vente: 'Vente de produits',
  recette: 'Recette',
  depense: 'Depense',
  inventaire: 'Inventaire',
}

function Archives() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data: archives = [], isLoading, error } = useQuery({
    queryKey: ['archives'],
    queryFn: api.getArchives,
    enabled: user?.role === 'superadmin',
  })

  const restoreMutation = useMutation({
    mutationFn: api.restoreArchive,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['archives'] }),
        queryClient.invalidateQueries({ queryKey: ['arrivages'] }),
        queryClient.invalidateQueries({ queryKey: ['ventes'] }),
        queryClient.invalidateQueries({ queryKey: ['recettes'] }),
        queryClient.invalidateQueries({ queryKey: ['depenses'] }),
        queryClient.invalidateQueries({ queryKey: ['inventaires'] }),
        queryClient.invalidateQueries({ queryKey: ['produits'] }),
        queryClient.invalidateQueries({ queryKey: ['stats'] }),
        queryClient.invalidateQueries({ queryKey: ['historique'] }),
      ])
      toast.success('Archive restauree')
    },
    onError: (e) => toast.error(e.message || 'Erreur lors de la restauration'),
  })

  if (user?.role !== 'superadmin') {
    return <div className="rounded-xl border border-beige-200 bg-white p-6 text-beige-700">Acces reserve au super administrateur.</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-beige-900 flex items-center gap-2">
          <Archive size={22} /> Archives
        </h1>
        <p className="text-sm text-beige-600 mt-1">
          Les operations archivees restent consultables et peuvent etre restaurees.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-beige-500" /></div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les archives : {error.message}
        </div>
      ) : archives.length === 0 ? (
        <div className="rounded-xl border border-beige-200 bg-white p-8 text-center text-sm text-beige-600">
          Aucune archive disponible.
        </div>
      ) : (
        <div className="rounded-xl border border-beige-200 bg-white divide-y divide-beige-100">
          {archives.map((archive) => {
            const snapshot = archive.data?.record || archive.data || {}
            const restored = Boolean(archive.restored_at)
            const canRestore = Boolean(archive.data?.record) || (!['arrivage', 'vente', 'recette', 'depense', 'inventaire'].includes(archive.type) && Object.keys(archive.data || {}).length > 1)
            const date = archive.created_at ? new Date(archive.created_at).toLocaleString('fr-FR') : 'Date inconnue'
            const description = snapshot.date || snapshot.notes || snapshot.nom || snapshot.montant || snapshot.prix_applique
            return (
              <div key={archive.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-beige-900">{LABELS[archive.type] || archive.type} #{archive.reference_id}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${restored ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                      {restored ? 'Restauree' : canRestore ? 'Archivee' : 'Archive incomplete'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-beige-600">
                    Archivee le {date}{description ? ` · ${String(description)}` : ''}
                  </p>
                  {Array.isArray(archive.data?.lines) && (
                    <p className="mt-1 text-xs text-beige-500">{archive.data.lines.length} ligne(s) detaillee(s) conservee(s)</p>
                  )}
                  {!canRestore && !restored && (
                    <p className="mt-1 text-xs text-amber-700">Cette ancienne archive ne contient pas assez de donnees pour une restauration fiable.</p>
                  )}
                </div>
                {!restored && canRestore && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Restaurer cette operation ? Elle redeviendra active dans les registres.')) {
                        restoreMutation.mutate(archive.id)
                      }
                    }}
                    disabled={restoreMutation.isPending}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-beige-300 px-3 py-2 text-sm text-beige-800 transition-colors hover:bg-beige-50 disabled:opacity-50"
                  >
                    {restoreMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                    Restaurer
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Archives
