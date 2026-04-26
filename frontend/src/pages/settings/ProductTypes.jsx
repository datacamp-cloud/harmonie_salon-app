import { api } from '../../api/mock'
import ReferenceSettings from './ReferenceSettings'

function ProductTypes() {
  return (
    <ReferenceSettings
      title="Types de produits"
      description="Classez les produits du salon pour fiabiliser la gestion du catalogue."
      queryKey={['types-produits']}
      queryFn={api.getTypesProduits}
      addMutationFn={api.addTypeProduit}
      toggleMutationFn={api.toggleTypeProduitActif}
      emptyLabel="Aucun type de produit pour le moment."
    />
  )
}

export default ProductTypes
