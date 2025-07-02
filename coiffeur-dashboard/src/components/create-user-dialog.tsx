"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { apiService, type CreateUserData } from "@/lib/api"
import { toast } from "sonner"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}

export function CreateUserDialog({ isOpen, onClose, onUserCreated }: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<CreateUserData>({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "user",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiService.createUser(formData)
      toast.success("Utilisateur créé avec succès !")
      onClose()
      onUserCreated()

      // Reset form
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        motDePasse: "",
        role: "user",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      role: "user",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>Ajoutez un nouvel utilisateur à la plateforme</DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.motDePasse}
                onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
                placeholder="Mot de passe"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
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
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}