// src/api/storage.js
const PREFIX = 'webstock_data_'

export function load(key, defaultValue) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function save(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  } catch (e) {
    console.warn('localStorage save failed:', key, e)
  }
}

export function clearAll() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k))
}
