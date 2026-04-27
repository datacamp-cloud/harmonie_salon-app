// src/api/client.js
// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée unique de l'API.
// Actuellement : redirige vers le mock.
// Pour basculer vers le vrai backend Laravel :
//   1. Créer src/api/http.js avec les vrais appels axios
//   2. Remplacer l'import ci-dessous par : export { api } from './http'
// ─────────────────────────────────────────────────────────────────────────────

export { api } from './mock'
