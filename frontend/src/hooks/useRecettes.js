// src/hooks/useRecettes.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useRecettes() {
  return useQuery({
    queryKey: ['recettes'],
    queryFn: api.getRecettes,
  })
}

export function useAddRecette() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addRecette,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recettes'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Recette enregistree avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur enregistrement recette'),
  })
}

export function useValidateRecette() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.validateRecette,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recettes'] })
      queryClient.invalidateQueries({ queryKey: ['historique'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Recette validee avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur validation recette'),
  })
}
