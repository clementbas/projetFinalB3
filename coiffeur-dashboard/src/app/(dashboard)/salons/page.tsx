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
import { Plus, Search, Edit, Trash2, MapPin, Star } from "lucide-react"
import { useSalons } from "@/hooks/use-api"
import { LoadingTable } from "@/components/loading-spinner"
import { CreateSalonDialog } from "@/components/create-salon-dialog"
import { EditSalonDialog } from "@/components/edit-salon-dialog"
import { DeleteSalonDialog } from "@/components/delete-salon-dialog"
import { SalonHorairesDropdown } from "@/components/salon-horaires-dropdown"

export default function SalonsPage() {
  const { salons, loading, error, refetch } = useSalons()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [selectedSalonForDelete, setSelectedSalonForDelete] = useState<{ _id: string; name: string } | null>(null)

  // Filtre sécurisé pour la recherche
  const filteredSalons = salons.filter((salon) => {
    const name = salon.name || ""
    const ville = salon.ville || ""
    const description = salon.description || ""

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calcul sécurisé de la note moyenne
  const getAverageRating = (commentaires: Array<{ note: number }>) => {
    if (!commentaires || commentaires.length === 0) return "N/A"
    const sum = commentaires.reduce((acc, comment) => acc + (comment.note || 0), 0)
    return (sum / commentaires.length).toFixed(1)
  }

  // Couleurs pour les catégories
  const getCategorieColor = (categorie: string) => {
    switch (categorie) {
      case "homme":
        return "bg-blue-100 text-blue-800"
      case "femme":
        return "bg-pink-100 text-pink-800"
      case "mixte":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditSalon = (salonId: string) => {
    setSelectedSalonId(salonId)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSalon = (salon: { _id: string; name: string }) => {
    setSelectedSalonForDelete(salon)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedSalonId(null)
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedSalonForDelete(null)
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
                <BreadcrumbPage>Salons</BreadcrumbPage>
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
              <BreadcrumbPage>Salons</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Salons</CardTitle>
                <CardDescription>{loading ? "Chargement..." : `${salons.length} salon(s) trouvé(s)`}</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Salon
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un salon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {loading ? (
              <LoadingTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix min.</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Horaires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {searchTerm ? "Aucun salon trouvé pour cette recherche" : "Aucun salon disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSalons.map((salon) => (
                      <TableRow key={salon._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{salon.name || "Nom non défini"}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {salon.description || "Aucune description"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{salon.ville || "Ville non définie"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{salon.address || "Adresse non définie"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategorieColor(salon.categorie || "mixte")}>
                            {salon.categorie || "mixte"}
                          </Badge>
                        </TableCell>
                        <TableCell>{salon.prixMinimum || 0}€</TableCell>
                        <TableCell>
                          <div className="text-sm">{salon.owner?.email || "Email non défini"}</div>
                          <div className="text-xs text-muted-foreground">{salon.owner?.role || "Rôle non défini"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{getAverageRating(salon.commentaires)}</span>
                            <span className="text-xs text-muted-foreground">({salon.commentaires?.length || 0})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <SalonHorairesDropdown horaires={salon.horaires || []} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSalon(salon._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSalon({ _id: salon._id, name: salon.name })}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Dialogs */}
      <CreateSalonDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSalonCreated={refetch}
      />

      <EditSalonDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSalonUpdated={refetch}
        salonId={selectedSalonId}
      />

      <DeleteSalonDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSalonDeleted={refetch}
        salon={selectedSalonForDelete}
      />
    </SidebarInset>
  )
}
