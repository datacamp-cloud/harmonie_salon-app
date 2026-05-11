import { load, save } from './storage'

// ─── Rôle de l'utilisateur connecté (mis à jour au login) ────────────────────
let currentUserRole = null
export function getCurrentRole() { return currentUserRole }
export function setCurrentRole(role) { currentUserRole = role }
export function isSuperAdmin() { return currentUserRole === 'superadmin' }

// ─── Données par défaut ───────────────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: 1, name: 'Admin Salon', pseudo: 'admin',    role: 'admin' },
  { id: 2, name: 'Caissiere',    pseudo: 'caissiere', role: 'caissiere' },
]

const DEFAULT_FOURNISSEURS   = []
const DEFAULT_TYPES_PRODUITS = []
const DEFAULT_PRESTATIONS    = []
const DEFAULT_CHARGES        = []
const DEFAULT_CLIENTS        = []
const DEFAULT_PRODUITS       = []
const DEFAULT_ARRIVAGES      = []
const DEFAULT_VENTES         = []
const DEFAULT_INVENTAIRES    = []
const DEFAULT_DEPENSES       = []
const DEFAULT_RECETTES       = []
const DEFAULT_HISTORIQUE     = []

// ─── Collections (chargées depuis localStorage) ───────────────────────────────
export let mockUsers      = load('users',        DEFAULT_USERS)
export let fournisseurs   = load('fournisseurs', DEFAULT_FOURNISSEURS)
export let typesProduits  = load('types',        DEFAULT_TYPES_PRODUITS)
export let prestations    = load('prestations',  DEFAULT_PRESTATIONS)
export let charges        = load('charges',      DEFAULT_CHARGES)
export let clients        = load('clients',      DEFAULT_CLIENTS)
export let produits       = load('produits',     DEFAULT_PRODUITS)
export let arrivages      = load('arrivages',    DEFAULT_ARRIVAGES)
export let ventes         = load('ventes',       DEFAULT_VENTES)
export let inventaires    = load('inventaires',  DEFAULT_INVENTAIRES)
export let depenses       = load('depenses',     DEFAULT_DEPENSES)
export let recettes       = load('recettes',     DEFAULT_RECETTES)
export let historique     = load('historique',   DEFAULT_HISTORIQUE)

// ─── Sauvegarde ───────────────────────────────────────────────────────────────
const persist = {
  users:        () => save('users',        mockUsers),
  fournisseurs: () => save('fournisseurs', fournisseurs),
  types:        () => save('types',        typesProduits),
  prestations:  () => save('prestations',  prestations),
  charges:      () => save('charges',      charges),
  clients:      () => save('clients',      clients),
  produits:     () => save('produits',     produits),
  arrivages:    () => save('arrivages',    arrivages),
  ventes:       () => save('ventes',       ventes),
  inventaires:  () => save('inventaires',  inventaires),
  depenses:     () => save('depenses',     depenses),
  recettes:     () => save('recettes',     recettes),
  historique:   () => save('historique',   historique),
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function nextId(col) { return Math.max(...col.map((i) => i.id), 0) + 1 }
function findProduit(id) { return produits.find((p) => p.id === id) }
function findType(id) { return typesProduits.find((t) => t.id === id) }
function findFournisseur(id) { return fournisseurs.find((f) => f.id === id) }
function findCharge(id) { return charges.find((c) => c.id === id) }
function findClient(id) { return clients.find((c) => c.id === id) }
function findPrestation(id) { return prestations.find((p) => p.id === id) }
function nameExists(col, nom) { return col.some((i) => i.nom.toLowerCase() === nom.toLowerCase()) }

function appendHistorique(titre, description, date = new Date().toISOString()) {
  historique = [...historique, { id: nextId(historique), titre, description, date: date.includes('T') ? date : `${date}T09:00:00` }]
  persist.historique()
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
    merged.set(produitId, { produitId, quantite: (existing?.quantite || 0) + quantite, fournisseurId, ...(prixVente != null ? { prixVente } : {}) })
  })
  return [...merged.values()]
}

