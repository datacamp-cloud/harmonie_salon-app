import { api } from '../../api/client'
import ReferenceSettings from './ReferenceSettings'

function Services() {
  return (
    <ReferenceSettings
      title="Prestations"
      description="Gardez la liste des prestations du salon a jour pour rattacher les recettes."
      queryKey={['prestations']}
      queryFn={api.getPrestations}
      addMutationFn={api.addPrestation}
      updateMutationFn={api.updatePrestation}
      deleteMutationFn={api.deletePrestation}
      toggleMutationFn={api.togglePrestationActif}
      emptyLabel="Aucune prestation pour le moment."
      addLabel="Nouvelle prestation"
      extraField={{ type: 'price' }}
    />
  )
}

export default Services
