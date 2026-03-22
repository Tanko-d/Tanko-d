"use client"

import { useState } from "react"
import { 
  MapPin, 
  Search,
  Fuel,
  Clock,
  Star,
  TrendingUp
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const locations = [
  {
    id: 1,
    name: "Central CDMX Station",
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    city: "Mexico City",
    coordinates: "19.3910, -99.1787",
    transactions: 156,
    totalLiters: 28080,
    totalAmount: 702000,
    rating: 4.8,
    hours: "24 hours",
    services: ["Regular", "Premium", "Diesel"],
    position: { top: "25%", left: "35%" }
  },
  {
    id: 2,
    name: "Reforma Station",
    address: "Paseo de la Reforma 567, Col. Juárez",
    city: "Mexico City",
    coordinates: "19.4284, -99.1558",
    transactions: 98,
    totalLiters: 17640,
    totalAmount: 441000,
    rating: 4.6,
    hours: "6:00 AM - 11:00 PM",
    services: ["Regular", "Premium", "Diesel"],
    position: { top: "30%", left: "55%" }
  },
  {
    id: 3,
    name: "North Station",
    address: "Blvd. Manuel Ávila Camacho 890",
    city: "Naucalpan",
    coordinates: "19.4876, -99.2234",
    transactions: 72,
    totalLiters: 12960,
    totalAmount: 324000,
    rating: 4.5,
    hours: "24 hours",
    services: ["Regular", "Premium"],
    position: { top: "15%", left: "45%" }
  },
  {
    id: 4,
    name: "South Express Station",
    address: "Calzada de Tlalpan 2345",
    city: "Mexico City",
    coordinates: "19.3012, -99.1456",
    transactions: 124,
    totalLiters: 22320,
    totalAmount: 558000,
    rating: 4.7,
    hours: "24 hours",
    services: ["Regular", "Premium", "Diesel"],
    position: { top: "65%", left: "40%" }
  },
  {
    id: 5,
    name: "East Station",
    address: "Av. Zaragoza 678, Col. Balbuena",
    city: "Mexico City",
    coordinates: "19.4123, -99.0987",
    transactions: 85,
    totalLiters: 15300,
    totalAmount: 382500,
    rating: 4.4,
    hours: "5:00 AM - 12:00 AM",
    services: ["Regular", "Premium", "Diesel"],
    position: { top: "35%", left: "75%" }
  },
  {
    id: 6,
    name: "Querétaro Central Station",
    address: "Av. Constituyentes 456, Centro",
    city: "Querétaro",
    coordinates: "20.5881, -100.3899",
    transactions: 45,
    totalLiters: 8100,
    totalAmount: 198450,
    rating: 4.6,
    hours: "24 hours",
    services: ["Regular", "Premium", "Diesel"],
    position: { top: "20%", left: "60%" }
  },
]

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(locations[0])

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalTransactions = locations.reduce((acc, loc) => acc + loc.transactions, 0)
  const totalLiters = locations.reduce((acc, loc) => acc + loc.totalLiters, 0)
  const totalAmount = locations.reduce((acc, loc) => acc + loc.totalAmount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Locations</h1>
        <p className="text-muted-foreground">History of fuel stations used by the fleet</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {totalTransactions.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Liters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {totalLiters.toLocaleString()} L
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                ${totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fuel Load Map</CardTitle>
            <CardDescription>Stations where the fleet has loaded fuel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 50 L100 50" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M50 0 L50 100" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M0 25 L100 75" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M0 75 L100 25" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M25 0 L25 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M75 0 L75 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
              </svg>

              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all ${
                    selectedLocation.id === location.id
                      ? "bg-primary text-primary-foreground scale-110 z-10 shadow-lg"
                      : "bg-card text-primary border-2 border-primary hover:scale-105"
                  }`}
                  style={{ top: location.position.top, left: location.position.left }}
                  aria-label={`Select ${location.name}`}
                >
                  <Fuel className="h-5 w-5" />
                </button>
              ))}

              <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg bg-card/90 px-4 py-2 text-xs backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Fuel className="h-2 w-2 text-primary-foreground" />
                  </span>
                  <span className="text-muted-foreground">Station with fuel loads</span>
                </div>
              </div>
            </div>

            {selectedLocation && (
              <div className="mt-4 rounded-xl border border-primary bg-primary/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedLocation.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedLocation.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedLocation.city}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Star className="h-3 w-3 fill-primary" />
                    {selectedLocation.rating}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedLocation.transactions}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedLocation.totalLiters.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Liters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">${(selectedLocation.totalAmount / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location list */}
        <Card>
          <CardHeader>
            <CardTitle>Stations</CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search station…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedLocation.id === location.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{location.name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{location.city}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Star className="h-3 w-3 fill-primary" />
                      {location.rating}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {location.transactions} loads
                    </span>
                    <span className="font-semibold text-primary">
                      ${(location.totalAmount / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {location.hours}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
