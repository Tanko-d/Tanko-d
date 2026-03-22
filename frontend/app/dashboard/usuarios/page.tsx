"use client"

import { useState } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Car,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const users = [
  {
    id: 1,
    nombre: "Juan Pérez García",
    email: "juan.perez@empresa.com",
    telefono: "+52 55 1234 5678",
    unidades: 2,
    consumoMes: 45000,
    estado: "activo",
    fechaRegistro: "2024-01-15"
  },
  {
    id: 2,
    nombre: "María García López",
    email: "maria.garcia@empresa.com",
    telefono: "+52 55 2345 6789",
    unidades: 1,
    consumoMes: 32000,
    estado: "activo",
    fechaRegistro: "2024-02-20"
  },
  {
    id: 3,
    nombre: "Carlos López Martínez",
    email: "carlos.lopez@empresa.com",
    telefono: "+52 55 3456 7890",
    unidades: 3,
    consumoMes: 78000,
    estado: "activo",
    fechaRegistro: "2024-01-08"
  },
  {
    id: 4,
    nombre: "Ana Martínez Rodríguez",
    email: "ana.martinez@empresa.com",
    telefono: "+52 55 4567 8901",
    unidades: 1,
    consumoMes: 28000,
    estado: "inactivo",
    fechaRegistro: "2024-03-10"
  },
  {
    id: 5,
    nombre: "Roberto Sánchez Fernández",
    email: "roberto.sanchez@empresa.com",
    telefono: "+52 55 5678 9012",
    unidades: 2,
    consumoMes: 52000,
    estado: "activo",
    fechaRegistro: "2024-02-05"
  },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage drivers and fleet wallet users</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details of the new wallet user
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Full name</Label>
                <Input id="nombre" placeholder="e.g. Juan Pérez García" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Phone</Label>
                <Input id="telefono" type="tel" placeholder="+52 55 1234 5678" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={(e) => {
                  e.preventDefault()
                  setIsDialogOpen(false)
                }}>
                  Save User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>Total: {users.length} users registered</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search user…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Units</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Monthly Spend</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {user.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.fechaRegistro).toLocaleDateString("en-US")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-sm text-foreground">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {user.telefono}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{user.unidades}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-foreground">
                        ${user.consumoMes.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.estado === "activo"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {user.estado === "activo" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
