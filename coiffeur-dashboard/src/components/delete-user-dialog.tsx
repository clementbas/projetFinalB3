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

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onUserDeleted: () => void
  user: {
    _id: string
    nom: string
    prenom: string
    email: string
  } | null
}

export function DeleteUserDialog({ isOpen, onClose, onUserDeleted, user }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const expectedText = user.email
    if (confirmationText !== expectedText) {
      toast.error("L'email ne correspond pas")
      return
    }

    setIsLoading(true)

    try {
      await apiService.deleteUser(user._id)
      toast.success("Utilisateur supprimé avec succès !")
      onClose()
      onUserDeleted()
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

  const isConfirmationValid = confirmationText === user?.email

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données de l'utilisateur seront définitivement supprimées.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Utilisateur à supprimer :</h4>
                <div className="text-red-700">
                  <p className="font-semibold">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-sm font-medium">
                  Pour confirmer la suppression, tapez l'email de l'utilisateur ci-dessous :
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Tapez "${user.email}" pour confirmer`}
                  className={`${
                    confirmationText && !isConfirmationValid
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  autoComplete="off"
                  required
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600">L'email ne correspond pas</p>
                )}
                {isConfirmationValid && <p className="text-sm text-green-600">✓ Email confirmé</p>}
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Attention :</strong> Cette suppression affectera également :
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Tous les rendez-vous de cet utilisateur</li>
                  <li>Tous les commentaires laissés</li>
                  <li>L'historique des connexions</li>
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
