import { supabase } from '../utils/supabase'
import { load, save } from './storage'

// ─── Superadmin (secret, hors Supabase) ──────────────────────────────────────
const SUPERADMIN = {
  pseudo:   'ws_superadmin',
  password: 'W3bSt0ck@@Harmonie2026',
  name:     'Super Admin',
  role:     'superadmin',
}

// ─── Correspondance pseudo → email Supabase ───────────────────────────────────
function pseudoToEmail(pseudo) {
  return `${pseudo}@harmoniesalon.com`
}

// ─── Rôle courant ────────────────────────────────────────────────────────────
let currentUserRole = null
export function setRole(role) { currentUserRole = role }
export function isSuperAdmin() { return currentUserRole === 'superadmin' }
function canModifyValidated() { return isSuperAdmin() }

// ─── Helper erreur Supabase ───────────────────────────────────────────────────
function sbErr(error) {
  return Promise.reject(new Error(error?.message || 'Erreur Supabase'))
}

// ─── API ─────────────────────────────────────────────────────────────────────
export const api = {

  setRole: (role) => { currentUserRole = role },

  // ── Auth ──────────────────────────────────────────────────────────────────
  login: async (pseudo, password) => {
    // Superadmin — vérifié en local
    if (pseudo === SUPERADMIN.pseudo && password === SUPERADMIN.password) {
      currentUserRole = 'superadmin'
      return { user: { id: 0, pseudo: SUPERADMIN.pseudo, name: SUPERADMIN.name, role: 'superadmin' }, token: 'superadmin-token' }
    }

    const email = pseudoToEmail(pseudo)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return sbErr({ message: 'Identifiant ou mot de passe incorrect' })

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) return sbErr(profileError)

    currentUserRole = profile.role
    return {
      user:  { id: data.user.id, pseudo: profile.pseudo, name: profile.name, role: profile.role },
      token: data.session.access_token,
    }
  },

  logout: async () => {
    currentUserRole = null
    await supabase.auth.signOut()
  },

  // ── Fournisseurs ──────────────────────────────────────────────────────────
  getFournisseurs: async () => {
    const { data, error } = await supabase.from('fournisseurs').select('*').order('nom')
    if (error) return sbErr(error)
    return data.map((f) => ({ id: f.id, nom: f.nom, telephone: f.telephone, localisation: f.localisation, actif: f.actif }))
  },

  addFournisseur: async ({ nom, telephone, localisation }) => {
    const { data, error } = await supabase.from('fournisseurs').insert({ nom: nom.trim(), telephone: telephone || '', localisation: localisation || '' }).select().single()
    if (error) return sbErr(error)
    return data
  },

  updateFournisseur: async ({ id, nom, telephone, localisation }) => {
    const { data, error } = await supabase.from('fournisseurs').update({ nom: nom.trim(), telephone: telephone || '', localisation: localisation || '' }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  toggleFournisseurActif: async (id) => {
    const { data: current } = await supabase.from('fournisseurs').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('fournisseurs').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  deleteFournisseur: async (id) => {
    const { data: existing } = await supabase.from('fournisseurs').select('*').eq('id', id).single()
    await archiver('fournisseur', id, existing)
    const { error } = await supabase.from('fournisseurs').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Fournisseur supprime' }
  },

  // ── Types de produits ─────────────────────────────────────────────────────
  getTypesProduits: async () => {
    const { data, error } = await supabase.from('types_produits').select('*, type_fournisseur(fournisseur_id)').order('nom')
    if (error) return sbErr(error)
    return data.map((t) => ({ id: t.id, nom: t.nom, actif: t.actif, fournisseurIds: t.type_fournisseur.map((tf) => tf.fournisseur_id) }))
  },

  addTypeProduit: async ({ nom }) => {
    const { data, error } = await supabase.from('types_produits').insert({ nom: nom.trim() }).select().single()
    if (error) return sbErr(error)
    return { ...data, fournisseurIds: [] }
  },

  updateTypeProduit: async ({ id, nom }) => {
    const { data, error } = await supabase.from('types_produits').update({ nom: nom.trim() }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  toggleTypeProduitActif: async (id) => {
    const { data: current } = await supabase.from('types_produits').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('types_produits').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  updateTypeFournisseurs: async ({ typeId, fournisseurIds }) => {
    await supabase.from('type_fournisseur').delete().eq('type_id', typeId)
    if (fournisseurIds.length > 0) {
      const rows = fournisseurIds.map((fid) => ({ type_id: typeId, fournisseur_id: fid }))
      const { error } = await supabase.from('type_fournisseur').insert(rows)
      if (error) return sbErr(error)
    }
    return { id: typeId, fournisseurIds }
  },

  deleteTypeProduit: async (id) => {
    const { data: existing } = await supabase.from('types_produits').select('*').eq('id', id).single()
    await archiver('type_produit', id, existing)
    const { error } = await supabase.from('types_produits').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Type supprime' }
  },

  // ── Produits ──────────────────────────────────────────────────────────────
  getProduits: async () => {
    const { data, error } = await supabase
      .from('produits')
      .select('*, types_produits(nom)')
      .order('nom')
    if (error) return sbErr(error)

    // Calcul du stock
    const stocks = await computeStocks()
    return data.map((p) => ({
      id: p.id, nom: p.nom, typeId: p.type_id, typeNom: p.types_produits?.nom || 'Sans type',
      prix: p.prix, actif: p.actif, stock: stocks[p.id] || 0,
    }))
  },

  addProduit: async ({ nom, typeId, prix, actif }) => {
    const { data, error } = await supabase.from('produits').insert({ nom: nom.trim(), type_id: typeId, prix: prix || 0, actif: actif ?? true }).select('*, types_produits(nom)').single()
    if (error) return sbErr(error)
    return { id: data.id, nom: data.nom, typeId: data.type_id, typeNom: data.types_produits?.nom, prix: data.prix, actif: data.actif, stock: 0 }
  },

  updateProduit: async ({ id, nom, typeId, prix }) => {
    const { data, error } = await supabase.from('produits').update({ nom: nom.trim(), type_id: typeId, prix: prix || 0 }).eq('id', id).select('*, types_produits(nom)').single()
    if (error) return sbErr(error)
    const stocks = await computeStocks()
    return { id: data.id, nom: data.nom, typeId: data.type_id, typeNom: data.types_produits?.nom, prix: data.prix, actif: data.actif, stock: stocks[id] || 0 }
  },

  toggleProduitActif: async (id) => {
    const { data: current } = await supabase.from('produits').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('produits').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  deleteProduit: async (id) => {
    const { data: existing } = await supabase.from('produits').select('*').eq('id', id).single()
    await archiver('produit', id, existing)
    const { error } = await supabase.from('produits').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Produit supprime' }
  },

  // ── Prestations ───────────────────────────────────────────────────────────
  getPrestations: async () => {
    const { data, error } = await supabase.from('prestations').select('*').order('nom')
    if (error) return sbErr(error)
    return data
  },

  addPrestation: async ({ nom, prix }) => {
    const { data, error } = await supabase.from('prestations').insert({ nom: nom.trim(), prix: prix || 0 }).select().single()
    if (error) return sbErr(error)
    return data
  },

  updatePrestation: async ({ id, nom, prix }) => {
    const { data, error } = await supabase.from('prestations').update({ nom: nom.trim(), prix: prix || 0 }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  togglePrestationActif: async (id) => {
    const { data: current } = await supabase.from('prestations').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('prestations').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  deletePrestation: async (id) => {
    const { data: existing } = await supabase.from('prestations').select('*').eq('id', id).single()
    await archiver('prestation', id, existing)
    const { error } = await supabase.from('prestations').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Prestation supprimee' }
  },

  // ── Charges ───────────────────────────────────────────────────────────────
  getCharges: async () => {
    const { data, error } = await supabase.from('charges').select('*').order('nom')
    if (error) return sbErr(error)
    return data
  },

  addCharge: async ({ nom }) => {
    const { data, error } = await supabase.from('charges').insert({ nom: nom.trim() }).select().single()
    if (error) return sbErr(error)
    return data
  },

  updateCharge: async ({ id, nom }) => {
    const { data, error } = await supabase.from('charges').update({ nom: nom.trim() }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  toggleChargeActif: async (id) => {
    const { data: current } = await supabase.from('charges').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('charges').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  deleteCharge: async (id) => {
    const { data: existing } = await supabase.from('charges').select('*').eq('id', id).single()
    await archiver('charge', id, existing)
    const { error } = await supabase.from('charges').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Charge supprimee' }
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  getClients: async () => {
    const { data, error } = await supabase.from('clients').select('*').order('nom')
    if (error) return sbErr(error)
    return data
  },

  addClient: async ({ nom, telephone, localisation }) => {
    const { data, error } = await supabase.from('clients').insert({ nom: nom.trim(), telephone: telephone || '', localisation: localisation || '' }).select().single()
    if (error) return sbErr(error)
    return data
  },

  updateClient: async ({ id, nom, telephone, localisation }) => {
    const { data, error } = await supabase.from('clients').update({ nom: nom.trim(), telephone: telephone || '', localisation: localisation || '' }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  toggleClientActif: async (id) => {
    const { data: current } = await supabase.from('clients').select('actif').eq('id', id).single()
    const { data, error } = await supabase.from('clients').update({ actif: !current.actif }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return data
  },

  deleteClient: async (id) => {
    const { data: existing } = await supabase.from('clients').select('*').eq('id', id).single()

    await archiver('client', id, existing)

    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Client supprime' }
  },

  // ── Arrivages ─────────────────────────────────────────────────────────────
  getArrivages: async () => {
    const { data, error } = await supabase
      .from('arrivages')
      .select('*, arrivage_lignes(*, produits(nom), fournisseurs(nom))')
      .order('date', { ascending: false })
    if (error) return sbErr(error)
    return data.map(formatArrivage)
  },

  addArrivage: async ({ date, items }) => {
    const { data: arrivage, error } = await supabase.from('arrivages').insert({ date, is_validated: false }).select().single()
    if (error) return sbErr(error)
    const lignes = items.map((i) => ({ arrivage_id: arrivage.id, produit_id: i.produitId, fournisseur_id: i.fournisseurId, quantite: i.quantite }))
    const { error: lignesError } = await supabase.from('arrivage_lignes').insert(lignes)
    if (lignesError) return sbErr(lignesError)
    return api.getArrivages().then((arr) => arr.find((a) => a.id === arrivage.id))
  },

  updateArrivage: async ({ id, date, items }) => {
    const { data: existing } = await supabase.from('arrivages').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Un arrivage valide ne peut pas etre modifie' })
    await supabase.from('arrivages').update({ date }).eq('id', id)
    await supabase.from('arrivage_lignes').delete().eq('arrivage_id', id)
    const lignes = items.map((i) => ({ arrivage_id: id, produit_id: i.produitId, fournisseur_id: i.fournisseurId, quantite: i.quantite }))
    await supabase.from('arrivage_lignes').insert(lignes)
    return api.getArrivages().then((arr) => arr.find((a) => a.id === id))
  },

  validateArrivage: async (id) => {
    const { error } = await supabase.from('arrivages').update({ is_validated: true }).eq('id', id)
    if (error) return sbErr(error)
    await supabase.from('historique').insert({ titre: 'Arrivage valide', description: `Arrivage #${id} valide.` })
    return api.getArrivages().then((arr) => arr.find((a) => a.id === id))
  },

  deleteArrivage: async (id) => {
    const { data: existing } = await supabase.from('arrivages').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Un arrivage valide ne peut pas etre supprime' })
    
    await archiver('arrivage', id, existing)

    const { error } = await supabase.from('arrivages').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Arrivage supprime' }
  },

  // ── Ventes ────────────────────────────────────────────────────────────────
  getVentes: async () => {
    const { data, error } = await supabase
      .from('ventes')
      .select('*, clients(nom), vente_lignes(*, produits(nom, prix))')
      .order('date', { ascending: false })
    if (error) return sbErr(error)
    return data.map(formatVente)
  },

  addVente: async ({ date, clientId, items }) => {
    const { data: vente, error } = await supabase.from('ventes').insert({ date, client_id: clientId || null, is_validated: false }).select().single()
    if (error) return sbErr(error)
    const lignes = items.map((i) => ({ vente_id: vente.id, produit_id: i.produitId, quantite: i.quantite, prix_vente: i.prixVente || null }))
    await supabase.from('vente_lignes').insert(lignes)
    return api.getVentes().then((arr) => arr.find((v) => v.id === vente.id))
  },

  updateVente: async ({ id, date, clientId, items }) => {
    const { data: existing } = await supabase.from('ventes').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une vente validee ne peut pas etre modifiee' })
    await supabase.from('ventes').update({ date, client_id: clientId || null }).eq('id', id)
    await supabase.from('vente_lignes').delete().eq('vente_id', id)
    const lignes = items.map((i) => ({ vente_id: id, produit_id: i.produitId, quantite: i.quantite, prix_vente: i.prixVente || null }))
    await supabase.from('vente_lignes').insert(lignes)
    return api.getVentes().then((arr) => arr.find((v) => v.id === id))
  },

  validateVente: async (id) => {
    const { error } = await supabase.from('ventes').update({ is_validated: true }).eq('id', id)
    if (error) return sbErr(error)
    await supabase.from('historique').insert({ titre: 'Vente validee', description: `Vente #${id} validee.` })
    return api.getVentes().then((arr) => arr.find((v) => v.id === id))
  },

  deleteVente: async (id) => {
    const { data: existing } = await supabase
      .from('ventes')
      .select('is_validated')
      .eq('id', id)
      .single()

    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une vente validee ne peut pas etre supprimee' })
    
      //archiver avant suppression
    await archiver('vente', id, existing)
    
    const { error } = await supabase.from('ventes').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Vente supprimee' }
  },

  // ── Recettes ──────────────────────────────────────────────────────────────
  getRecettes: async () => {
    const { data, error } = await supabase
      .from('recettes')
      .select('*, clients(nom), prestations(nom, prix)')
      .order('date', { ascending: false })
    if (error) return sbErr(error)
    return data.map(formatRecette)
  },

  addRecette: async ({ date, clientId, prestationId, prixApplique, notes }) => {
    const { data, error } = await supabase.from('recettes').insert({ date, client_id: clientId || null, prestation_id: prestationId, prix_applique: prixApplique, notes: notes || '', is_validated: false }).select().single()
    if (error) return sbErr(error)
    return api.getRecettes().then((arr) => arr.find((r) => r.id === data.id))
  },

  updateRecette: async ({ id, date, clientId, prestationId, prixApplique, notes }) => {
    const { data: existing } = await supabase.from('recettes').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une recette validee ne peut pas etre modifiee' })
    await supabase.from('recettes').update({ date, client_id: clientId || null, prestation_id: prestationId, prix_applique: prixApplique, notes: notes || '' }).eq('id', id)
    return api.getRecettes().then((arr) => arr.find((r) => r.id === id))
  },

  validateRecette: async (id) => {
    const { error } = await supabase.from('recettes').update({ is_validated: true }).eq('id', id)
    if (error) return sbErr(error)
    await supabase.from('historique').insert({ titre: 'Recette validee', description: `Recette #${id} validee.` })
    return api.getRecettes().then((arr) => arr.find((r) => r.id === id))
  },

  deleteRecette: async (id) => {
    const { data: existing } = await supabase.from('recettes').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une recette validee ne peut pas etre supprimee' })
    
    await archiver('recette', id, existing)

    const { error } = await supabase.from('recettes').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Recette supprimee' }
  },

  // ── Dépenses ──────────────────────────────────────────────────────────────
  getDepenses: async () => {
    const { data, error } = await supabase
      .from('depenses')
      .select('*, charges(nom)')
      .order('date', { ascending: false })
    if (error) return sbErr(error)
    return data.map(formatDepense)
  },

  addDepense: async ({ date, chargeId, montant, notes }) => {
    const { data, error } = await supabase.from('depenses').insert({ date, charge_id: chargeId, montant, notes: notes || '', is_validated: false }).select().single()
    if (error) return sbErr(error)
    return api.getDepenses().then((arr) => arr.find((d) => d.id === data.id))
  },

  updateDepense: async ({ id, date, chargeId, montant, notes }) => {
    const { data: existing } = await supabase.from('depenses').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une depense validee ne peut pas etre modifiee' })
    await supabase.from('depenses').update({ date, charge_id: chargeId, montant, notes: notes || '' }).eq('id', id)
    return api.getDepenses().then((arr) => arr.find((d) => d.id === id))
  },

  validateDepense: async (id) => {
    const { error } = await supabase.from('depenses').update({ is_validated: true }).eq('id', id)
    if (error) return sbErr(error)
    await supabase.from('historique').insert({ titre: 'Depense validee', description: `Depense #${id} validee.` })
    return api.getDepenses().then((arr) => arr.find((d) => d.id === id))
  },

  deleteDepense: async (id) => {
    const { data: existing } = await supabase.from('depenses').select('is_validated').eq('id', id).single()
    if (existing.is_validated && !canModifyValidated()) return sbErr({ message: 'Une depense validee ne peut pas etre supprimee' })
    
    await archiver('depense', id, existing)

    const { error } = await supabase.from('depenses').delete().eq('id', id)
    if (error) return sbErr(error)
    return { message: 'Depense supprimee' }
  },

  // ── Inventaires ───────────────────────────────────────────────────────────
  getInventaires: async () => {
    const { data, error } = await supabase.from('inventaires').select('*, produits(nom)').order('date', { ascending: false })
    if (error) return sbErr(error)
    return data.map((i) => ({ id: i.id, date: i.date, produitId: i.produit_id, produitNom: i.produits?.nom, quantitePhysique: i.quantite_physique, stockTheorique: i.stock_theorique, ecart: i.ecart, isValidated: i.is_validated }))
  },

  addInventaire: async ({ date, produitId, quantitePhysique }) => {
    const stocks = await computeStocks()
    const stockTheorique = stocks[produitId] || 0
    const ecart = quantitePhysique - stockTheorique
    const { data, error } = await supabase.from('inventaires').insert({ date, produit_id: produitId, quantite_physique: quantitePhysique, stock_theorique: stockTheorique, ecart, is_validated: true }).select().single()
    if (error) return sbErr(error)
    return api.getInventaires().then((arr) => arr.find((i) => i.id === data.id))
  },

  updateInventaire: async ({ id, date, produitId, quantitePhysique }) => {
    const stocks = await computeStocks()
    const stockTheorique = stocks[produitId] || 0
    const ecart = quantitePhysique - stockTheorique
    const { error } = await supabase.from('inventaires').update({ date, produit_id: produitId, quantite_physique: quantitePhysique, stock_theorique: stockTheorique, ecart }).eq('id', id)
    if (error) return sbErr(error)
    return api.getInventaires().then((arr) => arr.find((i) => i.id === id))
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  getStats: async () => {
    const today = new Date().toISOString().slice(0, 10)
    const [ventes, recettes, depenses, produits] = await Promise.all([
      supabase.from('ventes').select('*, vente_lignes(quantite, prix_vente, produits(prix))').eq('is_validated', true),
      supabase.from('recettes').select('prix_applique, date').eq('is_validated', true),
      supabase.from('depenses').select('montant, date').eq('is_validated', true),
      supabase.from('produits').select('id, actif').eq('actif', true),
    ])

    const allVentes = ventes.data || []
    const allRecettes = recettes.data || []
    const allDepenses = depenses.data || []

    const ventesFormatees = allVentes.map(formatVente)
    const ventesJour = ventesFormatees.filter((v) => v.date === today)
    const recettesJour = allRecettes.filter((r) => r.date === today)
    const depensesJour = allDepenses.filter((d) => d.date === today)

    const totalVentes = ventesFormatees.reduce((t, v) => t + v.total, 0)
    const totalRecettes = allRecettes.reduce((t, r) => t + r.prix_applique, 0)
    const totalDepenses = allDepenses.reduce((t, d) => t + d.montant, 0)

    return {
      ventesJour: ventesJour.reduce((t, v) => t + v.total, 0),
      nombreVentesJour: ventesJour.length,
      recettesJour: recettesJour.reduce((t, r) => t + r.prix_applique, 0),
      nombreRecettesJour: recettesJour.length,
      depensesJour: depensesJour.reduce((t, d) => t + d.montant, 0),
      etatCaisse: totalVentes + totalRecettes - totalDepenses,
      totalProduitsActifs: produits.data?.length || 0,
    }
  },

  // ── Historique ────────────────────────────────────────────────────────────
  getHistorique: async () => {
    const { data, error } = await supabase.from('historique').select('*').order('date', { ascending: false }).limit(100)
    if (error) return sbErr(error)
    return data.map((h) => ({ id: h.id, titre: h.titre, description: h.description, date: h.date }))
  },

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  getUsers: async () => {
    const { data, error } = await supabase.from('profiles').select('*').neq('role', 'superadmin').order('name')
    if (error) return sbErr(error)
    return data.map((p) => ({ id: p.id, name: p.name, pseudo: p.pseudo, role: p.role }))
  },

  addUser: async ({ name, pseudo, role, password }) => {
    if (role === 'superadmin') return sbErr({ message: 'Role non autorise' })
    const email = pseudoToEmail(pseudo)
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
    if (error) return sbErr(error)
    const { data: profile, error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, pseudo, name, role }).select().single()
    if (profileError) return sbErr(profileError)
    return { id: profile.id, name: profile.name, pseudo: profile.pseudo, role: profile.role }
  },

  updateUser: async ({ id, name, pseudo, role }) => {
    if (role === 'superadmin') return sbErr({ message: 'Role non autorise' })
    const { data, error } = await supabase.from('profiles').update({ name, pseudo, role }).eq('id', id).select().single()
    if (error) return sbErr(error)
    return { id: data.id, name: data.name, pseudo: data.pseudo, role: data.role }
  },

  updateUserPassword: async ({ id, password }) => {
    const { error } = await supabase.auth.admin.updateUserById(id, { password })
    if (error) return sbErr(error)
    return { message: 'Mot de passe mis a jour' }
  },

  deleteUser: async (id) => {
    await supabase.from('profiles').delete().eq('id', id)
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return sbErr(error)
    return { message: 'Utilisateur supprime' }
  },
}

// Helper archivage — à ajouter avant les helpers de formatage
async function archiver(type, id, data) {
  await supabase.from('archives').insert({
    type,
    reference_id: id,
    data,
  })
}

// ─── Helpers de formatage ─────────────────────────────────────────────────────
function formatArrivage(a) {
  const items = (a.arrivage_lignes || []).map((l) => ({
    produitId: l.produit_id, produitNom: l.produits?.nom || '-',
    fournisseurId: l.fournisseur_id, fournisseurNom: l.fournisseurs?.nom || '-',
    quantite: l.quantite,
  }))
  const fournisseurNoms = [...new Set(items.map((i) => i.fournisseurNom).filter(Boolean))]
  return { id: a.id, date: a.date, isValidated: a.is_validated, items, fournisseurNoms, totalQuantite: items.reduce((t, i) => t + i.quantite, 0) }
}

function formatVente(v) {
  const items = (v.vente_lignes || []).map((l) => {
    const prixUnitaire = l.prix_vente || l.produits?.prix || 0
    return { produitId: l.produit_id, produitNom: l.produits?.nom || '-', quantite: l.quantite, prixUnitaire, total: prixUnitaire * l.quantite }
  })
  return { id: v.id, date: v.date, clientId: v.client_id, clientNom: v.clients?.nom || null, isValidated: v.is_validated, items, totalQuantite: items.reduce((t, i) => t + i.quantite, 0), total: items.reduce((t, i) => t + i.total, 0) }
}

function formatRecette(r) {
  return { id: r.id, date: r.date, clientId: r.client_id, clientNom: r.clients?.nom || null, prestationId: r.prestation_id, prestationNom: r.prestations?.nom || '-', prixReference: r.prestations?.prix || 0, prixApplique: r.prix_applique, notes: r.notes, isValidated: r.is_validated }
}

function formatDepense(d) {
  return { id: d.id, date: d.date, chargeId: d.charge_id, chargeNom: d.charges?.nom || '-', montant: d.montant, notes: d.notes, isValidated: d.is_validated }
}

async function computeStocks() {
  const [arrivages, ventes, inventaires] = await Promise.all([
    supabase.from('arrivage_lignes').select('produit_id, quantite, arrivages!inner(is_validated)').eq('arrivages.is_validated', true),
    supabase.from('vente_lignes').select('produit_id, quantite, ventes!inner(is_validated)').eq('ventes.is_validated', true),
    supabase.from('inventaires').select('produit_id, ecart').eq('is_validated', true),
  ])
  const stocks = {}
  ;(arrivages.data || []).forEach((l) => { stocks[l.produit_id] = (stocks[l.produit_id] || 0) + l.quantite })
  ;(ventes.data || []).forEach((l) => { stocks[l.produit_id] = (stocks[l.produit_id] || 0) - l.quantite })
  ;(inventaires.data || []).forEach((i) => { stocks[i.produit_id] = (stocks[i.produit_id] || 0) + i.ecart })
  return stocks
}

