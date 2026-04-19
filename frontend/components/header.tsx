"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Fuel, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/menu" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Fuel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TANKO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Beneficios
          </Link>
          <Link href="#mapa" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Estaciones
          </Link>
          <Link href="#registro" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Registro
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Iniciar Sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="#registro">
              <Wallet className="mr-2 h-4 w-4" />
              Obtener Monedero
            </Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container mx-auto flex flex-col gap-4 p-4">
            <Link href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Beneficios
            </Link>
            <Link href="#mapa" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Estaciones
            </Link>
            <Link href="#registro" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Registro
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="#registro">
                  <Wallet className="mr-2 h-4 w-4" />
                  Obtener Monedero
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
