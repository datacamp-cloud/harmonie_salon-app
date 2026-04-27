// src/hooks/useVentes.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useVentes() {
  return useQuery({
    queryKey: ['ventes'],
    queryFn: api.getVentes,
  })
}

export function useAddVente() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Vente enregistree avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur enregistrement vente'),
  })
}

export function useValidateVente() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.validateVente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventes'] })
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Vente validee avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur validation vente'),
  })
}
