// src/hooks/useStats.js
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })
}

export function useHistorique() {
  return useQuery({
    queryKey: ['historique'],
    queryFn: api.getHistorique,
  })
}
