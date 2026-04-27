// src/hooks/useReferentiels.js
// ─────────────────────────────────────────────────────────────────────────────
// Hooks pour tous les référentiels (Paramètres)
// Fournisseurs, TypesProduits, Prestations, Charges, Clients
// ─────────────────────────────────────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'

// ── Fournisseurs ──────────────────────────────────────────────────────────────

export function useFournisseurs() {
  return useQuery({ queryKey: ['fournisseurs'], queryFn: api.getFournisseurs })
}

export function useAddFournisseur() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.addFournisseur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      toast.success('Fournisseur ajoute')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

export function useToggleFournisseur() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.toggleFournisseurActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      toast.success('Statut mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

// ── Types de produits ─────────────────────────────────────────────────────────

export function useTypesProduits() {
  return useQuery({ queryKey: ['types-produits'], queryFn: api.getTypesProduits })
}

export function useAddTypeProduit() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.addTypeProduit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-produits'] })
      toast.success('Type de produit ajoute')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

export function useToggleTypeProduit() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.toggleTypeProduitActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-produits'] })
      toast.success('Statut mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

export function useUpdateTypeFournisseurs() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.updateTypeFournisseurs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['types-produits'] })
      toast.success('Fournisseurs du type mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

// ── Prestations ───────────────────────────────────────────────────────────────

export function usePrestations() {
  return useQuery({ queryKey: ['prestations'], queryFn: api.getPrestations })
}

export function useAddPrestation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.addPrestation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestations'] })
      toast.success('Prestation ajoutee')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

export function useTogglePrestation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.togglePrestationActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestations'] })
      toast.success('Statut mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

// ── Charges ───────────────────────────────────────────────────────────────────

export function useCharges() {
  return useQuery({ queryKey: ['charges'], queryFn: api.getCharges })
}

export function useAddCharge() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.addCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Charge ajoutee')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

export function useToggleCharge() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.toggleChargeActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Statut mis a jour')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}

// ── Clients ───────────────────────────────────────────────────────────────────

export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: api.getClients })
}

export function useAddClient() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: api.addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client ajoute')
    },
    onError: (e) => toast.error(e.message || 'Erreur'),
  })
}
