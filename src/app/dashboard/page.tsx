"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Truck, FileText, ClipboardCheck, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/componentsux/dashboard/useAuth";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const [rol, setRol] = useState<number | null>(null);

  useEffect(() => {
    try {
      const rolStr = Cookies.get("user_rol");
      if (rolStr) {
        const parsedRol = Number(rolStr);
        if (!isNaN(parsedRol)) {
          setRol(parsedRol);
        }
      }
    } catch (e) {
      console.error("Error leyendo user_rol", e);
      setRol(null);
    }
  }, []);

  const cards = [
    {
      title: "Gestión de Vehículos",
      description: "Administra tu flota de vehículos",
      icon: Truck,
      href: "/dashboard/gestion-vehiculos",
      color: "text-blue-600",
      roles: [1]
    },
    {
      title: "Gestión de Solicitudes",
      description: "Administra y da seguimiento a las solicitudes de transporte",
      icon: FileText,
      href: "/dashboard/gestion-solicitud",
      color: "text-green-600",
      roles: [1]
    },
    {
      title: "Inspección Preoperacional",
      description: "Gestiona y verifica los registros de inspección",
      icon: ClipboardCheck,
      href: "/dashboard/gestion-preoperacional",
      color: "text-purple-600",
      roles: [1]
    },

    {
      title: "Registro de Inspección Preoperacional",
      description: "Registra la inspección preoperacional del vehículo para garantizar su buen estado.",
      icon: ClipboardCheck,
      href: "/dashboard/gestion-preoperacional/registrar",
      color: "text-purple-600",
      roles: [8]
    },

    {
      title: "Mis Solicitudes - Conductor",
      description: "Consulta y gestiona las solicitudes de transporte asignadas a ti como conductor.",
      icon: FileText,
      href: "/dashboard/gestion-solicitud/misSolicitudes",
      color: "text-green-600",
      roles: [8]
    },

    {
      title: "Registro de Solicitudes de Vehículo",
      description: "Solicita un vehículo para realizar tus actividades.",
      icon: FileText,
      href: "/dashboard/gestion-solicitud/registrar",
      color: "text-green-600",
      roles: [2]
    },

    {
      title: "Mis Solicitudes - Solicitante",
      description: "Consulta el estado de tus solicitudes y revisa el historial de transporte.",
      icon: FileText,
      href: "/dashboard/gestion-solicitud/misSolicitudesSolicitante",
      color: "text-green-600",
      roles: [2]
    },
  ];

  const filteredCards = cards.filter(card => {
    if (rol === null) return false;
    return card.roles.includes(rol);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de administración
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Icon className={`h-8 w-8 mb-2 ${card.color}`} />
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
