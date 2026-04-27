// src/hooks/useProduits.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

export function useProduits() {
  return useQuery({
    queryKey: ['produits'],
    queryFn: api.getProduits,
  })
}

export function useAddProduit() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.addProduit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Produit ajoute avec succes')
    },
    onError: (error) => toast.error(error.message || 'Erreur ajout produit'),
  })
}

export function useToggleProduit() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: api.toggleProduitActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      toast.success('Statut du produit mis a jour')
    },
    onError: (error) => toast.error(error.message || 'Erreur mise a jour produit'),
  })
}
