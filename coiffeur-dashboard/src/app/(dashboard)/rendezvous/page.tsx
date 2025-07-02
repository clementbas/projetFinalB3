"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Search, Calendar, Clock, MapPin, X, User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRendezVous } from "@/hooks/use-api"
import { LoadingTable } from "@/components/loading-spinner"
import { toast } from "sonner"
import { DeleteRendezVousDialog } from "@/components/delete-rendezvous-dialog"
import type { RendezVous } from "@/lib/api"

export default function RendezVousPage() {
  const { rendezvous, loading, error, refetch } = useRendezVous()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRendezVousForDelete, setSelectedRendezVousForDelete] = useState<RendezVous | null>(null)

  // Filtre sécurisé pour la recherche
  const filteredRdv = rendezvous.filter((rdv) => {
    const clientNom = rdv.client?.nom || ''
    const clientPrenom = rdv.client?.prenom || ''
    const clientEmail = rdv.client?.email || ''
    const salonName = rdv.salon?.name || ''
    const salonVille = rdv.salon?.ville || ''
    
    const matchesSearch =
      clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salonVille.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || rdv.statut === statusFilter
    return matchesSearch && matchesStatus
  })

  // Couleurs pour les statuts
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmé":
        return "default"
      case "en attente":
        return "secondary"
      case "annulé":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Labels pour les statuts
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmé":
        return "Confirmé"
      case "en attente":
        return "En attente"
      case "annulé":
        return "Annulé"
      default:
        return status || "Inconnu"
    }
  }

  // Formatage de la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return "Date invalide"
    }
  }

  // Formatage de l'heure
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("fr-FR", {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "Heure invalide"
    }
  }

  const handleDeleteRendezVous = (rdv: RendezVous) => {
    setSelectedRendezVousForDelete(rdv)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedRendezVousForDelete(null)
  }

  // Gestion des erreurs
  if (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Rendez-vous</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Erreur de connexion</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch}>Réessayer</Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Rendez-vous</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Rendez-vous</CardTitle>
            <CardDescription>
              {loading ? "Chargement..." : `${rendezvous.length} rendez-vous trouvé(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un rendez-vous..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="confirmé">Confirmés</SelectItem>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="annulé">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <LoadingTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRdv.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || statusFilter !== "all" 
                          ? "Aucun rendez-vous trouvé pour cette recherche" 
                          : "Aucun rendez-vous disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRdv.map((rdv) => (
                      <TableRow key={rdv._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {(rdv.client?.prenom || '')} {(rdv.client?.nom || '')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {rdv.client?.email || 'Email non défini'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{rdv.salon?.name || 'Salon non défini'}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rdv.salon?.ville || 'Ville non définie'}
                            </div>
                            {rdv.salon?.adress && (
                              <div className="text-xs text-muted-foreground">
                                {rdv.salon.adress}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDate(rdv.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatTime(rdv.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm">
                            {rdv.commentaire || 'Aucun commentaire'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(rdv.statut)}>
                            {getStatusLabel(rdv.statut)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {rdv.statut !== 'annulé' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRendezVous(rdv)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Supprimer le rendez-vous"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      <DeleteRendezVousDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onRendezVousDeleted={refetch}
        rendezvous={selectedRendezVousForDelete}
      />
    </SidebarInset>
  )
}