"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  MoreHorizontal, 
  Car,
  User,
  Loader2,
  AlertCircle,
  Calendar,
  Fuel,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { UnitGrid } from "@/components/UnitGrid"
import { Unit } from "@/components/UnitCard"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"

interface Unit {
  id: string
  make: string
  model: string
  year?: number
  plates: string
  isActive: boolean
  specs?: string
  permitNumber?: string
  permitExpiry?: string
  user?: {
    name: string
  }
}

export default function UnidadesPage() {
  const { address: walletAddress } = useAuth()
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchUnits() {
      console.log(`[Units] Fetching from ${BACKEND}/api/v1/units`)
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${BACKEND}/api/v1/units`)
        console.log(`[Units] Response status: ${res.status}`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log(`[Units] Response:`, data)

        if (data.success && data.data) {
          setUnits(data.data)
        } else {
          setUnits([])
        }
      } catch (err) {
        console.error("[Units] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error de conexión")
        setUnits([])
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [walletAddress])

  const filteredUnits = units.filter(unit =>
    unit.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.plates?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando unidades...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">Error al cargar unidades</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flota</h1>
          <p className="text-muted-foreground">Gestionar vehículos registrados en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Vehículos</CardTitle>
              <CardDescription>Total: {units.length} vehículos registrados</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar vehículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UnitGrid 
            units={filteredUnits} 
            onUnitAction={(action, unit) => {
              console.log(`[Units] Action: ${action} on unit:`, unit)
              // Here would go the logic to open modals/forms as mentioned in issue
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
