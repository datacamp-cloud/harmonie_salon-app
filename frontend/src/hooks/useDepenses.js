// src/hooks/useDepenses.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useDepenses() {
  return useQuery({
    queryKey: ['depenses'],
    queryFn: api.getDepenses,
  })
}

export function useAddDepense() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addDepense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Depense enregistree avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur enregistrement depense'),
  })
}
