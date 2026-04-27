// src/hooks/useArrivages.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useArrivages() {
  return useQuery({
    queryKey: ['arrivages'],
    queryFn: api.getArrivages,
  })
}

export function useAddArrivage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Arrivage enregistre avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur enregistrement arrivage'),
  })
}

export function useValidateArrivage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.validateArrivage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrivages'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Arrivage valide avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur validation arrivage'),
  })
}
