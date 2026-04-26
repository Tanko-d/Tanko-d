"use client";

import { useState, useEffect } from "react";
'use client'

import * as React from 'react'
import { format, isValid, parseISO } from 'date-fns'
import {
  AlertCircle,
  Banknote,
  CalendarRange,
  Fuel,
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
  RefreshCcw,
  Search,
  Users,
  X,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import DateRangePicker, {
  type DateRangeValue,
} from '../../../components/DateRangePicker'
import { Button } from '../../../components/ui/button'

interface NormalizedTransaction {
  id: string
  date?: Date
  driverName: string
  unitLabel: string
  liters: number
  spend: number
  status: string
  notes: string
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }

  return undefined
}

function toNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return 0
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return isValid(value) ? value : undefined
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseISO(value)
    if (isValid(parsed)) {
      return parsed
    }
  }

  return undefined
}

function formatDateTime(value?: Date): string {
  if (!value || !isValid(value)) {
    return '—'
  }

  return format(value, 'dd/MM/yyyy HH:mm')
}

function formatDateOnly(value?: Date): string {
  if (!value || !isValid(value)) {
    return '—'
  }

  return format(value, 'dd/MM/yyyy')
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-ES', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`
}

function formatLiters(value: number): string {
  return `${value.toLocaleString('es-ES', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })} L`
}

function parseQueryDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

function parseRange(
  startDateParam: string | null,
  endDateParam: string | null
): { value?: DateRangeValue; error?: string } {
  const startDate = parseQueryDate(startDateParam)
  const endDate = parseQueryDate(endDateParam)

  if (startDateParam && !startDate) {
    return { error: 'Invalid startDate query parameter.' }
  }

  if (endDateParam && !endDate) {
    return { error: 'Invalid endDate query parameter.' }
  }

  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    return {
      error: 'The startDate cannot be later than the endDate.',
    }
  }

  if (!startDate && !endDate) {
    return { value: undefined }
  }

  return {
    value: {
      from: startDate,
      to: endDate,
    },
  }
}

function extractArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const keys = [
      'data',
      'transactions',
      'items',
      'results',
      'recentTransactions',
      'logs',
    ]

    for (const key of keys) {
      const value = record[key]
      if (Array.isArray(value)) {
        return value
      }
    }
  }

  return []
}

function normalizeTransaction(
  item: unknown,
  index: number
): NormalizedTransaction {
  const record = item as Record<string, unknown>

  const driverName = pickString(
    record.driverName,
    (record.driver as Record<string, unknown> | undefined)?.name,
    (record.driver as Record<string, unknown> | undefined)?.fullName,
    (record.driver as Record<string, unknown> | undefined)?.displayName,
    (record.user as Record<string, unknown> | undefined)?.name,
    record.userName,
    record.name
  )

  const unitLabel = pickString(
    (record.unit as Record<string, unknown> | undefined)?.plate,
    (record.unit as Record<string, unknown> | undefined)?.name,
    (record.unit as Record<string, unknown> | undefined)?.code,
    (record.vehicle as Record<string, unknown> | undefined)?.plate,
    (record.vehicle as Record<string, unknown> | undefined)?.name,
    record.unitName,
    record.vehicleName
  )

  const liters = toNumber(
    record.liters,
    record.quantity,
    record.amountLiters,
    record.volume,
    record.fuelLiters
  )

  const spend = toNumber(
    record.totalSpend,
    record.amount,
    record.total,
    record.cost,
    record.price,
    record.spent,
    record.releasedAmount
  )

  const status = pickString(record.status, record.state, record.type)
  const notes = pickString(record.notes, record.description, record.reason, record.observation)
  const date = parseDate(
    record.date ?? record.createdAt ?? record.transactionDate ?? record.fuelDate
  )

  return {
    id:
      pickString(record.id, record._id, record.uuid) ?? `transaction-${index}`,
    date,
    driverName: driverName ?? '—',
    unitLabel: unitLabel ?? '—',
    liters,
    spend,
    status: status ?? '—',
    notes: notes ?? '—',
  }
}

