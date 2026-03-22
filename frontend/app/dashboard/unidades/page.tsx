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
    make: "Kenworth",
    model: "T680",
    year: 2023,
    plates: "ABC-123-D",
    driver: "Juan Pérez García",
    specs: "Cummins X15 engine, 500 HP, 300-gal tank",
    permitNumber: "PERM-2024-12345",
    permitExpiry: "2025-06-15",
    monthlySpend: 25000,
    status: "active"
  },
  {
    id: 2,
    make: "Freightliner",
    model: "Cascadia",
    year: 2022,
    plates: "DEF-456-E",
    driver: "María García López",
    specs: "Detroit DD15 engine, 475 HP, 280-gal tank",
    permitNumber: "PERM-2024-23456",
    permitExpiry: "2025-08-20",
    monthlySpend: 32000,
    status: "active"
  },
  {
    id: 3,
    make: "Volvo",
    model: "VNL 860",
    year: 2024,
    plates: "GHI-789-F",
    driver: "Carlos López Martínez",
    specs: "Volvo D13 engine, 455 HP, 320-gal tank",
    permitNumber: "PERM-2024-34567",
    permitExpiry: "2025-12-10",
    monthlySpend: 28000,
    status: "active"
  },
  {
    id: 4,
    make: "International",
    model: "LT",
    year: 2021,
    plates: "JKL-012-G",
    driver: "Ana Martínez Rodríguez",
    specs: "Cummins X15 engine, 450 HP, 260-gal tank",
    permitNumber: "PERM-2024-45678",
    permitExpiry: "2024-03-25",
    monthlySpend: 18000,
    status: "inactive"
  },
  {
    id: 5,
    make: "Peterbilt",
    model: "579",
    year: 2023,
    plates: "MNO-345-H",
    driver: "Roberto Sánchez Fernández",
    specs: "PACCAR MX-13 engine, 510 HP, 290-gal tank",
    permitNumber: "PERM-2024-56789",
    permitExpiry: "2025-09-30",
    monthlySpend: 35000,
    status: "active"
  },
]

export default function UnidadesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUnits = units.filter(unit =>
    unit.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.plates.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.driver.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="e.g. Kenworth" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g. T680" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="e.g. 2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plates">Plates</Label>
                  <Input id="plates" placeholder="e.g. ABC-123-D" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specs">Specifications</Label>
                <Textarea
                  id="specs"
                  placeholder="Engine, tank capacity, features…"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="permit">Permit Number</Label>
                  <Input id="permit" placeholder="PERM-2024-XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Permit Expiry</Label>
                  <Input id="expiry" type="date" />
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
                        {unit.make} {unit.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">{unit.year}</p>
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
                    <span className="text-sm text-muted-foreground">Plates</span>
                    <span className="text-sm font-semibold text-foreground">{unit.plates}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{unit.driver}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Permit: {unit.permitNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Expiry: {new Date(unit.permitExpiry).toLocaleDateString("en-US")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-1.5">
                      <Fuel className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        ${unit.monthlySpend.toLocaleString("en-US")}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      unit.status === "active" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {unit.status === "active" ? "Active" : "Inactive"}
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
