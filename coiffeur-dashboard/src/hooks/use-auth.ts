import { useState, useEffect } from 'react'
import { apiService, User } from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Pour l'instant, on considère que si le token existe, l'utilisateur est connecté
          // Vous pourriez ajouter un endpoint pour récupérer l'utilisateur actuel
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      setUser(response.user)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
  }

  return {
    user,
    login,
    logout,
    isAuthenticated: apiService.isAuthenticated(),
    loading,
  }
}