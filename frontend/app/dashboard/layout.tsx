"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  Receipt,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { TankoLogoMinimal } from "@/components/logo";
import { Button } from "@/components/ui/button";

const navigationJefe = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/usuarios", icon: Users },
  { name: "Fleet", href: "/dashboard/unidades", icon: Car },
  { name: "Fuel Logs", href: "/dashboard/consumos", icon: Receipt },
  { name: "Locations", href: "/dashboard/ubicaciones", icon: MapPin },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, isConnecting, address, role, disconnect } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push("/menu");
    }
  }, [isConnected, isConnecting, router]);

  useEffect(() => {
    if (pathname === "/dashboard/conductor") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  if (isConnecting || !isConnected) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying connection...
          </p>
        </div>
      </div>
    );
  }

  const navigation = navigationJefe;

  const handleDisconnect = () => {
    disconnect();
    router.push("/menu");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        style={{ backgroundColor: "#1B2D4F" }}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          style={{ borderBottomColor: "rgba(255,255,255,0.08)" }}
          className="flex h-16 items-center justify-between border-b px-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <TankoLogoMinimal size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-widest text-white">
              TANKO
            </span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
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
            );
          })}
        </nav>

        <div
          style={{ borderTopColor: "rgba(255,255,255,0.08)" }}
          className="border-t p-3 space-y-0.5"
        >
          <button
            onClick={handleDisconnect}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Disconnect
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {role === "CONDUCTOR" ? "Driver" : "Fleet Manager"}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {address?.slice(0, 8)}...{address?.slice(-8)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {address?.slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
