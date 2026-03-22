"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Receipt, 
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { WalletButton } from "@/components/wallet/wallet-button"

const navigation = [
  { name: "Overview",   href: "/dashboard",           icon: LayoutDashboard },
  { name: "Users",      href: "/dashboard/usuarios",  icon: Users },
  { name: "Fleet",      href: "/dashboard/unidades",  icon: Car },
  { name: "Fuel Logs",  href: "/dashboard/consumos",  icon: Receipt },
  { name: "Locations",  href: "/dashboard/ubicaciones", icon: MapPin },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar — TANKO navy */}
      <aside
        style={{ backgroundColor: "#1B2D4F" }}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div
          style={{ borderBottomColor: "rgba(255,255,255,0.08)" }}
          className="flex h-16 items-center justify-between border-b px-5"
        >
          <Link href="/menu" className="flex items-center gap-2.5">
            <Image
              src="/tanko-logo.png"
              alt="TANKO"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="text-xl font-black tracking-widest text-white">
              TANKO
            </span>
          </Link>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                style={isActive ? { backgroundColor: "#F58220" } : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom links */}
        <div
          style={{ borderTopColor: "rgba(255,255,255,0.08)" }}
          className="border-t p-3 space-y-0.5"
        >
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Disconnect
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <WalletButton />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
