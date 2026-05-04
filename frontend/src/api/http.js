// src/api/http.js
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('webstock_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('webstock_token')
      localStorage.removeItem('webstock_user')
      window.location.href = '/login'
    }
    const message =
      error.response?.data?.message ??
      error.response?.data?.errors?.[Object.keys(error.response?.data?.errors ?? {})[0]]?.[0] ??
      'Une erreur est survenue'
    return Promise.reject(new Error(message))
  },
)

const get    = (url, params) => http.get(url, { params }).then((r) => r.data)
const post   = (url, data)   => http.post(url, data).then((r) => r.data)
const patch  = (url, data)   => http.patch(url, data).then((r) => r.data)
const put    = (url, data)   => http.put(url, data).then((r) => r.data)
const del    = (url)         => http.delete(url).then((r) => r.data)

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
  getProduits:        ()        => get('/produits'),
  addProduit:         (payload) => post('/produits', payload),
  toggleProduitActif: (id)      => patch(`/produits/${id}/toggle`),

  // Fournisseurs
  getFournisseurs:        ()        => get('/fournisseurs'),
  addFournisseur:         (payload) => post('/fournisseurs', payload),
  updateFournisseur:      (payload) => put(`/fournisseurs/${payload.id}`, payload),
  toggleFournisseurActif: (id)      => patch(`/fournisseurs/${id}/toggle`),
  deleteFournisseur:      (id)      => del(`/fournisseurs/${id}`),

  // Types de produits
  getTypesProduits:       ()      => get('/types-produits'),
  addTypeProduit:         (p)     => post('/types-produits', p),
  updateTypeProduit:      (payload) => put(`/types-produits/${payload.id}`, payload),
  toggleTypeProduitActif: (id)    => patch(`/types-produits/${id}/toggle`),
  updateTypeFournisseurs: ({ typeId, fournisseurIds }) => put(`/types-produits/${typeId}/fournisseurs`, { fournisseurIds }),
  deleteTypeProduit:      (id)    => del(`/types-produits/${id}`),

  // Prestations
  getPrestations:        ()        => get('/prestations'),
  addPrestation:         (payload) => post('/prestations', payload),
  updatePrestation:      (payload) => put(`/prestations/${payload.id}`, payload),
  togglePrestationActif: (id)      => patch(`/prestations/${id}/toggle`),
  deletePrestation:      (id)      => del(`/prestations/${id}`),

  // Charges
  getCharges:        ()        => get('/charges'),
  addCharge:         (payload) => post('/charges', payload),
  updateCharge:      (payload) => put(`/charges/${payload.id}`, payload),
  toggleChargeActif: (id)      => patch(`/charges/${id}/toggle`),
  deleteCharge:      (id)      => del(`/charges/${id}`),

  // Clients
  getClients:    ()        => get('/clients'),
  addClient:     (payload) => post('/clients', payload),
  updateClient:  (payload) => put(`/clients/${payload.id}`, payload),
  deleteClient:  (id)      => del(`/clients/${id}`),

  // Arrivages
  getArrivages:     ()        => get('/arrivages'),
  addArrivage:      (payload) => post('/arrivages', payload),
  validateArrivage: (id)      => post(`/arrivages/${id}/valider`),
  updateArrivage:   (payload) => put(`/arrivages/${payload.id}`, payload),
  deleteArrivage:   (id)      => del(`/arrivages/${id}`),

  // Ventes
  getVentes:     ()        => get('/ventes'),
  addVente:      (payload) => post('/ventes', payload),
  validateVente: (id)      => post(`/ventes/${id}/valider`),
  updateVente:   (payload) => put(`/ventes/${payload.id}`, payload),
  deleteVente:   (id)      => del(`/ventes/${id}`),

  // Recettes
  getRecettes:     ()        => get('/recettes'),
  addRecette:      (payload) => post('/recettes', payload),
  validateRecette: (id)      => post(`/recettes/${id}/valider`),
  updateRecette:   (payload) => put(`/recettes/${payload.id}`, payload),
  deleteRecette:   (id)      => del(`/recettes/${id}`),

  // Dépenses
  getDepenses:     ()        => get('/depenses'),
  addDepense:      (payload) => post('/depenses', payload),
  validateDepense: (id)      => post(`/depenses/${id}/valider`),
  updateDepense:   (payload) => put(`/depenses/${payload.id}`, payload),
  deleteDepense:   (id)      => del(`/depenses/${id}`),

  // Inventaires
  getInventaires:   ()        => get('/inventaires'),
  addInventaire:    (payload) => post('/inventaires', payload),
  updateInventaire: (payload) => put(`/inventaires/${payload.id}`, payload),

  // Stats & Historique
  getStats:      () => get('/stats'),
  getHistorique: () => get('/historique'),
}
