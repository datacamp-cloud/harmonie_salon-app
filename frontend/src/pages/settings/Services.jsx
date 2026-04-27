import { api } from '../../api/mock'
import ReferenceSettings from './ReferenceSettings'

function Services() {
  return (
    <ReferenceSettings
      title="Prestations"
      description="Gardez la liste des prestations du salon a jour pour rattacher les depenses."
      queryKey={['prestations']}
      queryFn={api.getPrestations}
      addMutationFn={api.addPrestation}
      toggleMutationFn={api.togglePrestationActif}
      emptyLabel="Aucune prestation pour le moment."
      addLabel="Nouvelle prestation"
      extraField={{ type: 'price' }}
    />
  )
}

export default Services
