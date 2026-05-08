export let mockUsers = [
  { id: 1, name: 'Admin Salon', pseudo: 'admin',    role: 'admin' },
  { id: 2, name: 'Caissier',    pseudo: 'caissier', role: 'caissier' },
]

const todayIso = new Date().toISOString()

export let fournisseurs = [
  { id: 1, nom: 'Beauty Source', actif: true, telephone: '07 00 11 22 33', localisation: 'Abidjan Plateau' },
  { id: 2, nom: 'Pro Hair Supply', actif: true, telephone: '05 44 55 66 77', localisation: 'Abidjan Cocody' },
  { id: 3, nom: 'Esthetique Depot', actif: false, telephone: '', localisation: '' },
]

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

export let charges = [
  { id: 1, nom: 'Linge et serviettes', actif: true },
  { id: 2, nom: 'Produits de soin', actif: true },
  { id: 3, nom: 'Loyer', actif: true },
  { id: 4, nom: 'Salaires', actif: true },
  { id: 5, nom: 'Entretien materiel', actif: true },
]

export let clients = [
  { id: 1, nom: 'Marie Kouassi', telephone: '07 00 11 22 33', localisation: 'Abidjan Yopougon', actif: true },
  { id: 2, nom: 'Aicha Diallo', telephone: '', localisation: '', actif: true },
]

export let produits = [
  { id: 1, nom: 'Shampooing Hydratant', typeId: 1, prix: 18500, actif: true },
  { id: 2, nom: 'Masque Reparateur', typeId: 2, prix: 24000, actif: true },
  { id: 3, nom: 'Huile de Soin', typeId: 2, prix: 32000, actif: true },
  { id: 4, nom: 'Coloration Chatain', typeId: 3, prix: 28500, actif: true },
  { id: 5, nom: 'Spray Fixant', typeId: 4, prix: 15000, actif: false },
  { id: 6, nom: 'Creme Coiffante', typeId: 4, prix: 19000, actif: true },
]

export let arrivages = [
  {
    id: 1, date: '2026-04-20', isValidated: true,
    items: [
      { produitId: 1, quantite: 18, fournisseurId: 1 },
      { produitId: 2, quantite: 10, fournisseurId: 1 },
      { produitId: 4, quantite: 6, fournisseurId: 2 },
    ],
  },
  {
    id: 2, date: '2026-04-21', isValidated: true,
    items: [
      { produitId: 3, quantite: 8, fournisseurId: 2 },
      { produitId: 6, quantite: 12, fournisseurId: 1 },
    ],
  },
  {
    id: 3, date: '2026-04-23', isValidated: false,
    items: [{ produitId: 5, quantite: 5, fournisseurId: 1 }],
  },
]

export let ventes = [
  {
    id: 1, date: '2026-04-22', clientId: 1, isValidated: true,
    items: [{ produitId: 1, quantite: 2 }, { produitId: 3, quantite: 1 }],
  },
  {
    id: 2, date: '2026-04-23', clientId: null, isValidated: true,
    items: [{ produitId: 2, quantite: 2 }, { produitId: 6, quantite: 1 }],
  },
  {
    id: 3, date: '2026-04-24', clientId: 2, isValidated: false,
    items: [{ produitId: 4, quantite: 1 }],
  },
]

export let inventaires = [
  { id: 1, date: '2026-04-24', produitId: 4, quantitePhysique: 7, stockTheorique: 6, ecart: 1, isValidated: true },
]

export let depenses = [
  { id: 1, date: '2026-04-22', chargeId: 1, montant: 12000, notes: 'Renouvellement du linge cabine', isValidated: true },
  { id: 2, date: '2026-04-24', chargeId: 2, montant: 18000, notes: '', isValidated: false },
]

export let recettes = [
  { id: 1, date: '2026-04-22', clientId: 1, prestationId: 1, prixApplique: 8000, notes: '', isValidated: true },
  { id: 2, date: '2026-04-23', clientId: null, prestationId: 3, prixApplique: 35000, notes: 'Coloration + soin inclus', isValidated: true },
  { id: 3, date: '2026-04-24', clientId: 2, prestationId: 2, prixApplique: 22000, notes: '', isValidated: false },
]

