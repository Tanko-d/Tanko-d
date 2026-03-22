"use client"

import { useState } from "react"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Car,
  User,
  FileText,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Fuel
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
import { Textarea } from "@/components/ui/textarea"

const units = [
  {
    id: 1,
    marca: "Kenworth",
    modelo: "T680",
    anio: 2023,
    placas: "ABC-123-D",
    usuario: "Juan Pérez García",
    especificaciones: "Cummins X15 engine, 500 HP, 300-gal tank",
    numeroPermiso: "PERM-2024-12345",
    vigenciaPermiso: "2025-06-15",
    consumoMes: 25000,
    estado: "activo"
  },
  {
    id: 2,
    marca: "Freightliner",
    modelo: "Cascadia",
    anio: 2022,
    placas: "DEF-456-E",
    usuario: "María García López",
    especificaciones: "Detroit DD15 engine, 475 HP, 280-gal tank",
    numeroPermiso: "PERM-2024-23456",
    vigenciaPermiso: "2025-08-20",
    consumoMes: 32000,
    estado: "activo"
  },
  {
    id: 3,
    marca: "Volvo",
    modelo: "VNL 860",
    anio: 2024,
    placas: "GHI-789-F",
    usuario: "Carlos López Martínez",
    especificaciones: "Volvo D13 engine, 455 HP, 320-gal tank",
    numeroPermiso: "PERM-2024-34567",
    vigenciaPermiso: "2025-12-10",
    consumoMes: 28000,
    estado: "activo"
  },
  {
    id: 4,
    marca: "International",
    modelo: "LT",
    anio: 2021,
    placas: "JKL-012-G",
    usuario: "Ana Martínez Rodríguez",
    especificaciones: "Cummins X15 engine, 450 HP, 260-gal tank",
    numeroPermiso: "PERM-2024-45678",
    vigenciaPermiso: "2024-03-25",
    consumoMes: 18000,
    estado: "inactivo"
  },
  {
    id: 5,
    marca: "Peterbilt",
    modelo: "579",
    anio: 2023,
    placas: "MNO-345-H",
    usuario: "Roberto Sánchez Fernández",
    especificaciones: "PACCAR MX-13 engine, 510 HP, 290-gal tank",
    numeroPermiso: "PERM-2024-56789",
    vigenciaPermiso: "2025-09-30",
    consumoMes: 35000,
    estado: "activo"
  },
]

export default function UnidadesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUnits = units.filter(unit =>
    unit.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.placas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.usuario.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fleet</h1>
          <p className="text-muted-foreground">Manage registered vehicles in the system</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the details of the new vehicle
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="marca">Make</Label>
                  <Input id="marca" placeholder="e.g. Kenworth" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Model</Label>
                  <Input id="modelo" placeholder="e.g. T680" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="anio">Year</Label>
                  <Input id="anio" type="number" placeholder="e.g. 2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placas">Plates</Label>
                  <Input id="placas" placeholder="e.g. ABC-123-D" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="especificaciones">Specifications</Label>
                <Textarea
                  id="especificaciones"
                  placeholder="Engine, tank capacity, features…"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="permiso">Permit Number</Label>
                  <Input id="permiso" placeholder="PERM-2024-XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vigencia">Permit Expiry</Label>
                  <Input id="vigencia" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={(e) => {
                  e.preventDefault()
                  setIsDialogOpen(false)
                }}>
                  Save Vehicle
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
              <CardTitle>Vehicle List</CardTitle>
              <CardDescription>Total: {units.length} vehicles registered</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search vehicle…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUnits.map((unit) => (
              <div 
                key={unit.id}
                className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {unit.marca} {unit.modelo}
                      </h3>
                      <p className="text-sm text-muted-foreground">{unit.anio}</p>
                    </div>
                  </div>
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
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-sm text-muted-foreground">Placas</span>
                    <span className="text-sm font-semibold text-foreground">{unit.placas}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{unit.usuario}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Permit: {unit.numeroPermiso}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Expiry: {new Date(unit.vigenciaPermiso).toLocaleDateString("en-US")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5">
                      <Fuel className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        ${unit.consumoMes.toLocaleString("en-US")}
                      </span>
                      <span className="text-xs text-muted-foreground">/mes</span>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      unit.estado === "activo" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {unit.estado === "activo" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
