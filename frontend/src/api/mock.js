// Mock data for the beauty salon application

export let produits = [
  { id: 1, nom: 'Shampooing Hydratant', stock: 25, prix: 18500 },
  { id: 2, nom: 'Masque Réparateur', stock: 15, prix: 24000 },
  { id: 3, nom: 'Huile de Soin', stock: 3, prix: 32000 },
  { id: 4, nom: 'Coloration Châtain', stock: 8, prix: 28500 },
  { id: 5, nom: 'Spray Fixant', stock: 2, prix: 15000 },
  { id: 6, nom: 'Crème Coiffante', stock: 12, prix: 19000 },
  { id: 7, nom: 'Sérum Brillance', stock: 6, prix: 35000 },
  { id: 8, nom: 'Gel Coiffant Fort', stock: 20, prix: 12500 },
]

export let ventes = [
  { id: 1, produitId: 1, produitNom: 'Shampooing Hydratant', quantite: 2, prixUnitaire: 18500, total: 37000, date: '2024-01-15T10:30:00' },
  { id: 2, produitId: 3, produitNom: 'Huile de Soin', quantite: 1, prixUnitaire: 32000, total: 32000, date: '2024-01-15T11:45:00' },
  { id: 3, produitId: 6, produitNom: 'Crème Coiffante', quantite: 1, prixUnitaire: 19000, total: 19000, date: '2024-01-15T14:20:00' },
  { id: 4, produitId: 2, produitNom: 'Masque Réparateur', quantite: 3, prixUnitaire: 24000, total: 72000, date: '2024-01-15T15:00:00' },
  { id: 5, produitId: 8, produitNom: 'Gel Coiffant Fort', quantite: 2, prixUnitaire: 12500, total: 25000, date: '2024-01-15T16:30:00' },
]

export let arrivages = [
  { id: 1, produitId: 1, produitNom: 'Shampooing Hydratant', quantite: 50, date: '2024-01-10T09:00:00' },
  { id: 2, produitId: 4, produitNom: 'Coloration Châtain', quantite: 20, date: '2024-01-12T10:30:00' },
  { id: 3, produitId: 7, produitNom: 'Sérum Brillance', quantite: 15, date: '2024-01-14T14:00:00' },
]

// Statistics for dashboard
export const getStats = () => {
  const today = new Date().toISOString().split('T')[0]
  const todaySales = ventes.filter(v => v.date.startsWith(today))
  
  return {
    ventesJour: todaySales.reduce((acc, v) => acc + v.total, 0),
    nombreVentesJour: todaySales.length,
    produitsStockFaible: produits.filter(p => p.stock <= 5),
    totalProduits: produits.length,
    totalVentes: ventes.length,
  }
}

// History data
export let historique = [
  { id: 1, titre: 'Vente de Shampooing Hydratant', description: 'Vente de 2 Shampooing Hydratant', date: '2024-01-15T10:30:00' },
  { id: 2, titre: 'Vente de Huile de Soin', description: 'Vente de 1 Huile de Soin', date: '2024-01-15T11:45:00' },
  { id: 3, titre: 'Vente de Crème Coiffante', description: 'Vente de 1 Crème Coiffante', date: '2024-01-15T14:20:00' },
  { id: 4, titre: 'Vente de Masque Réparateur', description: 'Vente de 3 Masque Réparateur', date: '2024-01-15T15:00:00' },
  { id: 5, titre: 'Vente de Gel Coiffant Fort', description: 'Vente de 2 Gel Coiffant Fort', date: '2024-01-15T16:30:00' },
]

const ajouterHistorique = (titre, description, date = new Date().toISOString()) => {
  const nouvelEvenement = {
    id: Math.max(...historique.map((event) => event.id), 0) + 1,
    titre,
    description,
    date,
  }
  historique = [...historique, nouvelEvenement]
  return nouvelEvenement
}

// API simulation functions
export const api = {
  // Products
  getProduits: () => Promise.resolve([...produits]),
  
  addProduit: (produit) => {
    const newProduit = {
      id: Math.max(...produits.map(p => p.id), 0) + 1,
      ...produit,
    }
    produits = [...produits, newProduit]
    ajouterHistorique(
      `Nouveau produit: ${newProduit.nom}`,
      `Ajout du produit ${newProduit.nom} avec un stock initial de ${newProduit.stock}`,
    )
    return Promise.resolve(newProduit)
  },
  
  updateProduit: (id, updates) => {
    produits = produits.map(p => p.id === id ? { ...p, ...updates } : p)
    return Promise.resolve(produits.find(p => p.id === id))
  },
  
  deleteProduit: (id) => {
    produits = produits.filter(p => p.id !== id)
    return Promise.resolve({ success: true })
  },

  // Sales
  getVentes: () => Promise.resolve([...ventes]),
  
  addVente: (vente) => {
    const produit = produits.find(p => p.id === vente.produitId)
    if (!produit) {
      return Promise.reject(new Error('Produit non trouvé'))
    }
    if (produit.stock < vente.quantite) {
      return Promise.reject(new Error('Stock insuffisant'))
    }
    
    const newVente = {
      id: Math.max(...ventes.map(v => v.id), 0) + 1,
      produitId: vente.produitId,
      produitNom: produit.nom,
      quantite: vente.quantite,
      prixUnitaire: produit.prix,
      total: produit.prix * vente.quantite,
      date: new Date().toISOString(),
    }
    
    // Update stock
    produits = produits.map(p => 
      p.id === vente.produitId 
        ? { ...p, stock: p.stock - vente.quantite }
        : p
    )
    
    ventes = [...ventes, newVente]
    ajouterHistorique(
      `Vente de ${newVente.produitNom}`,
      `Vente de ${newVente.quantite} ${newVente.produitNom} pour ${newVente.total.toLocaleString()} FCFA`,
      newVente.date,
    )
    return Promise.resolve(newVente)
  },

  // Stock arrivals
  getArrivages: () => Promise.resolve([...arrivages]),
  
  addArrivage: (arrivage) => {
    const produit = produits.find(p => p.id === arrivage.produitId)
    if (!produit) {
      return Promise.reject(new Error('Produit non trouvé'))
    }
    
    const newArrivage = {
      id: Math.max(...arrivages.map(a => a.id), 0) + 1,
      produitId: arrivage.produitId,
      produitNom: produit.nom,
      quantite: arrivage.quantite,
      date: new Date().toISOString(),
    }
    
    // Update stock
    produits = produits.map(p => 
      p.id === arrivage.produitId 
        ? { ...p, stock: p.stock + arrivage.quantite }
        : p
    )
    
    arrivages = [...arrivages, newArrivage]
    ajouterHistorique(
      `Arrivage de ${newArrivage.produitNom}`,
      `Ajout en stock de ${newArrivage.quantite} unite(s) pour ${newArrivage.produitNom}`,
      newArrivage.date,
    )
    return Promise.resolve(newArrivage)
  },

  // Stats
  getStats: () => Promise.resolve(getStats()),

  // History 
  getHistorique: () => Promise.resolve([...historique]),

  // Auth (mock)
  login: (email, password) => {
    if (email && password) {
      return Promise.resolve({
        user: {
          id: 1,
          email: email,
          nom: 'Admin Salon',
        },
        token: 'mock-jwt-token-123',
      })
    }
    return Promise.reject(new Error('Email ou mot de passe incorrect'))
  },
}
