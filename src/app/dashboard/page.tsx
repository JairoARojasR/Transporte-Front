import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, FileText, ClipboardCheck, Users } from 'lucide-react'
import Link from "next/link"

export default function DashboardPage() {
  const cards = [
    {
      title: "Gestión de Vehículos",
      description: "Administra tu flota de vehículos",
      icon: Truck,
      href: "/dashboard/gestion-vehiculos",
      color: "text-blue-600",
    },
    {
      title: "Solicitudes",
      description: "Gestiona y revisa solicitudes",
      icon: FileText,
      href: "/dashboard/gestion-solicitud",
      color: "text-green-600",
    },
    {
      title: "Preoperacional",
      description: "Registros de inspección",
      icon: ClipboardCheck,
      href: "/dashboard/registro-preoperacional",
      color: "text-purple-600",
    },
   
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de administración
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
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
          )
        })}
      </div>
    </div>
  )
}
