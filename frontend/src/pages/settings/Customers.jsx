import { api } from '../../api/client'
import ReferenceSettings from './ReferenceSettings'

function Customers() {
  return (
    <ReferenceSettings
      title="Clients"
      description="Ajoutez un client ici pour une bonne relation clientèle"
      queryKey={['clients']}
      queryFn={api.getClients}
      addMutationFn={({ nom, prix: telephone, localisation }) => api.addClient({ nom, telephone, localisation })}
      updateMutationFn={({ id, nom, prix: telephone, localisation }) => api.updateClient({ id, nom, telephone, localisation })}
      toggleMutationFn={api.toggleClientActif}
      deleteMutationFn={api.deleteClient}
      emptyLabel="Aucun client enregistre."
      addLabel="Nouveau client"
      extraField={{ type: 'phone', withLocalisation: true }}
      nomPlaceholder="Nom et prenom(s)"
    />
  )
}

export default Customers
