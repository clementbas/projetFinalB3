import { useState, useEffect } from 'react'
import { apiService, Salon, User, RendezVous } from '@/lib/api'

export function useSalons() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSalons = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getSalons()
      setSalons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des salons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalons()
  }, [])

  return { salons, loading, error, refetch: fetchSalons }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, loading, error, refetch: fetchUsers }
}

export function useRendezVous() {
  const [rendezvous, setRendezVous] = useState<RendezVous[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRendezVous = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getRendezVous()
      setRendezVous(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des rendez-vous')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRendezVous()
  }, [])

  return { rendezvous, loading, error, refetch: fetchRendezVous }
}