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
import { Search, Edit, Trash2, UserCheck, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/use-api"
import { LoadingTable } from "@/components/loading-spinner"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { EditUserDialog } from "@/components/edit-user-dialog"
import { DeleteUserDialog } from "@/components/delete-user-dialog"

export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{
    _id: string
    nom: string
    prenom: string
    email: string
  } | null>(null)

  const filteredUsers = users.filter((user) => {
    // Sécuriser toutes les valeurs avec des fallbacks
    const nom = user.nom || ""
    const prenom = user.prenom || ""
    const email = user.email || ""
    const role = user.role || ""

    const matchesSearch =
      nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "coiffeur":
        return "default"
      case "user":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "coiffeur":
        return "Coiffeur"
      case "user":
        return "Utilisateur"
      default:
        return role
    }
  }

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (user: { _id: string; nom: string; prenom: string; email: string }) => {
    setSelectedUserForDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedUserId(null)
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSelectedUserForDelete(null)
  }

  if (error) {
    return (
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Utilisateurs</BreadcrumbPage>
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
              <BreadcrumbPage>Utilisateurs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  {loading ? "Chargement..." : `${users.length} utilisateur(s) trouvé(s)`}
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel Utilisateur
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                  <SelectItem value="coiffeur">Coiffeurs</SelectItem>
                  <SelectItem value="user">Utilisateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <LoadingTable />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {searchTerm || roleFilter !== "all"
                          ? "Aucun utilisateur trouvé pour cette recherche"
                          : "Aucun utilisateur disponible"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <div>
                              <div className="font-medium">
                                {user.prenom || ""} {user.nom || ""}
                              </div>
                              <div className="text-sm text-muted-foreground">ID: {user._id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email || "Email non défini"}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role || "user")}>
                            {getRoleLabel(user.role || "user")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteUser({
                                  _id: user._id,
                                  nom: user.nom,
                                  prenom: user.prenom,
                                  email: user.email,
                                })
                              }
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
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onUserCreated={refetch}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onUserUpdated={refetch}
        userId={selectedUserId}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onUserDeleted={refetch}
        user={selectedUserForDelete}
      />
    </SidebarInset>
  )
}
