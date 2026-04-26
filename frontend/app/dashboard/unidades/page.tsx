"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Car,
  User,
  Loader2,
  AlertCircle,
  Calendar,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useAuth } from "@/providers/auth-provider";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001";

interface Unit {
  id: string;
  make: string;
  model: string;
  year?: number;
  plates: string;
  isActive: boolean;
  specs?: string;
  permitNumber?: string;
  permitExpiry?: string;
  user?: {
    name: string;
  };
}

export default function UnidadesPage() {
  const { address: walletAddress } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchUnits() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND}/api/v1/units`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUnits(data.success && data.data ? data.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de conexión");
        setUnits([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, [walletAddress]);

  const filteredUnits = units.filter(
    (unit) =>
      unit.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.plates?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando unidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-medium text-destructive">
            Error al cargar unidades
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flota</h1>
        <p className="text-muted-foreground">
          Gestionar vehículos registrados en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lista de Vehículos</CardTitle>
              <CardDescription>
                Total: {units.length} vehículos registrados
              </CardDescription>
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
          {filteredUnits.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
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
                        {unit.year && (
                          <p className="text-sm text-muted-foreground">
                            {unit.year}
                          </p>
                        )}
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
                          Ver detalles
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-sm text-muted-foreground">
                        Placas
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {unit.plates}
                      </span>
                    </div>

                    {unit.user && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {unit.user.name}
                        </span>
                      </div>
                    )}

                    {unit.permitNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Permiso: {unit.permitNumber}
                        </span>
                      </div>
                    )}

                    {unit.permitExpiry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Vence:{" "}
                          {new Date(unit.permitExpiry).toLocaleDateString(
                            "es-MX",
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          unit.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {unit.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border border-dashed border-border my-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Car className="size-5" />
                </EmptyMedia>
                <EmptyTitle>
                  {searchQuery ? "Sin resultados" : "Sin vehículos registrados"}
                </EmptyTitle>
                <EmptyDescription>
                  {searchQuery
                    ? `No hay vehículos que coincidan con "${searchQuery}". Intenta con otro término.`
                    : "Aún no has registrado ningún vehículo en la flota. Los vehículos aparecerán aquí una vez que sean agregados."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
