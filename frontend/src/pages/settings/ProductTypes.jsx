import { api } from '../../api/client'
import ReferenceSettings from './ReferenceSettings'

function ProductTypes() {
  return (
    <ReferenceSettings
      title="Types de produits"
      description="Classez les produits du salon pour fiabiliser la gestion du catalogue."
      queryKey={['types-produits']}
      queryFn={api.getTypesProduits}
      addMutationFn={api.addTypeProduit}
      updateMutationFn={api.updateTypeProduit}
      deleteMutationFn={api.deleteTypeProduit}
      toggleMutationFn={api.toggleTypeProduitActif}
      emptyLabel="Aucun type de produit pour le moment."
      addLabel="Nouveau type de produit"
    />
  )
}

export default ProductTypes
