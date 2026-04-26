const todayIso = new Date().toISOString()

export let fournisseurs = [
  { id: 1, nom: 'Beauty Source', actif: true },
  { id: 2, nom: 'Pro Hair Supply', actif: true },
  { id: 3, nom: 'Esthetique Depot', actif: false },
]

// Chaque type connait ses fournisseurs autorisés
export let typesProduits = [
  { id: 1, nom: 'Shampooing', actif: true, fournisseurIds: [1, 2] },
  { id: 2, nom: 'Soin', actif: true, fournisseurIds: [1, 2] },
  { id: 3, nom: 'Coloration', actif: true, fournisseurIds: [2, 3] },
  { id: 4, nom: 'Coiffage', actif: true, fournisseurIds: [1, 3] },
]

export let prestations = [
  { id: 1, nom: 'Brushing', prix: 8000, actif: true },
  { id: 2, nom: 'Pose de perruque', prix: 25000, actif: true },
  { id: 3, nom: 'Coloration complete', prix: 35000, actif: true },
]

export let produits = [
  { id: 1, nom: 'Shampooing Hydratant', typeId: 1, prix: 18500, actif: true },
  { id: 2, nom: 'Masque Reparateur', typeId: 2, prix: 24000, actif: true },
  { id: 3, nom: 'Huile de Soin', typeId: 2, prix: 32000, actif: true },
  { id: 4, nom: 'Coloration Chatain', typeId: 3, prix: 28500, actif: true },
  { id: 5, nom: 'Spray Fixant', typeId: 4, prix: 15000, actif: false },
  { id: 6, nom: 'Creme Coiffante', typeId: 4, prix: 19000, actif: true },
]

// fournisseurIds supprimé du niveau arrivage
// chaque item porte son propre fournisseurId
export let arrivages = [
  {
    id: 1,
    date: '2026-04-20',
    isValidated: true,
    items: [
      { produitId: 1, quantite: 18, fournisseurId: 1 },
      { produitId: 2, quantite: 10, fournisseurId: 1 },
      { produitId: 4, quantite: 6, fournisseurId: 2 },
    ],
  },
  {
    id: 2,
    date: '2026-04-21',
    isValidated: true,
    items: [
      { produitId: 3, quantite: 8, fournisseurId: 2 },
      { produitId: 6, quantite: 12, fournisseurId: 1 },
    ],
  },
  {
    id: 3,
    date: '2026-04-23',
    isValidated: false,
    items: [
      { produitId: 5, quantite: 5, fournisseurId: 1 },
    ],
  },
]

export let ventes = [
  {
    id: 1,
    date: '2026-04-22',
    isValidated: true,
    items: [
      { produitId: 1, quantite: 2 },
      { produitId: 3, quantite: 1 },
    ],
  },
  {
    id: 2,
    date: '2026-04-23',
    isValidated: true,
    items: [
      { produitId: 2, quantite: 2 },
      { produitId: 6, quantite: 1 },
    ],
  },
  {
    id: 3,
    date: '2026-04-24',
    isValidated: false,
    items: [
      { produitId: 4, quantite: 1 },
    ],
  },
]

export let inventaires = [
  {
    id: 1,
    date: '2026-04-24',
    produitId: 4,
    quantitePhysique: 7,
    stockTheorique: 6,
    ecart: 1,
    isValidated: true,
  },
]

export let depenses = [
  {
    id: 1,
    date: '2026-04-22',
    libelle: 'Achat serviettes',
    montant: 12000,
    fournisseurId: 3,
    prestationId: null,
    notes: 'Renouvellement du linge cabine',
  },
  {
    id: 2,
    date: '2026-04-24',
    libelle: 'Produits pour brushing',
    montant: 18000,
    fournisseurId: 1,
    prestationId: 1,
    notes: '',
  },
]

export let historique = [
  {
    id: 1,
    titre: 'Arrivage valide',
    description: 'Reception de 34 unites depuis Beauty Source.',
    date: '2026-04-20T09:15:00',
  },
  {
    id: 2,
    titre: 'Vente validee',
    description: 'Sortie de 3 unites sur 2 produits.',
    date: '2026-04-22T12:10:00',
  },
  {
    id: 3,
    titre: 'Inventaire valide',
    description: 'Ecart positif de 1 unite sur Coloration Chatain.',
    date: '2026-04-24T08:45:00',
  },
]

