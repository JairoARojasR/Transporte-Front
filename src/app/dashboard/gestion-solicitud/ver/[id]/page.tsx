"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Users,
  Package,
  FileText,
  Car,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useSWR from "swr";
import {
  obtenerSolicitudPorId,
  type Solicitud,
} from "@/lib/solicitud/solicitudApi";
import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
  ObtenerTipoLaborLabel,
} from "@/componentsux/estadoVehiculo";
import {
  formatearFecha,
  formatearHora,
  formatearDuracion,
} from "@/componentsux/formatearFecha";
import dayjs from "dayjs";
import "dayjs/locale/es";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DetalleSolicitudPage({ params }: PageProps) {
  const router = useRouter();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [id, setId] = useState<string>("")
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
     async function cargarDatos() {
       try {
         setLoading(true)
         const resolvedParams = await params
         const idParam = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id
         setId(idParam)
 
         const solicitudData = await obtenerSolicitudPorId(idParam)
 
         if (solicitudData && solicitudData.length > 0) {
           setSolicitud(solicitudData[0])
         } else {
           setError("Solicitud no encontrada")
         }
       } catch (err) {
         setError(err instanceof Error ? err.message : "Error al cargar datos")
       } finally {
         setLoading(false)
       }
     }
     cargarDatos()
   }, [params])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al cargar</h2>
            <p className="text-muted-foreground mb-4">
              {error || "No se pudo cargar la solicitud"}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Solicitud {solicitud.id_solicitud}
            </h1>
            <p className="text-muted-foreground mt-1">
              Detalles completos de la solicitud
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              className={`${obtenerEstadoSolicitudColor(
                solicitud.estado
              )} text-sm px-3 py-1`}
            >
              {ObtenerEstadoSolicitudLabel(solicitud.estado)}
            </Badge>
            <Badge
              className={`${obtenerPrioridadColor(
                solicitud.prioridad
              )} text-sm px-3 py-1`}
            >
              {ObtenerPrioridadLabel(solicitud.prioridad)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Solicitante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Solicitante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {solicitud.usuario_solicitud_cedula_solicitanteTousuario
                    ?.nombre || "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">
                  {solicitud.telefono ||
                    solicitud.usuario_solicitud_cedula_solicitanteTousuario
                      ?.telefono ||
                    "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Correo</p>
                <p className="font-medium break-all">
                  {solicitud.usuario_solicitud_cedula_solicitanteTousuario
                    ?.correo || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Conductor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Conductor Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {solicitud.usuario_solicitud_cedula_conductorTousuario ? (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">
                      {
                        solicitud.usuario_solicitud_cedula_conductorTousuario
                          .nombre
                      }
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">
                      {
                        solicitud.usuario_solicitud_cedula_conductorTousuario
                          .telefono
                      }
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Correo</p>
                    <p className="font-medium break-all">
                      {
                        solicitud.usuario_solicitud_cedula_conductorTousuario
                          .correo
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay conductor asignado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalles del Viaje */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Detalles del Viaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {formatearFecha(solicitud.fecha)}
                  </p>
                  
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium">{formatearHora(solicitud.hora) || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Origen</p>
                  <p className="font-medium">{solicitud.origen || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 fill-current" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-medium">{solicitud.destino || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Pasajeros</p>
                  <p className="font-medium">
                    {solicitud.cantidad_pasajeros || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tipo de Labor</p>
                  <p className="font-medium">
                    {ObtenerTipoLaborLabel(solicitud.tipo_labor)}
                  </p>
                </div>
              </div>
            </div>

            {solicitud.equipo_o_carga && (
              <>
                <Separator className="my-4" />
                <div className="flex items-start gap-3">
                  <Package className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Equipo o Carga
                    </p>
                    <p className="font-medium">{solicitud.equipo_o_carga}</p>
                  </div>
                </div>
              </>
            )}

            {solicitud.observaciones && (
              <>
                <Separator className="my-4" />
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Observaciones
                    </p>
                    <p className="font-medium">{solicitud.observaciones}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vehículo Asignado */}
        {solicitud.placa_vehiculo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehículo Asignado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Car className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Placa</p>
                  <p className="font-medium text-lg">
                    {solicitud.placa_vehiculo}
                  </p>
                </div>
              </div>
              {solicitud.vehiculo?.tipo_vehiculo && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Tipo de Vehículo
                      </p>
                      <p className="font-medium capitalize">
                        {solicitud.vehiculo.tipo_vehiculo.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tiempos del Transporte */}
        {(solicitud.hora_inicio_transporte ||
          solicitud.hora_fin_transporte) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Registro de Tiempos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {solicitud.hora_inicio_transporte && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Hora de Inicio
                    </p>
                    <p className="font-medium">
                      {formatearHora(solicitud.hora_inicio_transporte)}
                    </p>
                  </div>
                </div>
              )}

              {solicitud.hora_fin_transporte && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Hora de Finalización
                      </p>
                      <p className="font-medium">
                        {formatearHora(solicitud.hora_fin_transporte)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {solicitud.hora_total && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Tiempo Total
                      </p>
                      <p className="font-medium text-lg">
                        {formatearDuracion(solicitud.hora_total)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Incidente */}
        {solicitud.tipo_incidente && (
          <Card className="lg:col-span-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                Incidente Registrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Tipo de Incidente
                    </p>
                    <p className="font-medium capitalize">
                      {solicitud.tipo_incidente.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Gravedad</p>
                    <Badge
                      className={`${obtenerPrioridadColor(solicitud.gravedad)}`}
                    >
                      {solicitud.gravedad
                        ? solicitud.gravedad.charAt(0).toUpperCase() +
                          solicitud.gravedad.slice(1)
                        : "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {solicitud.puede_continuar === true ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      ¿Puede Continuar?
                    </p>
                    <p className="font-medium capitalize">
                      {solicitud.puede_continuar === true
                        ? "Sí"
                        : solicitud.puede_continuar === false
                        ? "No"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {solicitud.descripcion_incidente && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Descripción
                      </p>
                      <p className="font-medium">
                        {solicitud.descripcion_incidente}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
