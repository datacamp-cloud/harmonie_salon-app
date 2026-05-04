import { api } from '../../api/client'
import ReferenceSettings from './ReferenceSettings'

function Charges() {
  return (
    <ReferenceSettings
      title="Charges"
      description="Definissez les categories de depenses."
      queryKey={['charges']}
      queryFn={api.getCharges}
      addMutationFn={api.addCharge}
      updateMutationFn={api.updateCharge}
      deleteMutationFn={api.deleteCharge}
      toggleMutationFn={api.toggleChargeActif}
      emptyLabel="Aucune charge configuree."
      addLabel="Nouvelle charge"
    />
  )
}

export default Charges
