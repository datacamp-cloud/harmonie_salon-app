import axios from 'axios'

// URL de l'API
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const client = axios.create({ baseURL })

// Fonction pour formater les messages d'erreur
const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.errors) {
    const first = Object.values(error.response.data.errors)[0]
    if (Array.isArray(first) && first[0]) return first[0]
  }
  return error.message || 'Erreur serveur'
}

// Fonction pour effectuer les requêtes API
const request = async (promise) => {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

// Exportation des fonctions API
export const api = {
  getProduits: () => request(client.get('/produits')),
  addProduit: (produit) => request(client.post('/produits', produit)),

  getVentes: () => request(client.get('/ventes')),
  addVente: (vente) => request(client.post('/ventes', vente)),

  getArrivages: () => request(client.get('/arrivages')),
  addArrivage: (arrivage) => request(client.post('/arrivages', arrivage)),

  getStats: () => request(client.get('/stats')),
  getHistorique: () => request(client.get('/historique')),

  login: (email, password) => request(client.post('/login', { email, password })),
}
