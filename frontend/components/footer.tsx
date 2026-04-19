import Link from "next/link"
import { Fuel, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/menu" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Fuel className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TANKO</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Plataforma líder en monederos electrónicos para combustibles. Comisiones bajas, registro rápido y la red de estaciones más grande del país.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Plataforma</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link href="#mapa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Estaciones
                </Link>
              </li>
              <li>
                <Link href="#registro" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Registro
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Aviso de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">Contacto</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                soporte@tanko.mx
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +52 800 123 4567
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                Av. Paseo de la Reforma 505, Col. Cuauhtémoc, CDMX
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            2026 TANKO. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground">
              Regulado por CONDUSEF y CNBV
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