function computeStocks() {
  const stocks = Object.fromEntries(produits.map((p) => [p.id, 0]))
  arrivages.filter((a) => a.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((a) => a.items.forEach((i) => { stocks[i.produitId] = (stocks[i.produitId] || 0) + i.quantite }))
  ventes.filter((v) => v.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .forEach((v) => v.items.forEach((i) => { stocks[i.produitId] = (stocks[i.produitId] || 0) - i.quantite }))
  inventaires.filter((i) => i.isValidated).sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
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
    const prixUnitaire = item.prixVente != null ? item.prixVente : (p?.prix || 0)
    return { ...item, produitNom: p?.nom || 'Produit inconnu', prixUnitaire, total: prixUnitaire * item.quantite }
  })
}

function enrichArrivage(a) {
  const items = enrichItems(a.items).map((item) => ({ ...item, fournisseurNom: item.fournisseurId ? findFournisseur(item.fournisseurId)?.nom || '-' : '-' }))
  const fournisseurNoms = [...new Set(a.items.map((i) => i.fournisseurId).filter(Boolean).map((id) => findFournisseur(id)?.nom).filter(Boolean))]
  return { ...a, fournisseurNoms, items, totalQuantite: items.reduce((t, i) => t + i.quantite, 0) }
}

function enrichVente(v) {
  const items = enrichItems(v.items)
  const client = v.clientId ? findClient(v.clientId) : null
  return { ...v, clientNom: client?.nom || null, items, totalQuantite: items.reduce((t, i) => t + i.quantite, 0), total: items.reduce((t, i) => t + i.total, 0) }
}

function enrichInventaire(inv) {
  const p = findProduit(inv.produitId)
  return { ...inv, produitNom: p?.nom || 'Produit inconnu', stockApresInventaire: inv.stockTheorique + inv.ecart }
}

function enrichDepense(d) {
  return { ...d, chargeNom: findCharge(d.chargeId)?.nom || '-', isValidated: d.isValidated ?? false }
}