export let historique = [
  { id: 1, titre: 'Arrivage valide', description: 'Reception de 34 unites depuis Beauty Source.', date: '2026-04-20T09:15:00' },
  { id: 2, titre: 'Vente validee', description: 'Sortie de 3 unites sur 2 produits.', date: '2026-04-22T12:10:00' },
  { id: 3, titre: 'Inventaire enregistre', description: 'Ecart positif de 1 unite sur Coloration Chatain.', date: '2026-04-24T08:45:00' },
]

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function nextId(col) { return Math.max(...col.map((i) => i.id), 0) + 1 }
function findProduit(id) { return produits.find((p) => p.id === id) }
function findType(id) { return typesProduits.find((t) => t.id === id) }
function findFournisseur(id) { return fournisseurs.find((f) => f.id === id) }
function findCharge(id) { return charges.find((c) => c.id === id) }
function findClient(id) { return clients.find((c) => c.id === id) }

function appendHistorique(titre, description, date = todayIso) {
  historique = [...historique, { id: nextId(historique), titre, description, date: date.includes('T') ? date : `${date}T09:00:00` }]
}

function normalizeDate(date) { return date || new Date().toISOString().slice(0, 10) }

function normalizeItems(items) {
  const merged = new Map()
  items.forEach((item) => {
    const produitId = Number(item.produitId)
    const quantite = Number(item.quantite)
    const fournisseurId = Number(item.fournisseurId) || null
    const prixVente = item.prixVente != null ? Number(item.prixVente) : null
    if (!produitId || quantite <= 0) return
    const existing = merged.get(produitId)
    merged.set(produitId, {
      produitId,
      quantite: (existing?.quantite || 0) + quantite,
      fournisseurId,
      ...(prixVente != null ? { prixVente } : {}),
    })
  })
  return [...merged.values()]
}