// ─── Utilitaires internes ────────────────────────────────────────────────────

function nextId(collection) {
  return Math.max(...collection.map((item) => item.id), 0) + 1
}

function findProduit(produitId) {
  return produits.find((produit) => produit.id === produitId)
}

function findType(typeId) {
  return typesProduits.find((type) => type.id === typeId)
}

function findFournisseur(fournisseurId) {
  return fournisseurs.find((fournisseur) => fournisseur.id === fournisseurId)
}

function findPrestation(prestationId) {
  return prestations.find((prestation) => prestation.id === prestationId)
}

function appendHistorique(titre, description, date = todayIso) {
  const event = {
    id: nextId(historique),
    titre,
    description,
    date: date.includes('T') ? date : `${date}T09:00:00`,
  }
  historique = [...historique, event]
  return event
}

function normalizeDate(date) {
  return date || new Date().toISOString().slice(0, 10)
}

function normalizeItems(items) {
  const merged = new Map()

  items.forEach((item) => {
    const produitId = Number(item.produitId)
    const quantite = Number(item.quantite)
    const fournisseurId = Number(item.fournisseurId) || null

    if (!produitId || quantite <= 0) return

    // On garde le dernier fournisseurId si doublon produit
    merged.set(produitId, {
      produitId,
      quantite: (merged.get(produitId)?.quantite || 0) + quantite,
      fournisseurId,
    })
  })

  return [...merged.values()]
}

function computeStocks() {
  const stocks = Object.fromEntries(produits.map((produit) => [produit.id, 0]))

  ;[...arrivages]
    .filter((a) => a.isValidated)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((arrivage) => {
      arrivage.items.forEach((item) => {
        stocks[item.produitId] = (stocks[item.produitId] || 0) + item.quantite
      })
    })

  ;[...ventes]
    .filter((v) => v.isValidated)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((vente) => {
      vente.items.forEach((item) => {
        stocks[item.produitId] = (stocks[item.produitId] || 0) - item.quantite
      })
    })

  ;[...inventaires]
    .filter((i) => i.isValidated)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((inventaire) => {
      stocks[inventaire.produitId] = (stocks[inventaire.produitId] || 0) + inventaire.ecart
    })

  return stocks
}

function enrichProduit(produit) {
  const stocks = computeStocks()
  const type = findType(produit.typeId)
  return {
    ...produit,
    typeNom: type?.nom || 'Sans type',
    stock: stocks[produit.id] || 0,
  }
}

function enrichItems(items) {
  return items.map((item) => {
    const produit = findProduit(item.produitId)
    const prixUnitaire = produit?.prix || 0
    return {
      ...item,
      produitNom: produit?.nom || 'Produit inconnu',
      prixUnitaire,
      total: prixUnitaire * item.quantite,
    }
  })
}

function enrichArrivage(arrivage) {
  const items = enrichItems(arrivage.items).map((item) => ({
    ...item,
    fournisseurNom: item.fournisseurId ? findFournisseur(item.fournisseurId)?.nom || '-' : '-',
  }))

  // Liste unique des fournisseurs impliqués dans cet arrivage
  const fournisseurNoms = [
    ...new Set(
      arrivage.items
        .map((item) => item.fournisseurId)
        .filter(Boolean)
        .map((id) => findFournisseur(id)?.nom)
        .filter(Boolean),
    ),
  ]

  return {
    ...arrivage,
    fournisseurNoms,
    items,
    totalQuantite: items.reduce((total, item) => total + item.quantite, 0),
  }
}

function enrichVente(vente) {
  const items = enrichItems(vente.items)
  return {
    ...vente,
    items,
    totalQuantite: items.reduce((total, item) => total + item.quantite, 0),
    total: items.reduce((total, item) => total + item.total, 0),
  }
}

function enrichInventaire(inventaire) {
  const produit = findProduit(inventaire.produitId)
  return {
    ...inventaire,
    produitNom: produit?.nom || 'Produit inconnu',
    stockApresInventaire: inventaire.stockTheorique + inventaire.ecart,
  }
}

function enrichDepense(depense) {
  return {
    ...depense,
    fournisseurNom: depense.fournisseurId ? findFournisseur(depense.fournisseurId)?.nom || '-' : '-',
    prestationNom: depense.prestationId ? findPrestation(depense.prestationId)?.nom || '-' : '-',
  }
}

