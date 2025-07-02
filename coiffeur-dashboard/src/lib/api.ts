const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://projet-final-b3.vercel.app/api"

// Types corrigés selon votre API
export interface Salon {
  _id: string
  name: string
  address: string
  ville: string
  categorie: "homme" | "femme" | "mixte"
  description: string
  horaires: Array<{
    jour: string
    ouverture: string
    fermeture: string
    _id: string
  }>
  prixMinimum: number
  owner: {
    _id: string
    email: string
    role: string
  }
  commentaires: Array<{
    utilisateur: string
    note: number
    commentaire: string
    _id: string
    date: string
  }>
  createdAt: string
  updatedAt: string
  __v: number
}

// Type pour la création d'un salon (selon votre JSON d'exemple)
export interface CreateSalonData {
  name: string
  address: string
  ville: string
  categorie: "homme" | "femme" | "mixte"
  description: string
  prixMinimum: number
  horaires: Array<{
    jour: string
    ouverture: string
    fermeture: string
  }>
  owner: {
    prenom: string
    nom: string
    email: string
  }
}

export interface User {
  _id: string
  nom: string
  prenom: string
  email: string
  role: "user" | "coiffeur" | "admin"
  __v: number
}

// Type pour la création d'un utilisateur
export interface CreateUserData {
  nom: string
  prenom: string
  email: string
  motDePasse: string
  role: "user" | "coiffeur" | "admin"
}

// Type pour la modification d'un utilisateur
export interface UpdateUserData {
  nom?: string
  prenom?: string
  email?: string
  role?: "user" | "coiffeur" | "admin"
  motDePasse?: string
}

export interface RendezVous {
  _id: string
  salon: {
    _id: string
    name: string
    ville: string
    adress: string // Note: votre API a "adress" pas "address"
  }
  client: {
    _id: string
    nom: string
    prenom: string
    email: string
  }
  date: string
  statut: "en attente" | "confirmé" | "annulé"
  commentaire: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface AuthResponse {
  token: string
  user: User
}

// Gestion du token
class TokenManager {
  private static TOKEN_KEY = "auth_token"

  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.TOKEN_KEY)
  }
}

// Service API
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = TokenManager.getToken()

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        // Essayer de récupérer le message d'erreur du serveur
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          console.log("❌ Erreur serveur:", errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          console.log("❌ Impossible de parser l'erreur JSON")
        }

        if (response.status === 401) {
          TokenManager.removeToken()
          throw new Error("Session expirée, veuillez vous reconnecter")
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // Authentification
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, motDePasse: password }),
    })

    TokenManager.setToken(response.token)
    return response
  }

  logout(): void {
    TokenManager.removeToken()
  }

  isAuthenticated(): boolean {
    return TokenManager.getToken() !== null
  }

  // Salons
  async getSalons(): Promise<Salon[]> {
    return this.request<Salon[]>("/salons")
  }

  async getSalon(id: string): Promise<Salon> {
    return this.request<Salon>(`/salons/${id}`)
  }

  async createSalon(salonData: CreateSalonData): Promise<Salon> {
    return this.request<Salon>("/salons", {
      method: "POST",
      body: JSON.stringify(salonData),
    })
  }

  async updateSalon(id: string, salon: Partial<Salon>): Promise<Salon> {
    return this.request<Salon>(`/salons/${id}`, {
      method: "PUT",
      body: JSON.stringify(salon),
    })
  }

  async deleteSalon(id: string): Promise<void> {
    return this.request<void>(`/salons/${id}`, {
      method: "DELETE",
    })
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users/list")
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(userData: CreateUserData): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Rendez-vous
  async getRendezVous(): Promise<RendezVous[]> {
    return this.request<RendezVous[]>("/users/rdv")
  }

  async deleteRendezVous(id: string): Promise<void> {
    return this.request<void>(`/rendezvous/${id}`, {
      method: "DELETE",
    })
  }
}

export const apiService = new ApiService()
