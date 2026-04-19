'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth, UserRole } from './auth-provider'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isConnected, isConnecting, role, address } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isConnecting) return

    if (!isConnected) {
      router.push('/menu')
      return
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      if (role === 'CONDUCTOR') {
        router.push('/dashboard/conductor')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isConnected, isConnecting, role, address, router, allowedRoles])

  if (isConnecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Conectando...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function useRequireAuth(redirectTo?: string) {
  const { isConnected, isConnecting, address } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isConnecting) return
    
    if (!isConnected && redirectTo) {
      router.push(redirectTo)
    }
  }, [isConnected, isConnecting, address, router, redirectTo])

  return { isConnected, isConnecting, address }
}
