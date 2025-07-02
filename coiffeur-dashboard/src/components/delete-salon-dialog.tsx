"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface DeleteSalonDialogProps {
  isOpen: boolean
  onClose: () => void
  onSalonDeleted: () => void
  salon: {
    _id: string
    name: string
  } | null
}

export function DeleteSalonDialog({ isOpen, onClose, onSalonDeleted, salon }: DeleteSalonDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salon) return

    // Vérifier que le nom tapé correspond exactement au nom du salon
    if (confirmationText !== salon.name) {
      toast.error("Le nom du salon ne correspond pas")
      return
    }

    setIsLoading(true)

    try {
      await apiService.deleteSalon(salon._id)
      toast.success("Salon supprimé avec succès !")
      onClose()
      onSalonDeleted()
      setConfirmationText("") // Reset du champ
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmationText("") // Reset du champ à la fermeture
    onClose()
  }

  const isConfirmationValid = confirmationText === salon?.name

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le salon
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données du salon seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>

        {salon && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Salon à supprimer :</h4>
                <p className="text-red-700">
                  <span className="font-semibold">{salon.name}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-sm font-medium">
                  Pour confirmer la suppression, tapez le nom du salon ci-dessous :
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Tapez "${salon.name}" pour confirmer`}
                  className={`${
                    confirmationText && !isConfirmationValid
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  autoComplete="off"
                  required
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600">Le nom ne correspond pas</p>
                )}
                {isConfirmationValid && <p className="text-sm text-green-600">✓ Nom confirmé</p>}
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Attention :</strong> Cette suppression affectera également :
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Tous les rendez-vous associés à ce salon</li>
                  <li>Tous les commentaires et avis</li>
                  <li>L'historique des données</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading || !isConfirmationValid}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Supprimer définitivement
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
