import { api } from '../../api/client'
import ReferenceSettings from './ReferenceSettings'

function Suppliers() {
  return (
    <ReferenceSettings
      title="Fournisseurs"
      description="Centralisez les fournisseurs utilises dans les arrivages."
      queryKey={['fournisseurs']}
      queryFn={api.getFournisseurs}
      addMutationFn={api.addFournisseur}
      updateMutationFn={api.updateFournisseur}
      deleteMutationFn={api.deleteFournisseur}
      toggleMutationFn={api.toggleFournisseurActif}
      emptyLabel="Aucun fournisseur pour le moment."
      addLabel="Nouveau fournisseur"
      extraField={{ type: 'phone', withLocalisation: true }}
      nomPlaceholder="Nom du fournisseur"
    />
  )
}

export default Suppliers
