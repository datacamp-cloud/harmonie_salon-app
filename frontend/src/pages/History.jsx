import { useQuery } from '@tanstack/react-query'
import { api } from '../api/mock'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'
import { useMemo } from 'react'
import { useState } from 'react'

function History() {
    const [search, setSearch] = useState('')
    const [openedId, setOpenedId] = useState(null)
    // Requête pour récupérer l'historique
    const { data = [], isLoading, isError, error } = useQuery({
        queryKey: ['historique'],
        queryFn: api.getHistorique,
    })

    // Fonction pour filtrer et trier l'historique
    const historique = useMemo(() => {
        const terme = search.trim().toLowerCase()

        return data
            .filter((item) => {
                if (!terme) return true
                return (
                    item.titre.toLowerCase().includes(terme) ||
                    item.description.toLowerCase().includes(terme)
                )
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [data, search])

    return (
        <div className="max-w-6xl mx-auto space-y-5">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-beige-900">Historique</h1>
                <span className="text-sm text-beige-600">
                    {historique.length} element{historique.length > 1 ? 's' : ''}
                </span>
            </div>

            <input
                type="text"
                placeholder="Rechercher par titre ou description"
                className="w-full p-3 border border-beige-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-beige-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {isLoading ? (
                <div className="py-10 text-center">
                    <p className="text-beige-600">Chargement de l&apos;historique...</p>
                </div>
            ) : isError ? (
                <div className="py-10 text-center">
                    <p className="text-red-600">
                        Erreur: {error?.message || 'Impossible de charger l’historique'}
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-beige-200 bg-white overflow-hidden">
                {historique.length > 0 ? (
                    <ul className="divide-y divide-beige-200">
                        {historique.map((item) => {
                            const isOpen = openedId === item.id
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        className="w-full p-4 text-left hover:bg-beige-50 transition-colors"
                                        onClick={() => setOpenedId(isOpen ? null : item.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {isOpen ? (
                                                <ChevronDown size={18} className="mt-0.5 text-beige-600" />
                                            ) : (
                                                <ChevronRight size={18} className="mt-0.5 text-beige-600" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-beige-900">{item.titre}</p>
                                                <p className="text-sm text-beige-600">
                                                    {new Date(item.date).toLocaleString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-11 pb-4">
                                            <div className="rounded-lg bg-beige-50 border border-beige-200 p-4 space-y-2">
                                                <p className="text-sm text-beige-700">
                                                    <span className="font-medium text-beige-900">Description:</span>{' '}
                                                    {item.description}
                                                </p>
                                                <p className="text-sm text-beige-700">
                                                    <span className="font-medium text-beige-900">Date complete:</span>{' '}
                                                    {new Date(item.date).toLocaleString('fr-FR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </p>
                                                <p className="text-sm text-beige-700">
                                                    <span className="font-medium text-beige-900">Reference:</span> #{item.id}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <div className="py-8 text-center">
                        <Clock size={40} className="mx-auto text-beige-300 mb-3" />
                        <p className="text-beige-600">Aucun historique enregistré</p>
                    </div>
                )}
                </div>
            )}
        </div>
    )
}

export default History;