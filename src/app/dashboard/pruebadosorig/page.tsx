"use client"

import { useState } from "react"
import useSWR from "swr"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  obtenerMisSolicitudesConductor,
  editarSolicitudPorId,
  type Solicitud,
  type Estado,
} from "@/lib/solicitud/solicitudApi"
import { ObtenerPrioridadLabel, obtenerPrioridadColor, ObtenerTipoLaborLabel } from "@/componentsux/estadoVehiculo"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  Briefcase,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react"

dayjs.extend(utc)
dayjs.extend(timezone)

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "asignada", label: "Asignadas" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "finalizada", label: "Finalizadas" },
  { value: "cancelada", label: "Canceladas" },
  { value: "en_reasignacion", label: "En Reasignación" },
]

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.floor((minutes % 1) * 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0) parts.push(`${mins}min`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(" ")
}

export default function MisSolicitudesPage() {
  const [activeTab, setActiveTab] = useState<Estado>("asignada")

  const {
    data: solicitudes = [],
    isLoading,
    mutate,
  } = useSWR("mis-solicitudes-conductor", obtenerMisSolicitudesConductor, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })

  const getSolicitudesByEstado = (estado: Estado) => {
    return solicitudes.filter((s) => s.estado === estado)
  }

  const handleAceptar = async (solicitud: Solicitud) => {
    try {
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "aceptada",
      })
      mutate()
    } catch (error) {
     
    }
  }

  const handleRechazar = async (solicitud: Solicitud) => {
    try {
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "cancelada",
      })
      mutate()
    } catch (error) {
    }
  }

  const handleIniciarViaje = async (solicitud: Solicitud) => {
    try {
      const horaTransporte = dayjs().tz("America/Bogota").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "en_progreso",
        hora_inicio_transporte: horaTransporte,
      })
      
      mutate()
    } catch (error) {
      
    }
  }

  const handleFinalizarViaje = async (solicitud: Solicitud) => {
    try {
      const horaTransporte = dayjs().tz("America/Bogota").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")

      // Calculate duration in minutes
      let totalHora = 0
      if (solicitud.hora_inicio_transporte) {
        const inicio = dayjs(solicitud.hora_inicio_transporte)
        const fin = dayjs(horaTransporte)
        totalHora = fin.diff(inicio, "minute", true) // Get fractional minutes
      }

      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "finalizada",
        hora_fin_transporte: horaTransporte,
        hora_total: Math.round(totalHora), // Round to nearest minute
      })
      
      mutate()
    } catch (error) {
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando solicitudes...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Mis Solicitudes</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Estado)}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-2 h-auto mb-6">
          {ESTADOS.map((estado) => {
            const count = getSolicitudesByEstado(estado.value).length
            return (
              <TabsTrigger key={estado.value} value={estado.value} className="flex flex-col items-center gap-1 py-2">
                <span className="text-xs sm:text-sm">{estado.label}</span>
                <Badge
                  variant={count > 0 ? "default" : "secondary"}
                  className="rounded-full min-w-6 h-6 flex items-center justify-center"
                >
                  {count}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {ESTADOS.map((estado) => {
          const solicitudesEstado = getSolicitudesByEstado(estado.value)
          return (
            <TabsContent key={estado.value} value={estado.value}>
              {solicitudesEstado.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No hay solicitudes {estado.label.toLowerCase()}
                </Card>
              ) : (
                <div className="space-y-4">
                  {solicitudesEstado.map((solicitud) => (
                    <Card key={solicitud.id_solicitud} className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Solicitud {solicitud.id_solicitud}</h3>
                          <p className="text-sm text-muted-foreground">
                            Solicitante: {solicitud.usuario_solicitud_cedula_solicitanteTousuario?.nombre} -{" "}
                            {solicitud.cedula_solicitante}
                          </p>
                        </div>
                        <Badge className={`${obtenerPrioridadColor(solicitud.prioridad)} border`}>
                          {ObtenerPrioridadLabel(solicitud.prioridad)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          {/* <div>
                            <p className="text-sm font-medium">
                              {new Date(solicitud.fecha).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div> */}
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{solicitud.hora}</p>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">Origen:</span> {solicitud.origen}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Destino:</span> {solicitud.destino}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <p className="text-sm">
                            {solicitud.cantidad_pasajeros} Pasajero
                            {solicitud.cantidad_pasajeros !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Car className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <p className="text-sm">
                            {solicitud.placa_vehiculo} - {solicitud.vehiculo?.tipo_vehiculo}
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Tipo de Labor:</p>
                            <p className="text-sm">{ObtenerTipoLaborLabel(solicitud.tipo_labor)}</p>
                          </div>
                        </div>

                        {solicitud.equipo_o_carga && (
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Equipo/Carga:</p>
                              <p className="text-sm">{solicitud.equipo_o_carga}</p>
                            </div>
                          </div>
                        )}

                        {solicitud.observaciones && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Observaciones:</p>
                              <p className="text-sm">{solicitud.observaciones}</p>
                            </div>
                          </div>
                        )}

                        {solicitud.estado === "finalizada" && solicitud.hora_total !== undefined && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Duración Total:</p>
                              <p className="text-sm font-semibold text-primary">
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {solicitud.estado === "asignada" && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            onClick={() => handleAceptar(solicitud)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceptar Solicitud
                          </Button>
                          <Button onClick={() => handleRechazar(solicitud)} variant="destructive" className="flex-1">
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}

                      {solicitud.estado === "aceptada" && (
                        <div className="mt-6">
                          <Button
                            onClick={() => handleIniciarViaje(solicitud)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Iniciar Viaje
                          </Button>
                        </div>
                      )}

                      {solicitud.estado === "en_progreso" && (
                        <div className="mt-6">
                          <Button
                            onClick={() => handleFinalizarViaje(solicitud)}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Finalizar Viaje
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