function computeStocks() {
  const stocks = Object.fromEntries(produits.map((p) => [p.id, 0]))
  ;[...arrivages].filter((a) => a.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((a) => a.items.forEach((i) => { stocks[i.produitId] = (stocks[i.produitId] || 0) + i.quantite }))
  ;[...ventes].filter((v) => v.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((v) => v.items.forEach((i) => { stocks[i.produitId] = (stocks[i.produitId] || 0) - i.quantite }))
  ;[...inventaires].filter((i) => i.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((i) => { stocks[i.produitId] = (stocks[i.produitId] || 0) + i.ecart })
  return stocks
}

function enrichProduit(p) {
  const stocks = computeStocks()
  const type = findType(p.typeId)
  return { ...p, typeNom: type?.nom || 'Sans type', stock: stocks[p.id] || 0 }
}

function enrichItems(items) {
  return items.map((item) => {
    const p = findProduit(item.produitId)
    // Utilise le prix de vente saisi si fourni, sinon le prix catalogue du produit
    const prixUnitaire = item.prixVente != null ? item.prixVente : (p?.prix || 0)
    return { ...item, produitNom: p?.nom || 'Produit inconnu', prixUnitaire, total: prixUnitaire * item.quantite }
  })
}

function enrichArrivage(arrivage) {
  const items = enrichItems(arrivage.items).map((item) => ({
    ...item, fournisseurNom: item.fournisseurId ? findFournisseur(item.fournisseurId)?.nom || '-' : '-',
  }))
  const fournisseurNoms = [...new Set(arrivage.items.map((i) => i.fournisseurId).filter(Boolean).map((id) => findFournisseur(id)?.nom).filter(Boolean))]
  return { ...arrivage, fournisseurNoms, items, totalQuantite: items.reduce((t, i) => t + i.quantite, 0) }
}

function enrichVente(vente) {
  const items = enrichItems(vente.items)
  const client = vente.clientId ? findClient(vente.clientId) : null
  return { ...vente, clientNom: client?.nom || null, items, totalQuantite: items.reduce((t, i) => t + i.quantite, 0), total: items.reduce((t, i) => t + i.total, 0) }
}

function enrichInventaire(inv) {
  const p = findProduit(inv.produitId)
  return { ...inv, produitNom: p?.nom || 'Produit inconnu', stockApresInventaire: inv.stockTheorique + inv.ecart }
}

function enrichDepense(d) {
  return { ...d, chargeNom: findCharge(d.chargeId)?.nom || '-', isValidated: d.isValidated ?? false }
}

function findPrestation(id) { return prestations.find((p) => p.id === id) }

function enrichRecette(r) {
  const prestation = findPrestation(r.prestationId)
  const client = r.clientId ? findClient(r.clientId) : null
  return {
    ...r,
    prestationNom: prestation?.nom || 'Prestation inconnue',
    prixReference: prestation?.prix || 0,
    clientNom: client?.nom || null,
  }
}

function invalidateStockForSale(items) {
  const stocks = computeStocks()
  items.forEach((item) => {
    const p = findProduit(item.produitId)
    if (!p) throw new Error('Produit introuvable')
    if (!p.actif) throw new Error(`${p.nom} est desactive`)
    if ((stocks[item.produitId] || 0) < item.quantite) throw new Error(`Stock insuffisant pour ${p.nom}`)
    stocks[item.produitId] = (stocks[item.produitId] || 0) - item.quantite
  })
}

function nameExists(col, nom) { return col.some((i) => i.nom.toLowerCase() === nom.toLowerCase()) }

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getStats() {
  const stocks = computeStocks()
  const today = new Date().toISOString().slice(0, 10)
  const enrichedProducts = produits.map(enrichProduit)

  // Stats du jour
  const ventesDuJour = ventes.filter((v) => v.isValidated && v.date === today).map(enrichVente)
  const recettesDuJour = recettes.filter((r) => r.isValidated && r.date === today)
  const depensesJour = depenses.filter((d) => d.isValidated && d.date === today).reduce((t, d) => t + d.montant, 0)

  // État de caisse — cumul total depuis le début (uniquement validés)
  const totalVentesAll = ventes.filter((v) => v.isValidated).map(enrichVente).reduce((t, v) => t + v.total, 0)
  const totalRecettesAll = recettes.filter((r) => r.isValidated).reduce((t, r) => t + r.prixApplique, 0)
  const totalDepensesAll = depenses.filter((d) => d.isValidated).reduce((t, d) => t + d.montant, 0)

  return {
    ventesJour: ventesDuJour.reduce((t, v) => t + v.total, 0),
    nombreVentesJour: ventesDuJour.length,
    recettesJour: recettesDuJour.reduce((t, r) => t + r.prixApplique, 0),
    nombreRecettesJour: recettesDuJour.length,
    depensesJour,
    etatCaisse: totalVentesAll + totalRecettesAll - totalDepensesAll,
    produitsStockFaible: enrichedProducts.filter((p) => p.actif && p.stock <= 5),
    totalProduits: enrichedProducts.length,
    totalProduitsActifs: enrichedProducts.filter((p) => p.actif).length,
    stockTotal: Object.values(stocks).reduce((t, v) => t + v, 0),
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  getProduits: () => Promise.resolve(produits.map(enrichProduit)),
  addProduit: (payload) => {
    const nom = payload.nom?.trim()
    const typeId = Number(payload.typeId)
    if (!nom) return Promise.reject(new Error('Le libelle est obligatoire'))
    if (!findType(typeId)) return Promise.reject(new Error('Type invalide'))
    const p = { id: nextId(produits), nom, typeId, prix: Number(payload.prix || 0), actif: payload.actif ?? true }
    produits = [...produits, p]
    return Promise.resolve(enrichProduit(p))
  },
  deleteProduit: (id) => {
    const p = produits.find((i) => i.id === id)
    if (!p) return Promise.reject(new Error('Introuvable'))
    produits = produits.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Produit supprime' })
  },

  toggleProduitActif: (id) => {
    let u = null
    produits = produits.map((p) => { if (p.id !== id) return p; u = { ...p, actif: !p.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(enrichProduit(u))
  },

  updateProduit: ({ id, nom, typeId, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (!findType(typeId)) return Promise.reject(new Error('Type invalide'))
    let updated = null
    produits = produits.map((p) => {
      if (p.id !== id) return p
      updated = { ...p, nom: t, typeId: Number(typeId), prix: Number(prix || 0) }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Produit introuvable'))
    return Promise.resolve(enrichProduit(updated))
  },
  deleteProduit: (id) => {
    produits = produits.filter((p) => p.id !== id)
    return Promise.resolve({ message: 'Produit supprime' })
  },

  getFournisseurs: () => Promise.resolve([...fournisseurs]),
  addFournisseur: ({ nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(fournisseurs, t)) return Promise.reject(new Error('Existe deja'))
    const f = { id: nextId(fournisseurs), nom: t, actif: true, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }
    fournisseurs = [...fournisseurs, f]
    return Promise.resolve(f)
  },
  toggleFournisseurActif: (id) => {
    let u = null
    fournisseurs = fournisseurs.map((f) => { if (f.id !== id) return f; u = { ...f, actif: !f.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },

  getTypesProduits: () => Promise.resolve([...typesProduits]),
  addTypeProduit: ({ nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(typesProduits, t)) return Promise.reject(new Error('Existe deja'))
    const type = { id: nextId(typesProduits), nom: t, actif: true, fournisseurIds: [] }
    typesProduits = [...typesProduits, type]
    return Promise.resolve(type)
  },
  toggleTypeProduitActif: (id) => {
    let u = null
    typesProduits = typesProduits.map((t) => { if (t.id !== id) return t; u = { ...t, actif: !t.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },
  updateTypeFournisseurs: ({ typeId, fournisseurIds }) => {
    let u = null
    typesProduits = typesProduits.map((t) => { if (t.id !== Number(typeId)) return t; u = { ...t, fournisseurIds: fournisseurIds.map(Number) }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },

  getPrestations: () => Promise.resolve([...prestations]),
  addPrestation: ({ nom, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(prestations, t)) return Promise.reject(new Error('Existe deja'))
    const p = { id: nextId(prestations), nom: t, prix: Number(prix || 0), actif: true }
    prestations = [...prestations, p]
    return Promise.resolve(p)
  },
  togglePrestationActif: (id) => {
    let u = null
    prestations = prestations.map((p) => { if (p.id !== id) return p; u = { ...p, actif: !p.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },

  getCharges: () => Promise.resolve([...charges]),
  addCharge: ({ nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(charges, t)) return Promise.reject(new Error('Existe deja'))
    const c = { id: nextId(charges), nom: t, actif: true }
    charges = [...charges, c]
    return Promise.resolve(c)
  },
  toggleChargeActif: (id) => {
    let u = null
    charges = charges.map((c) => { if (c.id !== id) return c; u = { ...c, actif: !c.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },

  getClients: () => Promise.resolve([...clients]),
  addClient: ({ nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(clients, t)) return Promise.reject(new Error('Existe deja'))
    const c = { id: nextId(clients), nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }
    clients = [...clients, c]
    return Promise.resolve(c)
  },

  getArrivages: () => Promise.resolve(arrivages.map(enrichArrivage)),
  addArrivage: ({ date, items, isValidated }) => {
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    const miss = norm.find((i) => !i.fournisseurId)
    if (miss) return Promise.reject(new Error(`Fournisseur manquant pour : ${findProduit(miss.produitId)?.nom}`))
    for (const item of norm) {
      const p = findProduit(item.produitId)
      if (!p) return Promise.reject(new Error('Produit introuvable'))
      const type = findType(p.typeId)
      if (type && !type.fournisseurIds.includes(item.fournisseurId)) {
        return Promise.reject(new Error(`${findFournisseur(item.fournisseurId)?.nom} non autorise pour "${type.nom}"`))
      }
    }
    const a = { id: nextId(arrivages), date: normalizeDate(date), items: norm, isValidated: Boolean(isValidated) }
    arrivages = [...arrivages, a]
    const fNoms = [...new Set(norm.map((i) => findFournisseur(i.fournisseurId)?.nom).filter(Boolean))]
    appendHistorique(a.isValidated ? 'Arrivage valide' : 'Arrivage en attente', `${a.items.length} produit(s) — ${fNoms.join(', ')}.`, `${a.date}T10:00:00`)
    return Promise.resolve(enrichArrivage(a))
  },
  updateArrivage: ({ id, date, fournisseurId, items }) => {
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    let updated = null
    arrivages = arrivages.map((a) => {
      if (a.id !== id) return a
      updated = { ...a, date: normalizeDate(date), items: norm.map((i) => ({ ...i, fournisseurId: Number(fournisseurId) })) }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Arrivage introuvable'))
    return Promise.resolve(enrichArrivage(updated))
  },
  

  getVentes: () => Promise.resolve(ventes.map(enrichVente)),
  addVente: ({ date, clientId, items, isValidated }) => {
    const norm = normalizeItems(items || [])
    // condition qui retourne qu'on doit ajouter un produit s'il n'en existe pas
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    // 
    if (isValidated) { 
      try { 
        invalidateStockForSale(norm) 
      } catch (e) { 
        return Promise.reject(e) 
      } 
    }
    const v = { id: nextId(ventes), date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, items: norm, isValidated: Boolean(isValidated) }
    ventes = [...ventes, v]
    // ajout de l'action dans l'historique
    appendHistorique(v.isValidated ? 'Vente validee' : 'Vente en attente', `${v.items.length} produit(s) — ${enrichVente(v).total.toLocaleString('fr-FR')} FCFA.`, `${v.date}T13:00:00`)
    return Promise.resolve(enrichVente(v))
  },
  updateVente: ({ id, date, clientId, items }) => {
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    let updated = null
    ventes = ventes.map((v) => {
      if (v.id !== id) return v
      updated = { ...v, date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, items: norm }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Vente introuvable'))
    return Promise.resolve(enrichVente(updated))
  },

  getInventaires: () => Promise.resolve(inventaires.map(enrichInventaire)),
  addInventaire: ({ date, produitId, quantitePhysique }) => {
    const pid = Number(produitId)
    const qty = Number(quantitePhysique)
    const p = findProduit(pid)
    if (!p) return Promise.reject(new Error('Produit introuvable'))
    if (qty < 0) return Promise.reject(new Error('Quantite negative'))
    const stocks = computeStocks()
    const stockTheorique = stocks[pid] || 0
    const ecart = qty - stockTheorique
    const inv = { id: nextId(inventaires), date: normalizeDate(date), produitId: pid, quantitePhysique: qty, stockTheorique, ecart, isValidated: true }
    inventaires = [...inventaires, inv]
    appendHistorique('Inventaire enregistre', `${p.nom}: theorique ${stockTheorique}, compte ${qty}, ecart ${ecart}.`, `${inv.date}T08:30:00`)
    return Promise.resolve(enrichInventaire(inv))
  },
  updateInventaire: ({ id, date, produitId, quantitePhysique }) => {
    const pid = Number(produitId)
    const qty = Number(quantitePhysique)
    const produit = findProduit(pid)
    if (!produit) return Promise.reject(new Error('Produit introuvable'))
    if (qty < 0) return Promise.reject(new Error('Quantite negative'))
    const stocks = computeStocks()
    const stockTheorique = stocks[pid] || 0
    const ecart = qty - stockTheorique
    let updated = null
    inventaires = inventaires.map((inv) => {
      if (inv.id !== id) return inv
      updated = { ...inv, date: normalizeDate(date), produitId: pid, quantitePhysique: qty, stockTheorique, ecart }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Inventaire introuvable'))
    return Promise.resolve(enrichInventaire(updated))
  },

  getDepenses: () => Promise.resolve(depenses.map(enrichDepense)),
  addDepense: ({ date, chargeId, montant, notes, isValidated }) => {
    const cid = Number(chargeId)
    const m = Number(montant)
    if (!cid || !findCharge(cid)) return Promise.reject(new Error('Selectionnez une charge'))
    if (!m || m <= 0) return Promise.reject(new Error('Montant invalide'))
    const d = { id: nextId(depenses), date: normalizeDate(date), chargeId: cid, montant: m, notes: notes?.trim() || '', isValidated: Boolean(isValidated) }
    depenses = [...depenses, d]
    appendHistorique(
      d.isValidated ? 'Depense validee' : 'Depense en attente',
      `${findCharge(cid)?.nom} — ${m.toLocaleString('fr-FR')} FCFA.`,
      `${d.date}T15:00:00`,
    )
    return Promise.resolve(enrichDepense(d))
  },
  updateDepense: ({ id, date, chargeId, montant, notes }) => {
    const cid = Number(chargeId)
    const m = Number(montant)
    if (!cid || !findCharge(cid)) return Promise.reject(new Error('Selectionnez une charge'))
    if (!m || m <= 0) return Promise.reject(new Error('Montant invalide'))
    let updated = null
    depenses = depenses.map((d) => {
      if (d.id !== id) return d
      updated = { ...d, date: normalizeDate(date), chargeId: cid, montant: m, notes: notes?.trim() || '' }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Depense introuvable'))
    return Promise.resolve(enrichDepense(updated))
  },

  validateDepense: (id) => {
    const depense = depenses.find((d) => d.id === id)
    if (!depense) return Promise.reject(new Error('Depense introuvable'))
    if (depense.isValidated) return Promise.reject(new Error('Cette depense est deja validee'))
    depenses = depenses.map((d) => d.id === id ? { ...d, isValidated: true } : d)
    const enriched = enrichDepense(depenses.find((d) => d.id === id))
    appendHistorique('Depense validee', `${findCharge(depense.chargeId)?.nom} — ${depense.montant.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },

  getRecettes: () => Promise.resolve(recettes.map(enrichRecette)),
  addRecette: ({ date, clientId, prestationId, prixApplique, notes, isValidated }) => {
    const prestation = findPrestation(Number(prestationId))
    if (!prestation) return Promise.reject(new Error('Prestation introuvable'))
    if (!prestation.actif) return Promise.reject(new Error(`${prestation.nom} est desactivee`))
    const prix = Number(prixApplique)
    if (prix < 0) return Promise.reject(new Error('Prix invalide'))
    const r = {
      id: nextId(recettes),
      date: normalizeDate(date),
      clientId: clientId ? Number(clientId) : null,
      prestationId: Number(prestationId),
      prixApplique: prix,
      notes: notes?.trim() || '',
      isValidated: Boolean(isValidated),
    }
    recettes = [...recettes, r]
    const client = r.clientId ? findClient(r.clientId) : null
    appendHistorique(
      r.isValidated ? 'Recette validee' : 'Recette en attente',
      `${prestation.nom}${client ? ` — ${client.nom}` : ''} — ${prix.toLocaleString('fr-FR')} FCFA.`,
      `${r.date}T14:00:00`,
    )
    return Promise.resolve(enrichRecette(r))
  },
  updateRecette: ({ id, date, clientId, prestationId, prixApplique, notes }) => {
    const pid = Number(prestationId)
    const prix = Number(prixApplique)
    const prestation = findPrestation(pid)
    if (!prestation) return Promise.reject(new Error('Prestation introuvable'))
    if (prix < 0) return Promise.reject(new Error('Prix invalide'))
    let updated = null
    recettes = recettes.map((r) => {
      if (r.id !== id) return r
      updated = { ...r, date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, prestationId: pid, prixApplique: prix, notes: notes?.trim() || '' }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Recette introuvable'))
    return Promise.resolve(enrichRecette(updated))
  },

  // ── Suppression référentiels ─────────────────────────────────────────────
  deleteFournisseur: (id) => {
    const f = fournisseurs.find((i) => i.id === id)
    if (!f) return Promise.reject(new Error('Introuvable'))
    fournisseurs = fournisseurs.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Fournisseur supprime' })
  },
  deleteTypeProduit: (id) => {
    const t = typesProduits.find((i) => i.id === id)
    if (!t) return Promise.reject(new Error('Introuvable'))
    typesProduits = typesProduits.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Type supprime' })
  },
  deletePrestation: (id) => {
    const p = prestations.find((i) => i.id === id)
    if (!p) return Promise.reject(new Error('Introuvable'))
    prestations = prestations.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Prestation supprimee' })
  },
  deleteCharge: (id) => {
    const c = charges.find((i) => i.id === id)
    if (!c) return Promise.reject(new Error('Introuvable'))
    charges = charges.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Charge supprimee' })
  },
  toggleClientActif: (id) => {
    let u = null
    clients = clients.map((c) => { if (c.id !== id) return c; u = { ...c, actif: !c.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(u)
  },

  deleteClient: (id) => {
    const c = clients.find((i) => i.id === id)
    if (!c) return Promise.reject(new Error('Introuvable'))
    clients = clients.filter((i) => i.id !== id)
    return Promise.resolve({ message: 'Client supprime' })
  },

  // ── Modification référentiels ─────────────────────────────────────────────
  updateFournisseur: ({ id, nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    fournisseurs = fournisseurs.map((f) => { if (f.id !== id) return f; updated = { ...f, nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(updated)
  },
  updateTypeProduit: ({ id, nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    typesProduits = typesProduits.map((tp) => { if (tp.id !== id) return tp; updated = { ...tp, nom: t }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(updated)
  },
  updatePrestation: ({ id, nom, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    prestations = prestations.map((p) => { if (p.id !== id) return p; updated = { ...p, nom: t, prix: Number(prix || 0) }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(updated)
  },
  updateCharge: ({ id, nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    charges = charges.map((c) => { if (c.id !== id) return c; updated = { ...c, nom: t }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(updated)
  },
  updateClient: ({ id, nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    clients = clients.map((c) => { if (c.id !== id) return c; updated = { ...c, nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    return Promise.resolve(updated)
  },

  // ── Suppression documents en attente ──────────────────────────────────────
  deleteArrivage: (id) => {
    const a = arrivages.find((i) => i.id === id)
    if (!a) return Promise.reject(new Error('Introuvable'))
    if (a.isValidated) return Promise.reject(new Error('Un arrivage valide ne peut pas etre supprime'))
    arrivages = arrivages.filter((i) => i.id !== id)
    appendHistorique('Arrivage supprime', `Arrivage #${id} supprime.`, new Date().toISOString())
    return Promise.resolve({ message: 'Arrivage supprime' })
  },
  deleteVente: (id) => {
    const v = ventes.find((i) => i.id === id)
    if (!v) return Promise.reject(new Error('Introuvable'))
    if (v.isValidated) return Promise.reject(new Error('Une vente validee ne peut pas etre supprimee'))
    ventes = ventes.filter((i) => i.id !== id)
    appendHistorique('Vente supprimee', `Vente #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Vente supprimee' })
  },
  deleteRecette: (id) => {
    const r = recettes.find((i) => i.id === id)
    if (!r) return Promise.reject(new Error('Introuvable'))
    if (r.isValidated) return Promise.reject(new Error('Une recette validee ne peut pas etre supprimee'))
    recettes = recettes.filter((i) => i.id !== id)
    appendHistorique('Recette supprimee', `Recette #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Recette supprimee' })
  },
  deleteDepense: (id) => {
    const d = depenses.find((i) => i.id === id)
    if (!d) return Promise.reject(new Error('Introuvable'))
    if (d.isValidated) return Promise.reject(new Error('Une depense validee ne peut pas etre supprimee'))
    depenses = depenses.filter((i) => i.id !== id)
    appendHistorique('Depense supprimee', `Depense #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Depense supprimee' })
  },

  getStats: () => Promise.resolve(getStats()),
  getHistorique: () => Promise.resolve([...historique]),

  validateVente: (id) => {
    const vente = ventes.find((v) => v.id === id)
    if (!vente) return Promise.reject(new Error('Vente introuvable'))
    if (vente.isValidated) return Promise.reject(new Error('Cette vente est deja validee'))
    try { invalidateStockForSale(vente.items) } catch (e) { return Promise.reject(e) }
    ventes = ventes.map((v) => v.id === id ? { ...v, isValidated: true } : v)
    const enriched = enrichVente(ventes.find((v) => v.id === id))
    appendHistorique('Vente validee', `${vente.items.length} produit(s) — ${enriched.total.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },

  validateRecette: (id) => {
    const recette = recettes.find((r) => r.id === id)
    if (!recette) return Promise.reject(new Error('Recette introuvable'))
    if (recette.isValidated) return Promise.reject(new Error('Cette recette est deja validee'))
    recettes = recettes.map((r) => r.id === id ? { ...r, isValidated: true } : r)
    const enriched = enrichRecette(recettes.find((r) => r.id === id))
    const prestation = findPrestation(recette.prestationId)
    const client = recette.clientId ? findClient(recette.clientId) : null
    appendHistorique('Recette validee', `${prestation?.nom || 'Prestation'}${client ? ` — ${client.nom}` : ''} — ${recette.prixApplique.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },

  validateArrivage: (id) => {
    const arrivage = arrivages.find((a) => a.id === id)
    if (!arrivage) return Promise.reject(new Error('Arrivage introuvable'))
    if (arrivage.isValidated) return Promise.reject(new Error('Cet arrivage est deja valide'))
    arrivages = arrivages.map((a) => a.id === id ? { ...a, isValidated: true } : a)
    const enriched = enrichArrivage(arrivages.find((a) => a.id === id))
    const fNoms = [...new Set(arrivage.items.map((i) => findFournisseur(i.fournisseurId)?.nom).filter(Boolean))]
    appendHistorique('Arrivage valide', `${arrivage.items.length} produit(s) — ${fNoms.join(', ')}.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },

  // ── Utilisateurs (admin seulement) ──────────────────────────────────────────
  getUsers: () => Promise.resolve([...mockUsers]),

  addUser: ({ name, pseudo, role, password }) => {
    const n = name?.trim()
    const p = pseudo?.trim()
    if (!n || !p) return Promise.reject(new Error('Nom et identifiant obligatoires'))
    if (!password || password.length < 8) return Promise.reject(new Error('Mot de passe trop court (8 caracteres min)'))
    if (mockUsers.some((u) => u.pseudo === p)) return Promise.reject(new Error('Cet identifiant existe deja'))
    const user = { id: nextId(mockUsers), name: n, pseudo: p, role: role || 'caissier' }
    mockUsers = [...mockUsers, user]
    return Promise.resolve(user)
  },

  updateUser: ({ id, name, pseudo, role }) => {
    const n = name?.trim()
    const p = pseudo?.trim()
    if (!n || !p) return Promise.reject(new Error('Nom et identifiant obligatoires'))
    if (mockUsers.some((u) => u.pseudo === p && u.id !== id)) return Promise.reject(new Error('Cet identifiant existe deja'))
    let updated = null
    mockUsers = mockUsers.map((u) => { if (u.id !== id) return u; updated = { ...u, name: n, pseudo: p, role }; return updated })
    if (!updated) return Promise.reject(new Error('Utilisateur introuvable'))
    return Promise.resolve(updated)
  },

  updateUserPassword: ({ id, password }) => {
    if (!password || password.length < 8) return Promise.reject(new Error('Mot de passe trop court (8 caracteres min)'))
    const user = mockUsers.find((u) => u.id === id)
    if (!user) return Promise.reject(new Error('Utilisateur introuvable'))
    return Promise.resolve({ message: 'Mot de passe mis a jour' })
  },

  deleteUser: (id) => {
    const user = mockUsers.find((u) => u.id === id)
    if (!user) return Promise.reject(new Error('Utilisateur introuvable'))
    mockUsers = mockUsers.filter((u) => u.id !== id)
    return Promise.resolve({ message: 'Utilisateur supprime' })
  },

  login: (pseudo, password) => {
    const users = [
      { id: 1, pseudo: 'admin',    password: 'admin@@webstock',     name: 'Admin Salon', role: 'admin' },
      { id: 2, pseudo: 'caissier', password: 'caissier@@webstock', name: 'Caissier',    role: 'caissier' },
    ]
    const user = users.find((u) => u.pseudo === pseudo && u.password === password)
    if (user) {
      const { password: _, ...safeUser } = user
      return Promise.resolve({ user: safeUser, token: 'mock-jwt-token-123' })
    }
    return Promise.reject(new Error('Identifiant ou mot de passe incorrect'))
  },
}