import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('webstock_user')
      if (storedUser && storedUser !== 'undefined') {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // Restaurer le rôle dans mock.js après rechargement de page
        api.setRole?.(userData.role)
      }
    } catch {
      localStorage.removeItem('webstock_user')
      localStorage.removeItem('webstock_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    api.setRole?.(userData.role)
    localStorage.setItem('webstock_user', JSON.stringify(userData))
  }

  const logout = () => {
    api.logout()
    setUser(null)
    localStorage.removeItem('webstock_user')
    localStorage.removeItem('webstock_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
