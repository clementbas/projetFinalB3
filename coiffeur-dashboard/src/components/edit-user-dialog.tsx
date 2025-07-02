"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { apiService, type UpdateUserData } from "@/lib/api"
import { toast } from "sonner"

interface EditUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
  userId: string | null
}

export function EditUserDialog({ isOpen, onClose, onUserUpdated, userId }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<
    UpdateUserData & { nom: string; prenom: string; email: string; role: "user" | "coiffeur" | "admin" }
  >({
    nom: "",
    prenom: "",
    email: "",
    role: "user",
    motDePasse: "",
  })

  // Charger les données de l'utilisateur quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData()
    }
  }, [isOpen, userId])

  const loadUserData = async () => {
    if (!userId) return

    setIsLoadingData(true)
    try {
      const user = await apiService.getUser(userId)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        motDePasse: "", // Ne pas pré-remplir le mot de passe
      })
    } catch (error) {
      toast.error("Erreur lors du chargement des données de l'utilisateur")
      onClose()
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)

    try {
      // Préparer les données à envoyer (ne pas inclure le mot de passe s'il est vide)
      const updateData: UpdateUserData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
      }

      // Inclure le mot de passe seulement s'il est fourni
      if (formData.motDePasse && formData.motDePasse.trim() !== "") {
        updateData.motDePasse = formData.motDePasse
      }

      await apiService.updateUser(userId, updateData)
      toast.success("Utilisateur modifié avec succès !")
      onClose()
      onUserUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la modification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      role: "user",
      motDePasse: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "user" | "coiffeur" | "admin") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="coiffeur">Coiffeur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Modifier l'utilisateur
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}