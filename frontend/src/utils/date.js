// src/utils/date.js
// Formate une date YYYY-MM-DD en JJ/MM/AAAA
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
