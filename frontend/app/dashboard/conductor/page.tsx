"use client"

import { useState } from "react"
import {
  Fuel,
  Copy,
  CheckCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Droplets,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { useWallet } from "@/providers/wallet-provider"

const BACKEND      = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"
const USDC_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"

// Demo conductor Stellar address — receives escrow funds
const CONDUCTOR_ADDRESS = "GBL5PBYAGMRCGRH4GG6HGN3EWLFK555VFHQWUOP72AEDU4DEAYNQDAUI"


const DRIVER = {
  name: "Juan Pérez García",
  plates: "ABC-123-D",
  unit: "Kenworth T680",
  balance: 2450.0,
  escrowLimit: 5000.0,
  escrowAvailable: 3200.0,
  dieselPrice: 25.0,
}

const HISTORY = [
  { id: "ESC-0012", date: "2024-03-20", liters: 180, amount: 4500, status: "completed", location: "Central CDMX Station" },
  { id: "ESC-0011", date: "2024-03-18", liters: 120, amount: 3000, status: "completed", location: "Reforma Station" },
  { id: "ESC-0010", date: "2024-03-15", liters: 90,  amount: 2250, status: "pending",   location: "North Station" },
]

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`
}

export default function DriverWalletPage() {
  const { address: walletAddress, isConnected } = useWallet()
  const [copied, setCopied]             = useState(false)
  const [liters, setLiters]             = useState("")
  const [isRequesting, setIsRequesting] = useState(false)

  const calculatedAmount = liters ? (parseFloat(liters) * DRIVER.dieselPrice).toFixed(2) : ""
  const usedPct = ((DRIVER.escrowLimit - DRIVER.escrowAvailable) / DRIVER.escrowLimit) * 100

  function copyAddress() {
    navigator.clipboard.writeText(CONDUCTOR_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function requestFunds() {
    if (!liters || parseFloat(liters) <= 0) {
      toast.error("Enter a valid number of liters")
      return
    }
    if (parseFloat(calculatedAmount) > DRIVER.escrowAvailable) {
      toast.error("Amount exceeds available escrow limit")
      return
    }
    if (!isConnected || !walletAddress) {
      toast.error("Wallet not connected", { description: "Connect your Freighter wallet first." })
      return
    }

    setIsRequesting(true)
    try {
      const payload = {
        signer:       walletAddress,
        engagementId: "001",
        title:        `Fuel request — ${liters}L Diesel · ${DRIVER.unit}`,
        roles: {
          sender:          walletAddress,
          serviceProvider: CONDUCTOR_ADDRESS,
          platformAddress: walletAddress,
          releaseSigner:   walletAddress,
          disputeResolver: walletAddress,
        },
        amount:      1,
        platformFee: 0,
        milestones: [
          { description: `Diesel — ${liters}L · ${DRIVER.unit}`, amount: 1 },
        ],
        trustline: { address: USDC_TESTNET, symbol: "USDC" },
      }

      const res  = await fetch(`${BACKEND}/api/v1/escrow/single/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      const preview = (
        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-black/10 p-2 text-xs font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      )

      if (res.ok) {
        toast.success(
          `Request sent: ${liters}L · $${parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          { description: preview, duration: 12000 }
        )
        setLiters("")
      } else {
        toast.error("Backend rejected the request", { description: preview, duration: 10000 })
      }
    } catch (err) {
      toast.error("Connection error", { description: String(err) })
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">

      {/* ── WALLET CARD ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 p-6 text-white shadow-2xl shadow-indigo-500/40">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80">TANKO</span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            Testnet · Stellar
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Driver</p>
          <p className="mt-0.5 text-xl font-bold">{DRIVER.name}</p>
          <p className="text-sm text-white/60">{DRIVER.unit} · {DRIVER.plates}</p>
        </div>

        <button
          onClick={copyAddress}
          className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-mono text-xs text-white/70 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          {truncate(CONDUCTOR_ADDRESS)}
          {copied
            ? <CheckCheck className="h-3.5 w-3.5 text-green-300" />
            : <Copy className="h-3.5 w-3.5" />}
        </button>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Available balance</p>
          <p className="mt-1 text-4xl font-black tracking-tight">
            ${DRIVER.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            <span className="ml-2 text-base font-normal text-white/50">USD</span>
          </p>
        </div>
      </div>

      {/* ── LIMIT BAR ── */}
      <Card className="border-border">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Max escrow limit</span>
            <span className="font-bold text-foreground">
              ${DRIVER.escrowLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
            <span>Used: ${(DRIVER.escrowLimit - DRIVER.escrowAvailable).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span>Available: <strong className="text-foreground">${DRIVER.escrowAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Droplets className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max liters</p>
                <p className="text-sm font-bold text-foreground">
                  {(DRIVER.escrowAvailable / DRIVER.dieselPrice).toFixed(0)} L
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Diesel price</p>
                <p className="text-sm font-bold text-foreground">${DRIVER.dieselPrice}/L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── REQUEST FUNDS ── */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            Request from Escrow
          </CardTitle>
          <CardDescription>Request funds for your next fuel load</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liters" className="text-xs font-medium">Liters needed</Label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="liters"
                  type="number"
                  placeholder="0"
                  min={1}
                  max={DRIVER.escrowAvailable / DRIVER.dieselPrice}
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Calculated amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  readOnly
                  value={calculatedAmount ? parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}
                  placeholder="0.00"
                  className="cursor-default pl-6 bg-muted/50 font-semibold"
                />
              </div>
            </div>
          </div>

          {liters && parseFloat(liters) > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-300">
              <strong>{liters}L</strong> Diesel · <strong>${parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> USD
              {parseFloat(calculatedAmount) > DRIVER.escrowAvailable && (
                <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
                  ⚠ Exceeds available limit (${DRIVER.escrowAvailable.toLocaleString("en-US")})
                </p>
              )}
            </div>
          )}

          <Button
            onClick={requestFunds}
            disabled={isRequesting || !liters || parseFloat(liters) <= 0 || !isConnected}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {isRequesting
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <ArrowUpRight className="mr-2 h-4 w-4" />}
            {isRequesting ? "Sending request…" : isConnected ? "Request funds" : "Connect wallet first"}
          </Button>
        </CardContent>
      </Card>

      {/* ── HISTORY ── */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {HISTORY.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  tx.status === "completed" ? "bg-emerald-500/10"
                  : tx.status === "pending"  ? "bg-amber-500/10"
                  : "bg-red-500/10"
                }`}>
                  {tx.status === "completed"
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : tx.status === "pending"
                    ? <Clock className="h-5 w-5 text-amber-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.id}</p>
                  <p className="text-xs text-muted-foreground">{tx.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.liters}L · {tx.date}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  tx.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {tx.status === "completed" ? "Completed" : "Pending"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
