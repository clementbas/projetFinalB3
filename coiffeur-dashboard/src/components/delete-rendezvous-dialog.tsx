"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle, Calendar, User, MapPin } from "lucide-react"
import { apiService, type RendezVous } from "@/lib/api"
import { toast } from "sonner"

interface DeleteRendezVousDialogProps {
  isOpen: boolean
  onClose: () => void
  onRendezVousDeleted: () => void
  rendezvous: RendezVous | null
}

export function DeleteRendezVousDialog({
  isOpen,
  onClose,
  onRendezVousDeleted,
  rendezvous,
}: DeleteRendezVousDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rendezvous) return

    // Vérifier que le texte de confirmation correspond
    const expectedText = "SUPPRIMER"
    if (confirmationText !== expectedText) {
      toast.error("Veuillez taper 'SUPPRIMER' pour confirmer")
      return
    }

    setIsLoading(true)

    try {
      await apiService.deleteRendezVous(rendezvous._id)
      toast.success("Rendez-vous supprimé avec succès !")
      onClose()
      onRendezVousDeleted()
      setConfirmationText("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmationText("")
    onClose()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Date invalide"
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Heure invalide"
    }
  }

  const isConfirmationValid = confirmationText === "SUPPRIMER"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le rendez-vous
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Le rendez-vous sera définitivement supprimé.
          </DialogDescription>
        </DialogHeader>

        {rendezvous && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-3">Rendez-vous à supprimer :</h4>

                <div className="space-y-2 text-red-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {rendezvous.client?.prenom} {rendezvous.client?.nom}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {rendezvous.salon?.name} - {rendezvous.salon?.ville}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(rendezvous.date)} à {formatTime(rendezvous.date)}
                    </span>
                  </div>

                  {rendezvous.commentaire && (
                    <div className="text-sm">
                      <strong>Commentaire :</strong> {rendezvous.commentaire}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-sm font-medium">
                  Pour confirmer la suppression, tapez "SUPPRIMER" ci-dessous :
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez SUPPRIMER pour confirmer"
                  className={`${
                    confirmationText && !isConfirmationValid
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  autoComplete="off"
                  required
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600">Veuillez taper "SUPPRIMER" exactement</p>
                )}
                {isConfirmationValid && <p className="text-sm text-green-600">✓ Confirmation validée</p>}
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Attention :</strong> Cette suppression :
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Supprimera définitivement ce rendez-vous</li>
                  <li>Ne pourra pas être annulée</li>
                  <li>Pourrait affecter les statistiques du salon</li>
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
