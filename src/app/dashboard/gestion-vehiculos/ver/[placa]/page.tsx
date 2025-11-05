"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerVehiculoPorPlaca, type Vehiculo } from "@/lib/vehiculos/vehiculoApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Truck, Gauge, Users, Calendar, Pencil, CalendarCheck } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ placa: string }>
}

export default function DetalleVehiculo({ params }: PageProps) {
  const router = useRouter()
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [placa, setPlaca] = useState<string>("")

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)
        const resolvedParams = await params
        const placaParam = Array.isArray(resolvedParams.placa) ? resolvedParams.placa[0] : resolvedParams.placa
        setPlaca(placaParam)

        const vehiculosData = await obtenerVehiculoPorPlaca(placaParam)

        if (vehiculosData && vehiculosData.length > 0) {
          setVehiculo(vehiculosData[0])
        } else {
          setError("Vehículo no encontrado")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [params])

  
  const obtenerNombreConductor = (cedula: number) => {
    for (const v of vehiculo ? [vehiculo] : []) {
      const conductor = v.conductores?.find((c) => c.cedula_conductor === cedula)
      if (conductor) {
        return conductor.usuario?.nombre
      }
    }
    return "Sin asignar"
  }

  const obtenerEstadoLabel = (estado?: string) => {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "no_disponible":
        return "No Disponible"
      case "asignado":
        return "Asignado"
      default:
        return "Desconocido"
    }
  }

  const obtenerEstadoColor = (estado?: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-700 border-green-200"
      case "no_disponible":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "asignado":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const obtenerTipoLabel = (tipo?: string) => {
    switch (tipo) {
      case "camion":
        return "Camión"
      case "camioneta":
        return "Camioneta"
      case "carrotanque":
        return "Carrotanque"
      case "retroexcavadora":
        return "Retroexcavadora"
      default:
        return "N/A"
    }
  }

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "N/A"
    const date = new Date(fecha)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalles del vehículo...</p>
        </div>
      </div>
    )
  }

  if (error || !vehiculo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 text-center mb-4">{error || "Vehículo no encontrado"}</p>
          <Button onClick={() => router.back()} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  const conductorHabitual = vehiculo.conductores.find((c) => c.tipo_conductor === "habitual")
  const conductorEventual = vehiculo.conductores.find((c) => c.tipo_conductor === "eventual")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Detalle del Vehículo</h1>
              <p className="text-slate-600">Información completa del vehículo {vehiculo.placa}</p>
            </div>
            <Link href={`/dashboard/gestion-vehiculos/editarv/${vehiculo.placa}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Pencil className="w-4 h-4 mr-2" />
                Editar Vehículo
              </Button>
            </Link>
          </div>
        </div>

        {/* Vehicle Header Card */}
        <Card className="p-6 mb-6 shadow-lg border-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{vehiculo.placa}</h2>
            </div>
            <Badge variant="outline" className={`${obtenerEstadoColor(vehiculo.estado)} text-sm px-3 py-1`}>
              {obtenerEstadoLabel(vehiculo.estado)}
            </Badge>
          </div>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">Tipo de Vehículo</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">{obtenerTipoLabel(vehiculo.tipo_vehiculo)}</p>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600">Odómetro</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {vehiculo.odometro ? `${vehiculo.odometro.toLocaleString()} km` : "N/A"}
            </p>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">Capacidad</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {vehiculo.capacidad ? `${vehiculo.capacidad} Pasajeros` : "N/A"}
            </p>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-slate-600">Registrado</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {formatearFecha(vehiculo.fecha_ultimo_mantenimiento)}
            </p>
          </Card>
        </div>

        {/* Conductores Asignados */}
        <Card className="shadow-lg border-0 mb-6 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Conductores Asignados al vehículo {vehiculo.placa}</h2>
          </div>
          <div className="p-6 space-y-4">
            {conductorHabitual && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-900">
                    {obtenerNombreConductor(conductorHabitual.cedula_conductor)}
                  </span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Habitual
                </Badge>
              </div>
            )}

            {conductorEventual && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-slate-900">
                    {obtenerNombreConductor(conductorEventual.cedula_conductor)}
                  </span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Eventual
                </Badge>
              </div>
            )}

            {!conductorHabitual && !conductorEventual && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No hay conductores asignados a este vehículo</p>
              </div>
            )}
          </div>
        </Card>

        {/* Información Completa */}
        <Card className="shadow-lg border-0 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Información completa del vehículo {vehiculo.placa}</h2>
            <p className="text-sm text-slate-600 mt-1">Registro de mantenimientos y servicios realizados</p>
          </div>
          <div className="p-6">
            {vehiculo.fecha_ultimo_mantenimiento ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Mantenimiento</p>
                    <p className="text-sm text-slate-600">{formatearFecha(vehiculo.fecha_ultimo_mantenimiento)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Completado
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No hay registros de mantenimiento</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
