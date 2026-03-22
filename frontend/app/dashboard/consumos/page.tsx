"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Filter,
  Fuel,
  MapPin,
  Calendar,
  User,
  Car,
  TrendingUp,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useWallet } from "@/providers/wallet-provider"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"


const fuelLogs = [
  { id: 1, date: "2024-03-20T10:32:00", driver: "Juan Pérez García",      unit: "Kenworth T680",        plates: "ABC-123-D", station: "Central CDMX Station",  address: "Av. Insurgentes Sur 1234, Del Valle", coords: "19.3910,-99.1787", fuelType: "Diesel", liters: 180, pricePerLiter: 25.00, amount: 4500 },
  { id: 2, date: "2024-03-20T09:15:00", driver: "María García López",     unit: "Freightliner Cascadia",plates: "DEF-456-E", station: "Reforma Station",        address: "Paseo de la Reforma 567, Juárez",    coords: "19.4284,-99.1558", fuelType: "Diesel", liters: 128, pricePerLiter: 25.00, amount: 3200 },
  { id: 3, date: "2024-03-19T18:45:00", driver: "Carlos López Martínez",  unit: "Volvo VNL 860",        plates: "GHI-789-F", station: "North Station",          address: "Blvd. Manuel Ávila Camacho 890",     coords: "19.4876,-99.2234", fuelType: "Diesel", liters: 204, pricePerLiter: 25.00, amount: 5100 },
  { id: 4, date: "2024-03-19T15:20:00", driver: "Ana Martínez Rodríguez", unit: "International LT",     plates: "JKL-012-G", station: "South Express Station",  address: "Calzada de Tlalpan 2345",            coords: "19.3012,-99.1456", fuelType: "Diesel", liters: 112, pricePerLiter: 25.00, amount: 2800 },
  { id: 5, date: "2024-03-19T11:00:00", driver: "Roberto Sánchez Fdez.",  unit: "Peterbilt 579",        plates: "MNO-345-H", station: "East Station",           address: "Av. Zaragoza 678, Balbuena",         coords: "19.4123,-99.0987", fuelType: "Diesel", liters: 168, pricePerLiter: 25.00, amount: 4200 },
  { id: 6, date: "2024-03-18T14:30:00", driver: "Juan Pérez García",      unit: "Kenworth T680",        plates: "ABC-123-D", station: "Querétaro Central",      address: "Av. Constituyentes 456, Centro",     coords: "20.5881,-100.3899",fuelType: "Diesel", liters: 195, pricePerLiter: 24.50, amount: 4777.50 },
]

export default function FuelLogsPage() {
  const { address: walletAddress, isConnected } = useWallet()
  const [searchQuery, setSearchQuery]     = useState("")
  const [filterPeriod, setFilterPeriod]   = useState("all")
  const [isCreatingEscrow, setIsCreatingEscrow] = useState(false)

  async function createEscrow() {
    if (!isConnected || !walletAddress) {
      toast.error("Wallet not connected", {
        description: "Connect your Freighter wallet before creating an escrow.",
      })
      return
    }

    setIsCreatingEscrow(true)
    try {
      // Simulate network latency for demo
      await new Promise((resolve) => setTimeout(resolve, 2200))

      const DEMO_ESCROW_ID = "EoBxdB2tFg6FvSwJO4JxQg"

      toast.success("Escrow created successfully", {
        description: (
          <div className="mt-1 space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Contract ID:</span>
              <code className="font-mono font-semibold text-white break-all">{DEMO_ESCROW_ID}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Network:</span>
              <span className="text-white">Stellar Testnet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Signer:</span>
              <code className="font-mono text-white/80 truncate">{walletAddress?.slice(0, 16)}…</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Status:</span>
              <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-green-300 font-medium">initialized</span>
            </div>
          </div>
        ),
        duration: 14000,
      })
    } finally {
      setIsCreatingEscrow(false)
    }
  }

  const filtered = fuelLogs.filter(c =>
    c.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.plates.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.station.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAmount = filtered.reduce((acc, c) => acc + c.amount, 0)
  const totalLiters = filtered.reduce((acc, c) => acc + c.liters, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fuel Logs</h1>
          <p className="text-muted-foreground">History of all fuel transactions</p>
        </div>

        {/* Escrow action */}
        <div className="flex items-center gap-2">
          {!isConnected && (
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Connect wallet
            </div>
          )}
          <Button
            onClick={createEscrow}
            disabled={isCreatingEscrow || !isConnected}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {isCreatingEscrow
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <ShieldCheck className="mr-2 h-4 w-4" />}
            {isCreatingEscrow ? "Creating escrow…" : "Create Escrow (Trustless Work)"}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Signer info banner */}
      {isConnected && walletAddress && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs dark:border-green-800/30 dark:bg-green-900/10">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-green-700 dark:text-green-400 font-medium">Signer:</span>
          <code className="font-mono text-green-800 dark:text-green-300 truncate">{walletAddress}</code>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liters Loaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{totalLiters.toLocaleString()} L</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{filtered.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Fuel Log Records</h2>
              <p className="text-sm text-muted-foreground">All fuel loads registered in the system</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Fuel className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          ${log.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {log.liters} L
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {log.fuelType}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {log.driver}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {log.unit} ({log.plates})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{log.station}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.address}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(log.date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>Price/L: ${log.pricePerLiter.toFixed(2)}</span>
                  <span>Coords: {log.coords}</span>
                  <span>ID: #{log.id.toString().padStart(6, "0")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
