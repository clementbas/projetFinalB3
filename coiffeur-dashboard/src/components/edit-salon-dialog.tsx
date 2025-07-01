"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface EditSalonDialogProps {
  isOpen: boolean
  onClose: () => void
  onSalonUpdated: () => void
  salonId: string | null
}

interface EditSalonData {
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
  owner?: {
    email: string
  }
}

export function EditSalonDialog({ isOpen, onClose, onSalonUpdated, salonId }: EditSalonDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState<EditSalonData>({
    name: "",
    address: "",
    ville: "",
    categorie: "mixte",
    description: "",
    prixMinimum: 20,
    horaires: [],
  })

  // Récupérer l'utilisateur actuel pour vérifier s'il est admin
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // Charger les données du salon quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen && salonId) {
      loadSalonData()
    }
  }, [isOpen, salonId])

  const loadSalonData = async () => {
    if (!salonId) return

    setIsLoadingData(true)
    try {
      const salon = await apiService.getSalon(salonId)

      // Convertir les horaires du salon vers le format du formulaire
      const horairesSansId = salon.horaires.map((h) => ({
        jour: h.jour,
        ouverture: h.ouverture,
        fermeture: h.fermeture,
      }))

      setFormData({
        name: salon.name,
        address: salon.address,
        ville: salon.ville,
        categorie: salon.categorie,
        description: salon.description,
        prixMinimum: salon.prixMinimum,
        horaires: horairesSansId,
        // Inclure l'owner seulement si l'utilisateur est admin
        ...(currentUser?.role === "admin" && {
          owner: {
            email: salon.owner?.email || "",
          },
        }),
      })
    } catch (error) {
      toast.error("Erreur lors du chargement des données du salon")
      onClose()
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salonId) return

    setIsLoading(true)

    try {
      // Préparer les données selon votre API
      const updateData: any = {
        name: formData.name,
        address: formData.address,
        ville: formData.ville,
        categorie: formData.categorie,
        description: formData.description,
        prixMinimum: formData.prixMinimum,
        horaires: formData.horaires,
      }

      // Inclure l'owner seulement si l'utilisateur est admin et que l'email est fourni
      if (currentUser?.role === "admin" && formData.owner?.email) {
        updateData.owner = {
          email: formData.owner.email,
        }
      }

      await apiService.updateSalon(salonId, updateData)
      toast.success("Salon modifié avec succès !")
      onClose()
      onSalonUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la modification")
    } finally {
      setIsLoading(false)
    }
  }

  const updateHoraire = (index: number, field: "ouverture" | "fermeture", value: string) => {
    const newHoraires = [...formData.horaires]
    newHoraires[index] = { ...newHoraires[index], [field]: value }
    setFormData({ ...formData, horaires: newHoraires })
  }

  const toggleFerme = (index: number) => {
    const newHoraires = [...formData.horaires]
    if (newHoraires[index].ouverture === "Fermé") {
      newHoraires[index] = { jour: newHoraires[index].jour, ouverture: "09:00", fermeture: "19:00" }
    } else {
      newHoraires[index] = { jour: newHoraires[index].jour, ouverture: "Fermé", fermeture: "Fermé" }
    }
    setFormData({ ...formData, horaires: newHoraires })
  }

  const isAdmin = currentUser?.role === "admin"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le salon</DialogTitle>
          <DialogDescription>Modifiez les informations du salon de coiffure</DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des données...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations du salon */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations du salon</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du salon *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du salon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Paris"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Rue de la Paix"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value: "homme" | "femme" | "mixte") =>
                      setFormData({ ...formData, categorie: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="femme">Femme</SelectItem>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix minimum (€) *</Label>
                  <Input
                    id="prix"
                    type="number"
                    min="1"
                    value={formData.prixMinimum}
                    onChange={(e) => setFormData({ ...formData, prixMinimum: Number.parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du salon"
                  rows={3}
                />
              </div>
            </div>

            {/* Section propriétaire - visible seulement pour les admins */}
            {isAdmin && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Propriétaire du salon</h3>
                <div className="space-y-2">
                  <Label htmlFor="owner-email">Email du propriétaire</Label>
                  <Input
                    id="owner-email"
                    type="email"
                    value={formData.owner?.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        owner: { email: e.target.value },
                      })
                    }
                    placeholder="email@exemple.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour ne pas modifier le propriétaire. L'utilisateur doit avoir le rôle "coiffeur".
                  </p>
                </div>
              </div>
            )}

            {/* Horaires */}
            {formData.horaires.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Horaires d'ouverture</h3>

                <div className="space-y-3">
                  {formData.horaires.map((horaire, index) => (
                    <div key={horaire.jour} className="grid grid-cols-4 gap-4 items-center">
                      <Label className="capitalize font-medium">{horaire.jour}</Label>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Ouverture</Label>
                        <Input
                          type="time"
                          value={horaire.ouverture === "Fermé" ? "" : horaire.ouverture}
                          onChange={(e) => updateHoraire(index, "ouverture", e.target.value || "Fermé")}
                          disabled={horaire.ouverture === "Fermé"}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Fermeture</Label>
                        <Input
                          type="time"
                          value={horaire.fermeture === "Fermé" ? "" : horaire.fermeture}
                          onChange={(e) => updateHoraire(index, "fermeture", e.target.value || "Fermé")}
                          disabled={horaire.fermeture === "Fermé"}
                        />
                      </div>

                      <Button type="button" variant="outline" size="sm" onClick={() => toggleFerme(index)}>
                        {horaire.ouverture === "Fermé" ? "Ouvrir" : "Fermer"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Modifier le salon
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}