"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Menu,
  X,
  LayoutDashboard,
  Truck,
  FileText,
  ClipboardCheck,
  FolderOpen,
  Users,
  LogOut,
  Footprints,
} from "lucide-react";
import { cerrarSesion } from "@/lib/login/loginApi";
import { useLogout } from "@/componentsux/dashboard/useLogout";

interface JwtPayload {
  sub: string; // cédula
  rol: number;
  iat?: number;
  exp?: number;
}
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  roles?: number[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vista general",
  },
  {
    title: "Gestión de Vehículos",
    href: "/dashboard/gestion-vehiculos",
    icon: Truck,
    description: "Crear y editar vehículos",
    roles: [1],
  },
  {
    title: "Gestión de Solicitudes",
    href: "/dashboard/gestion-solicitud",
    icon: FolderOpen,
    description: "Administrar solicitudes",
    roles: [1]
  },
  {
    title: "Mis Solicitudes",
    href: "/dashboard/gestion-solicitud/misSolicitudes",
    icon: FileText,
    description: "Ver mis solicitudes",
    roles: [8]
  },
  {
    title: "Solicitud de Vehículo",
    href: "/dashboard/gestion-solicitud/registrar",
    icon: FileText,
    description: "Nueva solicitud",
    roles: [2],
  },
  {
    title: "Registro Preoperacional",
    href: "/dashboard/gestion-preoperacional",
    icon: ClipboardCheck,
    description: "Inspección de vehículo",
    roles: [1],
  },
  {
    title: "Registro Preoperacional",
    href: "/dashboard/gestion-preoperacional/registrar",
    icon: ClipboardCheck,
    description: "Registro Inspeccion",
    roles: [8],
  },
  // {
  //   title: "Gestión de Usuarios",
  //   href: "/dashboard/usuarios",
  //   icon: Users,
  //   description: "Administrar usuarios",
  // },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [rol, setRol] = useState<number | null>(null);

  useEffect(() => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return;

      const decoded = jwtDecode<JwtPayload>(token);
      console.log("info", decoded);
      setRol(decoded.rol);
    } catch (e) {
      console.error("Error decodificando token", e);
      setRol(null);
    }
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (rol === null) return false;
    return item.roles.includes(rol);
  });

  return (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span>{item.title}</span>
              {item.description && (
                <span
                  className={cn(
                    "text-xs",
                    isActive
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {item.description}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const router = useRouter();
  const { logout, loading } = useLogout();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-muted/40">
        <div className="flex h-16 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Truck className="h-6 w-6" />
            <span>Transporte</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
        <div className="border-t p-4">
          <Button
            onClick={logout}
            disabled={loading}
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-5 w-5" />
            {loading ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </div>
      </aside>
    </>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { logout, loading } = useLogout();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
          <SheetDescription>Selecciona una sección</SheetDescription>
        </SheetHeader>

        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg"
            onClick={() => setOpen(false)}
          >
            <Truck className="h-6 w-6" />
            <span>Transporte</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={async () => {
              await logout();
              setOpen(false);
            } 
          }
          disabled={loading}
          >
              <LogOut className="h-5 w-5" />
              {loading ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <MobileNav />
      <div className="flex-1">
        <h1 className="text-lg font-semibold lg:hidden">Transporte</h1>
      </div>
    </header>
  );
}
