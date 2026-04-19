'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Fuel,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Truck,
  Building2,
  BadgeCheck,
  Lock,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'

const FEATURES = [
  {
    icon: Lock,
    title: 'Smart Escrow',
    description:
      'Every fuel authorization is backed by a Trustless Work escrow on Stellar. Funds are locked until the load is confirmed — no more cash advances.',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description:
      'Once the manager approves, drivers receive funds in seconds directly to their Stellar wallet, anywhere in the country.',
  },
  {
    icon: ShieldCheck,
    title: 'Tamper-Proof Records',
    description:
      'Every transaction is recorded on-chain. Audits, disputes, and compliance reports are generated automatically.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Control',
    description:
      'Fleet managers see the entire operation live — liters, units, locations, and spend — in one dashboard.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    actor: 'Fleet Manager',
    icon: Building2,
    title: 'Authorize a Fuel Load',
    description:
      'The manager logs a fuel request in the dashboard and creates an escrow contract that locks the exact amount needed.',
  },
  {
    step: '02',
    actor: 'Blockchain',
    icon: BadgeCheck,
    title: 'Escrow is Created',
    description:
      'Trustless Work deploys a smart contract on Stellar Testnet. The funds are held securely until the conditions are met.',
  },
  {
    step: '03',
    actor: 'Driver',
    icon: Truck,
    title: 'Driver Loads Fuel',
    description:
      'The driver loads the fuel at the station. The transaction is linked to the escrow and visible to the manager.',
  },
  {
    step: '04',
    actor: 'Fleet Manager',
    icon: CheckCircle2,
    title: 'Funds Released',
    description:
      'The manager approves and releases the escrow. Funds land in the driver\'s wallet instantly. No cash, no risk.',
  },
]

export default function MenuPage() {
  const { isConnected, role } = useAuth()
  const router = useRouter()

  const handleCTA = () => {
    if (isConnected && role) {
      router.push(role === 'CONDUCTOR' ? '/dashboard/conductor' : '/dashboard')
    } else {
      router.push('/connect')
    }
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0F1E35 40%, #0d1f3c 100%)' }}
    >
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-[#0F1E35]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #F58220, #e06b10)' }}
            >
              <Fuel className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">TANKO</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#for-whom" className="hover:text-white transition-colors">For whom</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="font-semibold text-white"
              style={{ background: '#F58220' }}
              onClick={() => router.push('/connect')}
            >
              <Wallet className="mr-1 h-3.5 w-3.5" />Connect wallet
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
        {/* glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #F58220 0%, transparent 70%)' }}
        />

        <div
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400"
        >
          <Globe className="h-3.5 w-3.5" /> Built on Stellar · Hack+ Alebrije CDMX 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Fuel management,{' '}
          <span style={{ color: '#F58220' }}>trustlessly.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-white/50 mb-10 leading-relaxed">
          TANKO replaces cash advances and corporate cards with on-chain escrows.
          Fleet managers authorize, the blockchain holds, drivers load — all in
          seconds and fully auditable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="font-semibold text-white px-8 text-base"
            style={{ background: 'linear-gradient(135deg, #F58220, #e06b10)' }}
            onClick={handleCTA}
          >
            {isConnected ? 'Open Dashboard' : 'Connect wallet'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <a
            href="#how-it-works"
            className="text-sm text-white/45 hover:text-white/70 transition-colors"
          >
            See how it works ↓
          </a>
        </div>

        {/* stats */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/10">
          {[
            { value: '< 5 s', label: 'Settlement time' },
            { value: '$0', label: 'Risk exposure' },
            { value: '100%', label: 'On-chain audit trail' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-8 px-4"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-3xl font-bold" style={{ color: '#F58220' }}>
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-orange-400/70 mb-3 font-semibold">
            Why TANKO
          </p>
          <h2 className="text-4xl font-bold">Everything your fleet needs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/8 p-8 transition-all duration-300 hover:border-orange-500/30"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: 'rgba(245,130,32,0.15)' }}
              >
                <f.icon className="h-5 w-5" style={{ color: '#F58220' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-24"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-orange-400/70 mb-3 font-semibold">
              The flow
            </p>
            <h2 className="text-4xl font-bold">How it works</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative flex flex-col items-center text-center">
                {/* connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-10 left-[calc(50%+2.75rem)] w-[calc(100%-5.5rem)] h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(245,130,32,0.4), rgba(245,130,32,0.05))' }}
                  />
                )}
                <div
                  className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10"
                  style={{ background: 'rgba(245,130,32,0.1)' }}
                >
                  <step.icon className="h-8 w-8" style={{ color: '#F58220' }} />
                  <span
                    className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: '#F58220', color: '#0F1E35' }}
                  >
                    {step.step}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1 font-semibold">
                  {step.actor}
                </p>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For whom ── */}
      <section id="for-whom" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-orange-400/70 mb-3 font-semibold">
            Who uses TANKO
          </p>
          <h2 className="text-4xl font-bold">Built for two roles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manager card */}
          <div
            className="rounded-2xl border border-white/10 p-10"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <Building2 className="h-10 w-10 mb-6" style={{ color: '#F58220' }} />
            <h3 className="text-2xl font-bold mb-3">Fleet Manager</h3>
            <p className="text-white/45 text-sm mb-6 leading-relaxed">
              Control every cent of your fuel budget. Authorize loads, release funds,
              and view your entire operation in real time — without handing out
              cash or cards.
            </p>
            <ul className="space-y-2">
              {[
                'Create escrows per fuel load',
                'Approve & release funds on-chain',
                'Real-time fleet dashboard',
                'Automatic audit trail',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#F58220' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Driver card */}
          <div
            className="rounded-2xl border border-white/10 p-10"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <Truck className="h-10 w-10 mb-6" style={{ color: '#38d9a9' }} />
            <h3 className="text-2xl font-bold mb-3">Driver</h3>
            <p className="text-white/45 text-sm mb-6 leading-relaxed">
              No more waiting for cash or dealing with receipts. Request the fuel
              you need, load up, and receive payment instantly to your Stellar
              wallet once the load is confirmed.
            </p>
            <ul className="space-y-2">
              {[
                'Virtual wallet on Stellar',
                'Request fuel loads on the go',
                'Instant settlement on approval',
                'No cash — no risk',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#38d9a9' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24"
        style={{ background: 'rgba(245,130,32,0.05)', borderTop: '1px solid rgba(245,130,32,0.1)' }}
      >
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-white/45 mb-10">
            Connect your Freighter wallet and start managing your fleet on-chain
            in under a minute.
          </p>
          <Button
            size="lg"
            className="font-semibold text-white px-10 text-base"
            style={{ background: 'linear-gradient(135deg, #F58220, #e06b10)' }}
            onClick={handleCTA}
          >
            {isConnected ? 'Open Dashboard' : 'Connect wallet & start'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fuel className="h-3.5 w-3.5" style={{ color: '#F58220' }} />
            <span className="font-semibold text-white/40">TANKO</span>
          </div>
          <span>Stellar Testnet · Trustless Work · Hack+ Alebrije CDMX 2026</span>
          <div className="flex items-center gap-4">
            <Link href="/connect" className="hover:text-white/50 transition-colors">Connect</Link>
            <Link href="/dashboard" className="hover:text-white/50 transition-colors">Dashboard</Link>
            <Link href="/dashboard/conductor" className="hover:text-white/50 transition-colors">Driver</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
