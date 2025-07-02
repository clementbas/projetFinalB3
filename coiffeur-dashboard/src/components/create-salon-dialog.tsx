"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { apiService, type CreateSalonData } from "@/lib/api"
import { toast } from "sonner"

interface CreateSalonDialogProps {
  isOpen: boolean
  onClose: () => void
  onSalonCreated: () => void
}

const defaultHoraires = [
  { jour: "lundi", ouverture: "09:00", fermeture: "19:00" },
  { jour: "mardi", ouverture: "09:00", fermeture: "19:00" },
  { jour: "mercredi", ouverture: "09:00", fermeture: "19:00" },
  { jour: "jeudi", ouverture: "09:00", fermeture: "19:00" },
  { jour: "vendredi", ouverture: "09:00", fermeture: "19:00" },
  { jour: "samedi", ouverture: "10:00", fermeture: "18:00" },
  { jour: "dimanche", ouverture: "Fermé", fermeture: "Fermé" },
]

export function CreateSalonDialog({ isOpen, onClose, onSalonCreated }: CreateSalonDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSalonData>({
    name: "",
    address: "",
    ville: "",
    categorie: "mixte",
    description: "",
    prixMinimum: 20,
    horaires: defaultHoraires,
    owner: {
      prenom: "",
      nom: "",
      email: "",
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {

      const result = await apiService.createSalon(formData)

      toast.success("Salon créé avec succès !")
      onClose()
      onSalonCreated()

      // Reset form
      setFormData({
        name: "",
        address: "",
        ville: "",
        categorie: "mixte",
        description: "",
        prixMinimum: 20,
        horaires: defaultHoraires,
        owner: {
          prenom: "",
          nom: "",
          email: "",
        },
      })
    } catch (error) {
      console.error("Erreur complète:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création")
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau salon</DialogTitle>
          <DialogDescription>Ajoutez un nouveau salon de coiffure à la plateforme</DialogDescription>
        </DialogHeader>

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
                  onValueChange={(value: "homme" | "femme" | "mixte") => setFormData({ ...formData, categorie: value })}
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

          {/* Informations du propriétaire */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Propriétaire du salon</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.owner.prenom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      owner: { ...formData.owner, prenom: e.target.value },
                    })
                  }
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.owner.nom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      owner: { ...formData.owner, nom: e.target.value },
                    })
                  }
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
                value={formData.owner.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    owner: { ...formData.owner, email: e.target.value },
                  })
                }
                placeholder="email@exemple.com"
                required
              />
            </div>
          </div>

          {/* Horaires */}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le salon
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
