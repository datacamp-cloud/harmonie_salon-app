import { useQuery } from '@tanstack/react-query'
import { UserCheck, Users } from 'lucide-react'
import { api } from '../../api/mock'

function Clients() {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: api.getClients,
  })

  const { data: ventes = [] } = useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })

  // Nombre de ventes par client
  const ventesByClient = ventes.reduce((acc, vente) => {
    if (!vente.clientId) return acc
    acc[vente.clientId] = (acc[vente.clientId] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-beige-900">Clients</h1>
        <p className="text-beige-600 mt-1">
          Liste des clients enregistres lors des ventes de produits.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm max-w-xs">
        <InfoCard label="Total clients" value={clients.length} />
        <InfoCard label="Avec ventes" value={Object.keys(ventesByClient).length} tone="success" />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beige-400" />
          </div>
        ) : clients.length > 0 ? (
          <table className="w-full">
            <thead className="bg-beige-50 border-b border-beige-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">Client</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-beige-900">Telephone</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-beige-900">Ventes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-beige-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-beige-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-beige-600">
                          {client.nom.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-beige-900">{client.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-beige-600 text-sm">
                    {client.telephone || <span className="text-beige-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-beige-100 text-beige-700 text-sm font-semibold">
                      {ventesByClient[client.id] || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-beige-300 mb-3" />
            <p className="text-beige-500">Aucun client enregistre</p>
            <p className="text-xs text-beige-400 mt-1">
              Les clients apparaissent ici apres avoir ete associes a une vente.
            </p>
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

export default Clients