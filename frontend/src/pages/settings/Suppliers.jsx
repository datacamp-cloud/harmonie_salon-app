import { api } from '../../api/mock'
import ReferenceSettings from './ReferenceSettings'

function Suppliers() {
  return (
    <ReferenceSettings
      title="Fournisseurs"
      description="Centralisez les fournisseurs utilises dans les arrivages et les depenses."
      queryKey={['fournisseurs']}
      queryFn={api.getFournisseurs}
      addMutationFn={api.addFournisseur}
      toggleMutationFn={api.toggleFournisseurActif}
      emptyLabel="Aucun fournisseur pour le moment."
    />
  )
}

export default Suppliers
