"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Fuel,
  MapPin,
  Calendar,
  User,
  Car,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useAuth } from "@/providers/auth-provider";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001";

interface FuelLog {
  id: string;
  date: string;
  liters: number;
  amount: number;
  fuelType: string;
  station: string;
  stationAddress?: string;
  unit?: {
    plates: string;
    make: string;
    model: string;
  };
  user?: {
    name: string;
  };
}

export default function FuelLogsPage() {
  const { address: walletAddress } = useAuth();
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");

  useEffect(() => {
    async function fetchFuelLogs() {
      console.log(
        `[FuelLogs] Fetching from ${BACKEND}/api/v1/stats/recent-transactions?limit=50`,
      );
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${BACKEND}/api/v1/stats/recent-transactions?limit=50`,
        );
        console.log(`[FuelLogs] Response status: ${res.status}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log(`[FuelLogs] Response:`, data);

        if (data.success && data.data) {
          setFuelLogs(data.data);
        } else {
          setFuelLogs([]);
        }
      } catch (err) {
        console.error("[FuelLogs] Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Error de conexión");
        setFuelLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFuelLogs();
  }, [walletAddress]);

  const filtered = fuelLogs.filter(
    (c) =>
      c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.unit?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.unit?.plates?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.station?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalAmount = filtered.reduce((acc, c) => acc + c.amount, 0);
  const totalLiters = filtered.reduce((acc, c) => acc + c.liters, 0);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando registros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">Error al cargar registros</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Registros de Combustible
          </h1>
          <p className="text-muted-foreground">
            Historial de todas las transacciones de combustible
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                $
                {(totalAmount / 10000000).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Litros Cargados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {(totalLiters / 10000000).toLocaleString()} L
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {filtered.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Registros de Combustible
              </h2>
              <p className="text-sm text-muted-foreground">
                Todas las cargas registradas en el sistema
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
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
                            $
                            {(log.amount / 10000000).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {(log.liters / 10000000).toFixed(0)} L
                          </span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {log.fuelType || "Diesel"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          {log.user?.name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {log.user.name}
                            </span>
                          )}
                          {log.unit && (
                            <span className="flex items-center gap-1">
                              <Car className="h-3.5 w-3.5" />
                              {log.unit.make} {log.unit.model} (
                              {log.unit.plates})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {log.station}
                        </span>
                      </div>
                      {log.stationAddress && (
                        <p className="text-xs text-muted-foreground">
                          {log.stationAddress}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(log.date).toLocaleString("es-MX", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border border-dashed border-border my-4">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Fuel className="size-5" />
                </EmptyMedia>
                <EmptyTitle>
                  {searchQuery
                    ? "Sin resultados"
                    : "Sin registros de combustible"}
                </EmptyTitle>
                <EmptyDescription>
                  {searchQuery
                    ? `No hay registros que coincidan con "${searchQuery}". Intenta con otro término.`
                    : "Aún no hay transacciones de combustible registradas en el sistema."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