function invalidateStockForSale(items) {
  const stocks = computeStocks()
  items.forEach((item) => {
    const produit = findProduit(item.produitId)
    if (!produit) throw new Error('Produit introuvable dans la vente')
    if (!produit.actif) throw new Error(`${produit.nom} est desactive et ne peut pas etre vendu`)
    if ((stocks[item.produitId] || 0) < item.quantite) {
      throw new Error(`Stock insuffisant pour ${produit.nom}`)
    }
    stocks[item.produitId] = (stocks[item.produitId] || 0) - item.quantite
  })
}

function ensureReferenceNameExists(collection, nom) {
  return collection.some((item) => item.nom.toLowerCase() === nom.toLowerCase())
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getStats() {
  const stocks = computeStocks()
  const today = new Date().toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)
  const enrichedProducts = produits.map((produit) => enrichProduit(produit))
  const ventesDuJour = ventes
    .filter((vente) => vente.isValidated && vente.date === today)
    .map((vente) => enrichVente(vente))

  return {
    ventesJour: ventesDuJour.reduce((total, vente) => total + vente.total, 0),
    nombreVentesJour: ventesDuJour.length,
    produitsStockFaible: enrichedProducts.filter((produit) => produit.actif && produit.stock <= 5),
    totalProduits: enrichedProducts.length,
    totalProduitsActifs: enrichedProducts.filter((produit) => produit.actif).length,
    stockTotal: Object.values(stocks).reduce((total, value) => total + value, 0),
    depensesMois: depenses
      .filter((depense) => depense.date.startsWith(month))
      .reduce((total, depense) => total + depense.montant, 0),
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  // Produits
  getProduits: () => Promise.resolve(produits.map((produit) => enrichProduit(produit))),

  addProduit: (payload) => {
    const nom = payload.nom?.trim()
    const typeId = Number(payload.typeId)
    const prix = Number(payload.prix || 0)

    if (!nom) return Promise.reject(new Error('Le libelle du produit est obligatoire'))
    if (!findType(typeId)) return Promise.reject(new Error('Le type de produit selectionne est invalide'))

    const produit = { id: nextId(produits), nom, typeId, prix, actif: payload.actif ?? true }
    produits = [...produits, produit]
    appendHistorique(
      'Nouveau produit',
      `${nom} a ete ajoute au catalogue sous le type ${findType(typeId)?.nom}.`,
      normalizeDate(payload.date),
    )
    return Promise.resolve(enrichProduit(produit))
  },

  toggleProduitActif: (id) => {
    let updated = null
    produits = produits.map((produit) => {
      if (produit.id !== id) return produit
      updated = { ...produit, actif: !produit.actif }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Produit introuvable'))
    appendHistorique(
      'Produit mis a jour',
      `${updated.nom} a ete ${updated.actif ? 'active' : 'desactive'}.`,
      new Date().toISOString(),
    )
    return Promise.resolve(enrichProduit(updated))
  },

  // Fournisseurs
  getFournisseurs: () => Promise.resolve([...fournisseurs]),

  addFournisseur: ({ nom }) => {
    const trimmed = nom?.trim()
    if (!trimmed) return Promise.reject(new Error('Le nom du fournisseur est obligatoire'))
    if (ensureReferenceNameExists(fournisseurs, trimmed)) return Promise.reject(new Error('Ce fournisseur existe deja'))
    const fournisseur = { id: nextId(fournisseurs), nom: trimmed, actif: true }
    fournisseurs = [...fournisseurs, fournisseur]
    appendHistorique('Parametre fournisseur', `${trimmed} a ete ajoute.`, new Date().toISOString())
    return Promise.resolve(fournisseur)
  },

  toggleFournisseurActif: (id) => {
    let updated = null
    fournisseurs = fournisseurs.map((fournisseur) => {
      if (fournisseur.id !== id) return fournisseur
      updated = { ...fournisseur, actif: !fournisseur.actif }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Fournisseur introuvable'))
    appendHistorique(
      'Parametre fournisseur',
      `${updated.nom} a ete ${updated.actif ? 'active' : 'desactive'}.`,
      new Date().toISOString(),
    )
    return Promise.resolve(updated)
  },

  // Types de produits
  getTypesProduits: () => Promise.resolve([...typesProduits]),

  addTypeProduit: ({ nom }) => {
    const trimmed = nom?.trim()
    if (!trimmed) return Promise.reject(new Error('Le nom du type est obligatoire'))
    if (ensureReferenceNameExists(typesProduits, trimmed)) return Promise.reject(new Error('Ce type de produit existe deja'))
    const type = { id: nextId(typesProduits), nom: trimmed, actif: true, fournisseurIds: [] }
    typesProduits = [...typesProduits, type]
    appendHistorique('Parametre type', `${trimmed} a ete ajoute.`, new Date().toISOString())
    return Promise.resolve(type)
  },

  toggleTypeProduitActif: (id) => {
    let updated = null
    typesProduits = typesProduits.map((type) => {
      if (type.id !== id) return type
      updated = { ...type, actif: !type.actif }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Type de produit introuvable'))
    appendHistorique(
      'Parametre type',
      `${updated.nom} a ete ${updated.actif ? 'active' : 'desactive'}.`,
      new Date().toISOString(),
    )
    return Promise.resolve(updated)
  },

  // Lie / délie un fournisseur à un type de produit
  updateTypeFournisseurs: ({ typeId, fournisseurIds }) => {
    const numericTypeId = Number(typeId)
    const numericIds = fournisseurIds.map(Number)
    let updated = null

    typesProduits = typesProduits.map((type) => {
      if (type.id !== numericTypeId) return type
      updated = { ...type, fournisseurIds: numericIds }
      return updated
    })

    if (!updated) return Promise.reject(new Error('Type de produit introuvable'))
    return Promise.resolve(updated)
  },

  // Prestations
  getPrestations: () => Promise.resolve([...prestations]),

  addPrestation: ({ nom, prix }) => {
    const trimmed = nom?.trim()
    const numericPrice = Number(prix || 0)
    if (!trimmed) return Promise.reject(new Error('Le nom de la prestation est obligatoire'))
    if (ensureReferenceNameExists(prestations, trimmed)) return Promise.reject(new Error('Cette prestation existe deja'))
    const prestation = { id: nextId(prestations), nom: trimmed, prix: numericPrice, actif: true }
    prestations = [...prestations, prestation]
    appendHistorique('Parametre prestation', `${trimmed} a ete ajoutee.`, new Date().toISOString())
    return Promise.resolve(prestation)
  },

  togglePrestationActif: (id) => {
    let updated = null
    prestations = prestations.map((prestation) => {
      if (prestation.id !== id) return prestation
      updated = { ...prestation, actif: !prestation.actif }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Prestation introuvable'))
    appendHistorique(
      'Parametre prestation',
      `${updated.nom} a ete ${updated.actif ? 'activee' : 'desactivee'}.`,
      new Date().toISOString(),
    )
    return Promise.resolve(updated)
  },

  // Arrivages
  getArrivages: () => Promise.resolve(arrivages.map((arrivage) => enrichArrivage(arrivage))),

  addArrivage: ({ date, items, isValidated }) => {
    const normalizedItems = normalizeItems(items || [])

    if (normalizedItems.length === 0) {
      return Promise.reject(new Error('Ajoutez au moins un produit a cet arrivage'))
    }

    // Chaque ligne doit avoir un fournisseur
    const missingFournisseur = normalizedItems.find((item) => !item.fournisseurId)
    if (missingFournisseur) {
      const produit = findProduit(missingFournisseur.produitId)
      return Promise.reject(new Error(`Selectionnez un fournisseur pour : ${produit?.nom || 'produit inconnu'}`))
    }

    // Vérifier que le fournisseur est bien lié au type du produit
    for (const item of normalizedItems) {
      const produit = findProduit(item.produitId)
      if (!produit) return Promise.reject(new Error('Un produit de l arrivage est introuvable'))
      const type = findType(produit.typeId)
      if (type && !type.fournisseurIds.includes(item.fournisseurId)) {
        const fournisseur = findFournisseur(item.fournisseurId)
        return Promise.reject(
          new Error(`${fournisseur?.nom} n est pas autorise pour le type "${type.nom}"`),
        )
      }
    }

    const arrivage = {
      id: nextId(arrivages),
      date: normalizeDate(date),
      items: normalizedItems,
      isValidated: Boolean(isValidated),
    }

    arrivages = [...arrivages, arrivage]

    const fournisseurNoms = [...new Set(
      normalizedItems.map((item) => findFournisseur(item.fournisseurId)?.nom).filter(Boolean),
    )]

    appendHistorique(
      arrivage.isValidated ? 'Arrivage valide' : 'Arrivage en attente',
      `${arrivage.items.length} produit(s) en provenance de ${fournisseurNoms.join(', ')}.`,
      `${arrivage.date}T10:00:00`,
    )

    return Promise.resolve(enrichArrivage(arrivage))
  },

  // Ventes
  getVentes: () => Promise.resolve(ventes.map((vente) => enrichVente(vente))),

  addVente: ({ date, items, isValidated }) => {
    const normalizedItems = normalizeItems(items || [])
    if (normalizedItems.length === 0) {
      return Promise.reject(new Error('Ajoutez au moins un produit a cette vente'))
    }
    if (isValidated) {
      try {
        invalidateStockForSale(normalizedItems)
      } catch (error) {
        return Promise.reject(error)
      }
    }
    const vente = {
      id: nextId(ventes),
      date: normalizeDate(date),
      items: normalizedItems,
      isValidated: Boolean(isValidated),
    }
    ventes = [...ventes, vente]
    appendHistorique(
      vente.isValidated ? 'Vente validee' : 'Vente en attente',
      `${vente.items.length} produit(s) pour ${enrichVente(vente).total.toLocaleString('fr-FR')} FCFA.`,
      `${vente.date}T13:00:00`,
    )
    return Promise.resolve(enrichVente(vente))
  },

  // Inventaires
  getInventaires: () => Promise.resolve(inventaires.map((inventaire) => enrichInventaire(inventaire))),

  addInventaire: ({ date, produitId, quantitePhysique }) => {
    const numericProduitId = Number(produitId)
    const numericQty = Number(quantitePhysique)
    const produit = findProduit(numericProduitId)

    if (!produit) return Promise.reject(new Error('Produit introuvable pour l inventaire'))
    if (numericQty < 0) return Promise.reject(new Error('La quantite inventoriee doit etre positive'))

    const stocks = computeStocks()
    const stockTheorique = stocks[numericProduitId] || 0
    const ecart = numericQty - stockTheorique

    const inventaire = {
      id: nextId(inventaires),
      date: normalizeDate(date),
      produitId: numericProduitId,
      quantitePhysique: numericQty,
      stockTheorique,
      ecart,
      isValidated: true, // toujours validé immédiatement
    }

    inventaires = [...inventaires, inventaire]
    appendHistorique(
      'Inventaire enregistre',
      `${produit.nom}: stock theorique ${stockTheorique}, quantite comptee ${numericQty}, ecart ${ecart}.`,
      `${inventaire.date}T08:30:00`,
    )

    return Promise.resolve(enrichInventaire(inventaire))
  },

  // Depenses
  getDepenses: () => Promise.resolve(depenses.map((depense) => enrichDepense(depense))),

  addDepense: ({ date, libelle, montant, fournisseurId, prestationId, notes }) => {
    const trimmed = libelle?.trim()
    const numericMontant = Number(montant)

    if (!trimmed) return Promise.reject(new Error('Le libelle de la depense est obligatoire'))
    if (!numericMontant || numericMontant <= 0) {
      return Promise.reject(new Error('Le montant de la depense doit etre superieur a zero'))
    }

    const depense = {
      id: nextId(depenses),
      date: normalizeDate(date),
      libelle: trimmed,
      montant: numericMontant,
      fournisseurId: fournisseurId ? Number(fournisseurId) : null,
      prestationId: prestationId ? Number(prestationId) : null,
      notes: notes?.trim() || '',
    }

    depenses = [...depenses, depense]
    appendHistorique(
      'Depense enregistree',
      `${trimmed} pour ${numericMontant.toLocaleString('fr-FR')} FCFA.`,
      `${depense.date}T15:00:00`,
    )

    return Promise.resolve(enrichDepense(depense))
  },

  // Stats & historique
  getStats: () => Promise.resolve(getStats()),
  getHistorique: () => Promise.resolve([...historique]),

  login: (email, password) => {
    if (email && password) {
      return Promise.resolve({ user: { id: 1, email, nom: 'Admin Salon' }, token: 'mock-jwt-token-123' })
    }
    return Promise.reject(new Error('Email ou mot de passe incorrect'))
  },
}