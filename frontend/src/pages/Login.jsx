import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '../api/mock'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.login(email, password)
      login(response.user)
      toast.success('Connexion reussie')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo + titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="Harmonie Salon"
              className="h-24 w-24 object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          {/* <h1 className="text-2xl font-semibold text-beige-900">Harmonie Salon</h1> */}
          <p className="text-beige-500 text-sm mt-1">Gestion de stock — WebStock</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-beige-200 p-8">
          <h2 className="text-lg font-semibold text-beige-900 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="pseudo" className="block text-sm font-medium text-beige-700 mb-2">
                Identifiant
              </label>
              <input
                type="text"
                id="pseudo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none transition-all"
                placeholder="Votre identifiant"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-beige-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-beige-300 focus:border-beige-500 focus:ring-2 focus:ring-beige-200 outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-beige-400 hover:text-beige-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-beige-900 text-white rounded-lg font-medium hover:bg-beige-800 focus:ring-2 focus:ring-beige-300 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login