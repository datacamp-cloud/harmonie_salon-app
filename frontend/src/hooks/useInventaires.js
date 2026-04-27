// src/hooks/useInventaires.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useInventaires() {
  return useQuery({
    queryKey: ['inventaires'],
    queryFn: api.getInventaires,
  })
}

export function useAddInventaire() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addInventaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventaires'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Inventaire enregistre avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur enregistrement inventaire'),
  })
}
