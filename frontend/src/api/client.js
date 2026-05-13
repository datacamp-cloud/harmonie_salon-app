// src/api/client.js
// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée unique de l'API.
// Actuellement : mock.js (backend pas encore déployé sur le serveur)
// Pour basculer vers le vrai backend Laravel :
//   Remplacer l'import ci-dessous par : export { api } from './http'
// ─────────────────────────────────────────────────────────────────────────────

export { api } from './supabase-api'