function matchesSearch(transaction: NormalizedTransaction, search: string): boolean {
  if (!search) {
    return true
  }

  const haystack = [
    transaction.driverName,
    transaction.unitLabel,
    transaction.status,
    transaction.notes,
    formatDateOnly(transaction.date),
    transaction.liters.toString(),
    transaction.spend.toString(),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

function StatCard({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  helper?: string
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="rounded-full bg-muted p-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {helper ? (
        <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}

export default function ConsumosPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const parsedRange = React.useMemo(() => {
    const params = new URLSearchParams(searchParamsString)
    return parseRange(params.get('startDate'), params.get('endDate'))
  }, [searchParamsString])

  const hasDateQuery = React.useMemo(() => {
    const params = new URLSearchParams(searchParamsString)
    return params.has('startDate') || params.has('endDate')
  }, [searchParamsString])

  const dateRangePlaceholder = hasDateQuery
    ? 'Seleccionar rango'
    : 'Últimos 30 días'

  const [search, setSearch] = React.useState('')
  const [transactions, setTransactions] = React.useState<NormalizedTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const selectedRange = parsedRange.value

  React.useEffect(() => {
    if (parsedRange.error) {
      setTransactions([])
      setError(parsedRange.error)
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const loadTransactions = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('limit', '50')

        if (selectedRange?.from) {
          params.set('startDate', format(selectedRange.from, 'yyyy-MM-dd'))
        }

        if (selectedRange?.to) {
          params.set('endDate', format(selectedRange.to, 'yyyy-MM-dd'))
        }

        const response = await fetch(
          `/api/v1/stats/recent-transactions?${params.toString()}`,
          {
            signal: controller.signal,
          }
        )

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === 'object' &&
            'message' in payload &&
            typeof payload.message === 'string'
              ? payload.message
              : 'No se pudieron cargar los consumos.'
          throw new Error(message)
        }

        const normalized = extractArray(payload).map((item, index) =>
          normalizeTransaction(item, index)
        )

        setTransactions(normalized)
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'No se pudieron cargar los consumos.'
        setError(message)
        setTransactions([])
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadTransactions()

    return () => {
      controller.abort()
    }
  }, [parsedRange.error, selectedRange?.from, selectedRange?.to])

  const filteredTransactions = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return transactions.filter((transaction) =>
      matchesSearch(transaction, normalizedSearch)
    )
  }, [search, transactions])

  const totalTransactions = filteredTransactions.length
  const totalLiters = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.liters,
    0
  )
  const totalSpend = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.spend,
    0
  )
  const averageSpend = totalTransactions ? totalSpend / totalTransactions : 0

  const activeRangeLabel = React.useMemo(() => {
    if (!selectedRange?.from && !selectedRange?.to) {
      return 'Showing the backend default last 30 days.'
    }

    if (selectedRange.from && selectedRange.to) {
      return `Showing results from ${format(selectedRange.from, 'dd/MM/yyyy')} to ${format(
        selectedRange.to,
        'dd/MM/yyyy'
      )}.`
    }

    if (selectedRange.from) {
      return `Showing results from ${format(selectedRange.from, 'dd/MM/yyyy')}.`
    }

    return 'Showing the selected range.'
  }, [selectedRange])

  const handleDateRangeChange = React.useCallback(
    (value: DateRangeValue) => {
      const params = new URLSearchParams(searchParamsString)

      if (value?.from) {
        params.set('startDate', format(value.from, 'yyyy-MM-dd'))
      } else {
        params.delete('startDate')
      }

      if (value?.to) {
        params.set('endDate', format(value.to, 'yyyy-MM-dd'))
      } else {
        params.delete('endDate')
      }

      const nextQuery = params.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParamsString]
  )

  const handleResetSearch = () => {
    setSearch('')
  }

  const emptyMessage = search.trim()
    ? `No encontramos resultados para "${search.trim()}".`
    : hasDateQuery
      ? 'No hay consumos para el rango de fechas seleccionado.'
      : 'No hay consumos disponibles.'

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
      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Consumos
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Fuel consumption activity
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Search transactions and narrow the timeline with a shareable date
              range.
            </p>
            <p className="text-xs text-muted-foreground">{activeRangeLabel}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by driver, unit, note..."
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-10 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {search ? (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
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
            <DateRangePicker
              value={selectedRange}
              onChange={handleDateRangeChange}
              placeholder={dateRangePlaceholder}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Unable to load consumos.</p>
              <p>{error}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Transactions"
          value={loading ? '—' : totalTransactions.toString()}
          icon={Users}
          helper="Filtered by the active search and date range."
        />
        <StatCard
          label="Total liters"
          value={loading ? '—' : formatLiters(totalLiters)}
          icon={Fuel}
          helper="Sum of all visible fuel logs."
        />
        <StatCard
          label="Total spend"
          value={loading ? '—' : formatCurrency(totalSpend)}
          icon={Banknote}
          helper={`Average spend per transaction: ${loading ? '—' : formatCurrency(averageSpend)}`}
        />
      </section>

      <section className="rounded-xl border bg-background shadow-sm">
        <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent transactions</h2>
            <p className="text-sm text-muted-foreground">
              Showing the latest 50 records returned by the API.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${totalTransactions} visible records`}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading consumos...
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
        ) : filteredTransactions.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium">No transactions found</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Liters</th>
                  <th className="px-4 py-3">Spend</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(transaction.date)}
                    </td>
                    <td className="px-4 py-3">{transaction.driverName}</td>
                    <td className="px-4 py-3">{transaction.unitLabel}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatLiters(transaction.liters)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatCurrency(transaction.spend)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {transaction.status}
                    </td>
                    <td className="px-4 py-3">{transaction.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
