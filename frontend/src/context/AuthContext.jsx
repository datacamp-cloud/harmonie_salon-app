import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('webstock_user')
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser))
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
    localStorage.setItem('webstock_user', JSON.stringify(userData))
  }

  const logout = () => {
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
