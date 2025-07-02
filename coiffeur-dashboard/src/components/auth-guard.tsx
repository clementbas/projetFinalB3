"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/lib/api'
import { LoadingSpinner } from './loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si un token existe
        if (!apiService.isAuthenticated()) {
          router.push('/login')
          return
        }

        // Vérifier si l'utilisateur est admin en faisant un appel API
        // (cela vérifie aussi si le token est valide)
        try {
          await apiService.getUsers() // Endpoint qui nécessite d'être admin
          setIsAuthorized(true)
        } catch (error) {
          // Si l'appel échoue, l'utilisateur n'est pas admin ou le token est invalide
          apiService.logout()
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Le redirect est en cours
  }

  return <>{children}</>
}