function enrichRecette(r) {
  const prestation = findPrestation(r.prestationId)
  const client = r.clientId ? findClient(r.clientId) : null
  return { ...r, prestationNom: prestation?.nom || 'Prestation inconnue', prixReference: prestation?.prix || 0, clientNom: client?.nom || null }
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

// ─── Vérification permissions sur éléments validés ───────────────────────────
function canModifyValidated() { return isSuperAdmin() }

// ─── Stats ───────────────────────────────────────────────────────────────────
export function getStats() {
  const stocks = computeStocks()
  const today = new Date().toISOString().slice(0, 10)
  const enrichedProducts = produits.map(enrichProduit)
  const ventesDuJour = ventes.filter((v) => v.isValidated && v.date === today).map(enrichVente)
  const recettesDuJour = recettes.filter((r) => r.isValidated && r.date === today)
  const depensesJour = depenses.filter((d) => d.isValidated && d.date === today).reduce((t, d) => t + d.montant, 0)
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

  // ── Produits ──────────────────────────────────────────────────────────────
  getProduits: () => Promise.resolve(produits.map(enrichProduit)),
  addProduit: (payload) => {
    const nom = payload.nom?.trim()
    const typeId = Number(payload.typeId)
    if (!nom) return Promise.reject(new Error('Le libelle est obligatoire'))
    if (!findType(typeId)) return Promise.reject(new Error('Type invalide'))
    const p = { id: nextId(produits), nom, typeId, prix: Number(payload.prix || 0), actif: payload.actif ?? true }
    produits = [...produits, p]; persist.produits()
    return Promise.resolve(enrichProduit(p))
  },
  updateProduit: ({ id, nom, typeId, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (!findType(typeId)) return Promise.reject(new Error('Type invalide'))
    let updated = null
    produits = produits.map((p) => { if (p.id !== id) return p; updated = { ...p, nom: t, typeId: Number(typeId), prix: Number(prix || 0) }; return updated })
    if (!updated) return Promise.reject(new Error('Produit introuvable'))
    persist.produits()
    return Promise.resolve(enrichProduit(updated))
  },
  toggleProduitActif: (id) => {
    let u = null
    produits = produits.map((p) => { if (p.id !== id) return p; u = { ...p, actif: !p.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.produits()
    return Promise.resolve(enrichProduit(u))
  },
  deleteProduit: (id) => {
    produits = produits.filter((p) => p.id !== id); persist.produits()
    return Promise.resolve({ message: 'Produit supprime' })
  },

  // ── Fournisseurs ──────────────────────────────────────────────────────────
  getFournisseurs: () => Promise.resolve([...fournisseurs]),
  addFournisseur: ({ nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(fournisseurs, t)) return Promise.reject(new Error('Existe deja'))
    const f = { id: nextId(fournisseurs), nom: t, actif: true, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }
    fournisseurs = [...fournisseurs, f]; persist.fournisseurs()
    return Promise.resolve(f)
  },
  updateFournisseur: ({ id, nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    fournisseurs = fournisseurs.map((f) => { if (f.id !== id) return f; updated = { ...f, nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    persist.fournisseurs()
    return Promise.resolve(updated)
  },
  toggleFournisseurActif: (id) => {
    let u = null
    fournisseurs = fournisseurs.map((f) => { if (f.id !== id) return f; u = { ...f, actif: !f.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.fournisseurs()
    return Promise.resolve(u)
  },
  deleteFournisseur: (id) => {
    fournisseurs = fournisseurs.filter((i) => i.id !== id); persist.fournisseurs()
    return Promise.resolve({ message: 'Fournisseur supprime' })
  },

  // ── Types de produits ─────────────────────────────────────────────────────
  getTypesProduits: () => Promise.resolve([...typesProduits]),
  addTypeProduit: ({ nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(typesProduits, t)) return Promise.reject(new Error('Existe deja'))
    const type = { id: nextId(typesProduits), nom: t, actif: true, fournisseurIds: [] }
    typesProduits = [...typesProduits, type]; persist.types()
    return Promise.resolve(type)
  },
  updateTypeProduit: ({ id, nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    typesProduits = typesProduits.map((tp) => { if (tp.id !== id) return tp; updated = { ...tp, nom: t }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    persist.types()
    return Promise.resolve(updated)
  },
  toggleTypeProduitActif: (id) => {
    let u = null
    typesProduits = typesProduits.map((t) => { if (t.id !== id) return t; u = { ...t, actif: !t.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.types()
    return Promise.resolve(u)
  },
  updateTypeFournisseurs: ({ typeId, fournisseurIds }) => {
    let u = null
    typesProduits = typesProduits.map((t) => { if (t.id !== Number(typeId)) return t; u = { ...t, fournisseurIds: fournisseurIds.map(Number) }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.types()
    return Promise.resolve(u)
  },
  deleteTypeProduit: (id) => {
    typesProduits = typesProduits.filter((i) => i.id !== id); persist.types()
    return Promise.resolve({ message: 'Type supprime' })
  },

  // ── Prestations ───────────────────────────────────────────────────────────
  getPrestations: () => Promise.resolve([...prestations]),
  addPrestation: ({ nom, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(prestations, t)) return Promise.reject(new Error('Existe deja'))
    const p = { id: nextId(prestations), nom: t, prix: Number(prix || 0), actif: true }
    prestations = [...prestations, p]; persist.prestations()
    return Promise.resolve(p)
  },
  updatePrestation: ({ id, nom, prix }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    prestations = prestations.map((p) => { if (p.id !== id) return p; updated = { ...p, nom: t, prix: Number(prix || 0) }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    persist.prestations()
    return Promise.resolve(updated)
  },
  togglePrestationActif: (id) => {
    let u = null
    prestations = prestations.map((p) => { if (p.id !== id) return p; u = { ...p, actif: !p.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.prestations()
    return Promise.resolve(u)
  },
  deletePrestation: (id) => {
    prestations = prestations.filter((i) => i.id !== id); persist.prestations()
    return Promise.resolve({ message: 'Prestation supprimee' })
  },

  // ── Charges ───────────────────────────────────────────────────────────────
  getCharges: () => Promise.resolve([...charges]),
  addCharge: ({ nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(charges, t)) return Promise.reject(new Error('Existe deja'))
    const c = { id: nextId(charges), nom: t, actif: true }
    charges = [...charges, c]; persist.charges()
    return Promise.resolve(c)
  },
  updateCharge: ({ id, nom }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    charges = charges.map((c) => { if (c.id !== id) return c; updated = { ...c, nom: t }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    persist.charges()
    return Promise.resolve(updated)
  },
  toggleChargeActif: (id) => {
    let u = null
    charges = charges.map((c) => { if (c.id !== id) return c; u = { ...c, actif: !c.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.charges()
    return Promise.resolve(u)
  },
  deleteCharge: (id) => {
    charges = charges.filter((i) => i.id !== id); persist.charges()
    return Promise.resolve({ message: 'Charge supprimee' })
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  getClients: () => Promise.resolve([...clients]),
  addClient: ({ nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    if (nameExists(clients, t)) return Promise.reject(new Error('Existe deja'))
    const c = { id: nextId(clients), nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '', actif: true }
    clients = [...clients, c]; persist.clients()
    return Promise.resolve(c)
  },
  updateClient: ({ id, nom, telephone, localisation }) => {
    const t = nom?.trim()
    if (!t) return Promise.reject(new Error('Nom obligatoire'))
    let updated = null
    clients = clients.map((c) => { if (c.id !== id) return c; updated = { ...c, nom: t, telephone: telephone?.trim() || '', localisation: localisation?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Introuvable'))
    persist.clients()
    return Promise.resolve(updated)
  },
  toggleClientActif: (id) => {
    let u = null
    clients = clients.map((c) => { if (c.id !== id) return c; u = { ...c, actif: !c.actif }; return u })
    if (!u) return Promise.reject(new Error('Introuvable'))
    persist.clients()
    return Promise.resolve(u)
  },
  deleteClient: (id) => {
    clients = clients.filter((i) => i.id !== id); persist.clients()
    return Promise.resolve({ message: 'Client supprime' })
  },

  // ── Arrivages ─────────────────────────────────────────────────────────────
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
    arrivages = [...arrivages, a]; persist.arrivages()
    const fNoms = [...new Set(norm.map((i) => findFournisseur(i.fournisseurId)?.nom).filter(Boolean))]
    appendHistorique(a.isValidated ? 'Arrivage valide' : 'Arrivage en attente', `${a.items.length} produit(s) — ${fNoms.join(', ')}.`, `${a.date}T10:00:00`)
    return Promise.resolve(enrichArrivage(a))
  },
  updateArrivage: ({ id, date, fournisseurId, items }) => {
    const a = arrivages.find((i) => i.id === id)
    if (!a) return Promise.reject(new Error('Arrivage introuvable'))
    if (a.isValidated && !canModifyValidated()) return Promise.reject(new Error('Un arrivage valide ne peut pas etre modifie'))
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    let updated = null
    arrivages = arrivages.map((ar) => {
      if (ar.id !== id) return ar
      updated = { ...ar, date: normalizeDate(date), items: norm.map((i) => ({ ...i, fournisseurId: Number(fournisseurId) })) }
      return updated
    })
    if (!updated) return Promise.reject(new Error('Arrivage introuvable'))
    persist.arrivages()
    return Promise.resolve(enrichArrivage(updated))
  },
  validateArrivage: (id) => {
    const arrivage = arrivages.find((a) => a.id === id)
    if (!arrivage) return Promise.reject(new Error('Arrivage introuvable'))
    if (arrivage.isValidated) return Promise.reject(new Error('Cet arrivage est deja valide'))
    arrivages = arrivages.map((a) => a.id === id ? { ...a, isValidated: true } : a); persist.arrivages()
    const enriched = enrichArrivage(arrivages.find((a) => a.id === id))
    const fNoms = [...new Set(arrivage.items.map((i) => findFournisseur(i.fournisseurId)?.nom).filter(Boolean))]
    appendHistorique('Arrivage valide', `${arrivage.items.length} produit(s) — ${fNoms.join(', ')}.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },
  deleteArrivage: (id) => {
    const a = arrivages.find((i) => i.id === id)
    if (!a) return Promise.reject(new Error('Introuvable'))
    if (a.isValidated && !canModifyValidated()) return Promise.reject(new Error('Un arrivage valide ne peut pas etre supprime'))
    arrivages = arrivages.filter((i) => i.id !== id); persist.arrivages()
    appendHistorique('Arrivage supprime', `Arrivage #${id} supprime.`, new Date().toISOString())
    return Promise.resolve({ message: 'Arrivage supprime' })
  },

  // ── Ventes ────────────────────────────────────────────────────────────────
  getVentes: () => Promise.resolve(ventes.map(enrichVente)),
  addVente: ({ date, clientId, items, isValidated }) => {
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    if (isValidated) { try { invalidateStockForSale(norm) } catch (e) { return Promise.reject(e) } }
    const v = { id: nextId(ventes), date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, items: norm, isValidated: Boolean(isValidated) }
    ventes = [...ventes, v]; persist.ventes()
    appendHistorique(v.isValidated ? 'Vente validee' : 'Vente en attente', `${v.items.length} produit(s) — ${enrichVente(v).total.toLocaleString('fr-FR')} FCFA.`, `${v.date}T13:00:00`)
    return Promise.resolve(enrichVente(v))
  },
  updateVente: ({ id, date, clientId, items }) => {
    const v = ventes.find((i) => i.id === id)
    if (!v) return Promise.reject(new Error('Vente introuvable'))
    if (v.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une vente validee ne peut pas etre modifiee'))
    const norm = normalizeItems(items || [])
    if (norm.length === 0) return Promise.reject(new Error('Ajoutez au moins un produit'))
    let updated = null
    ventes = ventes.map((ve) => { if (ve.id !== id) return ve; updated = { ...ve, date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, items: norm }; return updated })
    if (!updated) return Promise.reject(new Error('Vente introuvable'))
    persist.ventes()
    return Promise.resolve(enrichVente(updated))
  },
  validateVente: (id) => {
    const vente = ventes.find((v) => v.id === id)
    if (!vente) return Promise.reject(new Error('Vente introuvable'))
    if (vente.isValidated) return Promise.reject(new Error('Cette vente est deja validee'))
    try { invalidateStockForSale(vente.items) } catch (e) { return Promise.reject(e) }
    ventes = ventes.map((v) => v.id === id ? { ...v, isValidated: true } : v); persist.ventes()
    const enriched = enrichVente(ventes.find((v) => v.id === id))
    appendHistorique('Vente validee', `${vente.items.length} produit(s) — ${enriched.total.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },
  deleteVente: (id) => {
    const v = ventes.find((i) => i.id === id)
    if (!v) return Promise.reject(new Error('Introuvable'))
    if (v.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une vente validee ne peut pas etre supprimee'))
    ventes = ventes.filter((i) => i.id !== id); persist.ventes()
    appendHistorique('Vente supprimee', `Vente #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Vente supprimee' })
  },

  // ── Recettes ──────────────────────────────────────────────────────────────
  getRecettes: () => Promise.resolve(recettes.map(enrichRecette)),
  addRecette: ({ date, clientId, prestationId, prixApplique, notes, isValidated }) => {
    const prestation = findPrestation(Number(prestationId))
    if (!prestation) return Promise.reject(new Error('Prestation introuvable'))
    if (!prestation.actif) return Promise.reject(new Error(`${prestation.nom} est desactivee`))
    const prix = Number(prixApplique)
    if (prix < 0) return Promise.reject(new Error('Prix invalide'))
    const r = { id: nextId(recettes), date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, prestationId: Number(prestationId), prixApplique: prix, notes: notes?.trim() || '', isValidated: Boolean(isValidated) }
    recettes = [...recettes, r]; persist.recettes()
    const client = r.clientId ? findClient(r.clientId) : null
    appendHistorique(r.isValidated ? 'Recette validee' : 'Recette en attente', `${prestation.nom}${client ? ` — ${client.nom}` : ''} — ${prix.toLocaleString('fr-FR')} FCFA.`, `${r.date}T14:00:00`)
    return Promise.resolve(enrichRecette(r))
  },
  updateRecette: ({ id, date, clientId, prestationId, prixApplique, notes }) => {
    const r = recettes.find((i) => i.id === id)
    if (!r) return Promise.reject(new Error('Recette introuvable'))
    if (r.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une recette validee ne peut pas etre modifiee'))
    const pid = Number(prestationId)
    const prix = Number(prixApplique)
    const prestation = findPrestation(pid)
    if (!prestation) return Promise.reject(new Error('Prestation introuvable'))
    if (prix < 0) return Promise.reject(new Error('Prix invalide'))
    let updated = null
    recettes = recettes.map((re) => { if (re.id !== id) return re; updated = { ...re, date: normalizeDate(date), clientId: clientId ? Number(clientId) : null, prestationId: pid, prixApplique: prix, notes: notes?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Recette introuvable'))
    persist.recettes()
    return Promise.resolve(enrichRecette(updated))
  },
  validateRecette: (id) => {
    const recette = recettes.find((r) => r.id === id)
    if (!recette) return Promise.reject(new Error('Recette introuvable'))
    if (recette.isValidated) return Promise.reject(new Error('Cette recette est deja validee'))
    recettes = recettes.map((r) => r.id === id ? { ...r, isValidated: true } : r); persist.recettes()
    const enriched = enrichRecette(recettes.find((r) => r.id === id))
    const prestation = findPrestation(recette.prestationId)
    const client = recette.clientId ? findClient(recette.clientId) : null
    appendHistorique('Recette validee', `${prestation?.nom || 'Prestation'}${client ? ` — ${client.nom}` : ''} — ${recette.prixApplique.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },
  deleteRecette: (id) => {
    const r = recettes.find((i) => i.id === id)
    if (!r) return Promise.reject(new Error('Introuvable'))
    if (r.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une recette validee ne peut pas etre supprimee'))
    recettes = recettes.filter((i) => i.id !== id); persist.recettes()
    appendHistorique('Recette supprimee', `Recette #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Recette supprimee' })
  },

  // ── Dépenses ──────────────────────────────────────────────────────────────
  getDepenses: () => Promise.resolve(depenses.map(enrichDepense)),
  addDepense: ({ date, chargeId, montant, notes, isValidated }) => {
    const cid = Number(chargeId)
    const m = Number(montant)
    if (!cid || !findCharge(cid)) return Promise.reject(new Error('Selectionnez une charge'))
    if (!m || m <= 0) return Promise.reject(new Error('Montant invalide'))
    const d = { id: nextId(depenses), date: normalizeDate(date), chargeId: cid, montant: m, notes: notes?.trim() || '', isValidated: Boolean(isValidated) }
    depenses = [...depenses, d]; persist.depenses()
    appendHistorique(d.isValidated ? 'Depense validee' : 'Depense en attente', `${findCharge(cid)?.nom} — ${m.toLocaleString('fr-FR')} FCFA.`, `${d.date}T15:00:00`)
    return Promise.resolve(enrichDepense(d))
  },
  updateDepense: ({ id, date, chargeId, montant, notes }) => {
    const d = depenses.find((i) => i.id === id)
    if (!d) return Promise.reject(new Error('Depense introuvable'))
    if (d.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une depense validee ne peut pas etre modifiee'))
    const cid = Number(chargeId)
    const m = Number(montant)
    if (!cid || !findCharge(cid)) return Promise.reject(new Error('Selectionnez une charge'))
    if (!m || m <= 0) return Promise.reject(new Error('Montant invalide'))
    let updated = null
    depenses = depenses.map((dep) => { if (dep.id !== id) return dep; updated = { ...dep, date: normalizeDate(date), chargeId: cid, montant: m, notes: notes?.trim() || '' }; return updated })
    if (!updated) return Promise.reject(new Error('Depense introuvable'))
    persist.depenses()
    return Promise.resolve(enrichDepense(updated))
  },
  validateDepense: (id) => {
    const depense = depenses.find((d) => d.id === id)
    if (!depense) return Promise.reject(new Error('Depense introuvable'))
    if (depense.isValidated) return Promise.reject(new Error('Cette depense est deja validee'))
    depenses = depenses.map((d) => d.id === id ? { ...d, isValidated: true } : d); persist.depenses()
    const enriched = enrichDepense(depenses.find((d) => d.id === id))
    appendHistorique('Depense validee', `${findCharge(depense.chargeId)?.nom} — ${depense.montant.toLocaleString('fr-FR')} FCFA.`, new Date().toISOString())
    return Promise.resolve(enriched)
  },
  deleteDepense: (id) => {
    const d = depenses.find((i) => i.id === id)
    if (!d) return Promise.reject(new Error('Introuvable'))
    if (d.isValidated && !canModifyValidated()) return Promise.reject(new Error('Une depense validee ne peut pas etre supprimee'))
    depenses = depenses.filter((i) => i.id !== id); persist.depenses()
    appendHistorique('Depense supprimee', `Depense #${id} supprimee.`, new Date().toISOString())
    return Promise.resolve({ message: 'Depense supprimee' })
  },

  // ── Inventaires ───────────────────────────────────────────────────────────
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
    inventaires = [...inventaires, inv]; persist.inventaires()
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
    inventaires = inventaires.map((inv) => { if (inv.id !== id) return inv; updated = { ...inv, date: normalizeDate(date), produitId: pid, quantitePhysique: qty, stockTheorique, ecart }; return updated })
    if (!updated) return Promise.reject(new Error('Inventaire introuvable'))
    persist.inventaires()
    return Promise.resolve(enrichInventaire(updated))
  },

  // ── Stats & Historique ────────────────────────────────────────────────────
  getStats: () => Promise.resolve(getStats()),
  getHistorique: () => Promise.resolve([...historique]),

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  // Le superadmin n'est PAS dans mockUsers — invisible pour l'admin du salon
  getUsers: () => Promise.resolve([...mockUsers]),

  addUser: ({ name, pseudo, role, password }) => {
    const n = name?.trim()
    const p = pseudo?.trim()
    if (!n || !p) return Promise.reject(new Error('Nom et identifiant obligatoires'))
    if (!password || password.length < 8) return Promise.reject(new Error('Mot de passe trop court (8 caracteres min)'))
    if (mockUsers.some((u) => u.pseudo === p)) return Promise.reject(new Error('Cet identifiant existe deja'))
    // Bloquer la création d'un compte superadmin depuis l'interface
    if (role === 'superadmin') return Promise.reject(new Error('Role non autorise'))
    const user = { id: nextId(mockUsers), name: n, pseudo: p, role: role || 'caissier' }
    mockUsers = [...mockUsers, user]; persist.users()
    return Promise.resolve(user)
  },

  updateUser: ({ id, name, pseudo, role }) => {
    const n = name?.trim()
    const p = pseudo?.trim()
    if (!n || !p) return Promise.reject(new Error('Nom et identifiant obligatoires'))
    if (mockUsers.some((u) => u.pseudo === p && u.id !== id)) return Promise.reject(new Error('Cet identifiant existe deja'))
    if (role === 'superadmin') return Promise.reject(new Error('Role non autorise'))
    let updated = null
    mockUsers = mockUsers.map((u) => { if (u.id !== id) return u; updated = { ...u, name: n, pseudo: p, role }; return updated })
    if (!updated) return Promise.reject(new Error('Utilisateur introuvable'))
    persist.users()
    return Promise.resolve(updated)
  },

  updateUserPassword: ({ id, password }) => {
    if (!password || password.length < 8) return Promise.reject(new Error('Mot de passe trop court (8 caracteres min)'))
    const user = mockUsers.find((u) => u.id === id)
    if (!user) return Promise.reject(new Error('Utilisateur introuvable'))
    // Mise à jour du mot de passe dans le storage des credentials
    const creds = load('credentials', {})
    creds[user.pseudo] = password
    save('credentials', creds)
    return Promise.resolve({ message: 'Mot de passe mis a jour' })
  },

  deleteUser: (id) => {
    const user = mockUsers.find((u) => u.id === id)
    if (!user) return Promise.reject(new Error('Utilisateur introuvable'))
    mockUsers = mockUsers.filter((u) => u.id !== id); persist.users()
    return Promise.resolve({ message: 'Utilisateur supprime' })
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: (pseudo, password) => {
    // Credentials de base (modifiables via updateUserPassword)
    const defaultCreds = {
      'admin':    'admin@@webstock',
      'caissiere': 'caissiere@@webstock',
    }
    // Superadmin — secret, jamais affiché dans l'interface
    const SUPERADMIN = { pseudo: 'ws_superadmin', password: 'W3bSt0ck@@Harmonie2026', name: 'Super Admin', role: 'superadmin' }

    // Vérification superadmin en premier (credentials fixes, non modifiables)
    if (pseudo === SUPERADMIN.pseudo && password === SUPERADMIN.password) {
      currentUserRole = 'superadmin'
      return Promise.resolve({ user: { id: 0, pseudo: SUPERADMIN.pseudo, name: SUPERADMIN.name, role: 'superadmin' }, token: 'superadmin-token' })
    }

    // Vérification utilisateurs normaux
    const user = mockUsers.find((u) => u.pseudo === pseudo)
    if (!user) return Promise.reject(new Error('Identifiant ou mot de passe incorrect'))

    // Mot de passe : vérifier dans le storage d'abord, sinon les defaults
    const storedCreds = load('credentials', {})
    const expectedPassword = storedCreds[pseudo] ?? defaultCreds[pseudo] ?? null
    if (!expectedPassword || password !== expectedPassword) {
      return Promise.reject(new Error('Identifiant ou mot de passe incorrect'))
    }

    currentUserRole = user.role
    return Promise.resolve({ user: { ...user }, token: `mock-token-${user.id}` })
  },

  logout: () => {
    currentUserRole = null
    return Promise.resolve()
  },

  setRole: (role) => {
    currentUserRole = role
  },
}
