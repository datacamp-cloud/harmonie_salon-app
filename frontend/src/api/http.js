// src/api/http.js
// ─────────────────────────────────────────────────────────────────────────────
// Client HTTP réel vers le backend Laravel.
// Remplace mock.js quand le backend est prêt.
//
// Pour activer : dans src/api/client.js, changer :
//   export { api } from './mock'
// en :
//   export { api } from './http'
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Injecte le token JWT à chaque requête
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('webstock_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirige vers /login si le token est expiré
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('webstock_token')
      localStorage.removeItem('webstock_user')
      window.location.href = '/login'
    }
    // Reformater l'erreur pour que le message soit identique au mock
    const message =
      error.response?.data?.message ??
      error.response?.data?.errors?.[Object.keys(error.response?.data?.errors ?? {})[0]]?.[0] ??
      'Une erreur est survenue'
    return Promise.reject(new Error(message))
  },
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const get  = (url, params) => http.get(url, { params }).then((r) => r.data)
const post = (url, data)   => http.post(url, data).then((r) => r.data)
const patch = (url, data)  => http.patch(url, data).then((r) => r.data)
const put  = (url, data)   => http.put(url, data).then((r) => r.data)

// ─── API (même interface que mock.js) ─────────────────────────────────────────

export const api = {
  // Auth
  login: (pseudo, password) =>
    post('/login', { pseudo, password }).then((data) => {
      localStorage.setItem('webstock_token', data.token)
      localStorage.setItem('webstock_user', JSON.stringify(data.user))
      return data
    }),

  logout: () =>
    post('/logout').finally(() => {
      localStorage.removeItem('webstock_token')
      localStorage.removeItem('webstock_user')
    }),

  // Produits
  getProduits:       ()        => get('/produits'),
  addProduit:        (payload) => post('/produits', payload),
  toggleProduitActif:(id)      => patch(`/produits/${id}/toggle`),

  // Fournisseurs
  getFournisseurs:       ()        => get('/fournisseurs'),
  addFournisseur:        (payload) => post('/fournisseurs', payload),
  toggleFournisseurActif:(id)      => patch(`/fournisseurs/${id}/toggle`),

  // Types de produits
  getTypesProduits:       ()               => get('/types-produits'),
  addTypeProduit:         (payload)        => post('/types-produits', payload),
  toggleTypeProduitActif: (id)             => patch(`/types-produits/${id}/toggle`),
  updateTypeFournisseurs: ({ typeId, fournisseurIds }) =>
    put(`/types-produits/${typeId}/fournisseurs`, { fournisseurIds }),

  // Prestations
  getPrestations:       ()        => get('/prestations'),
  addPrestation:        (payload) => post('/prestations', payload),
  togglePrestationActif:(id)      => patch(`/prestations/${id}/toggle`),

  // Charges
  getCharges:       ()        => get('/charges'),
  addCharge:        (payload) => post('/charges', payload),
  toggleChargeActif:(id)      => patch(`/charges/${id}/toggle`),

  // Clients
  getClients:  ()        => get('/clients'),
  addClient:   (payload) => post('/clients', payload),

  // Arrivages
  getArrivages:     ()        => get('/arrivages'),
  addArrivage:      (payload) => post('/arrivages', payload),
  validateArrivage: (id)      => post(`/arrivages/${id}/valider`),

  // Ventes
  getVentes:     ()        => get('/ventes'),
  addVente:      (payload) => post('/ventes', payload),
  validateVente: (id)      => post(`/ventes/${id}/valider`),

  // Recettes
  getRecettes:     ()        => get('/recettes'),
  addRecette:      (payload) => post('/recettes', payload),
  validateRecette: (id)      => post(`/recettes/${id}/valider`),

  // Dépenses
  getDepenses:  ()        => get('/depenses'),
  addDepense:   (payload) => post('/depenses', payload),

  // Inventaires
  getInventaires:  ()        => get('/inventaires'),
  addInventaire:   (payload) => post('/inventaires', payload),

  // Stats & Historique
  getStats:      () => get('/stats'),
  getHistorique: () => get('/historique'),
}
