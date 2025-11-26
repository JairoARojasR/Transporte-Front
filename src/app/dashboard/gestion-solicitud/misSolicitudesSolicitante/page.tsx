"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  obtenerMisSolicitudesSolicitante,
  type Solicitud,
  type Estado,
} from "@/lib/solicitud/solicitudApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatearFecha, formatearHora, formatearDuracion } from "@/componentsux/formatearFecha";
import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
  ObtenerTipoLaborLabel,
} from "@/componentsux/estadoVehiculo";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Cargar los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

import {
  Briefcase,
  Calendar1,
  Car,
  CheckCircle,
  CirclePlay,
  CircleStop,
  Clock,
  FileText,
  KeySquare,
  MapPin,
  Package,
  Users,
  XCircle,
} from "lucide-react";

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "pendiente", label: "Pendientes" },
  { value: "asignada", label: "Asignadas" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "finalizada", label: "Finalizadas" },
];

export default function MisSolicitudesPageSolicitante() {
  const {
    data: solicitudes = [],
    isLoading,
    error,
    mutate,
  } = useSWR("mis-solicitudes-conductor", obtenerMisSolicitudesSolicitante, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState<Estado>("pendiente");

  const getSolicitudesByEstado = (estado: Estado) => {
    return solicitudes.filter((s) => s.estado === estado);
  };

  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerMisSolicitudesSolicitante();
        console.log("Solicitudes obtenidas:", data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al cargar";

        toast.error(msg);
      } finally {
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando tus solicitudes...</p>
      </div>
    );
  }

  if (error) {
    const message =
      (error as any)?.message === "NO_AUTORIZADO"
        ? "No tienes permiso para ver estas solicitudes."
        : (error as any)?.message || "Error al cargar tus solicitudes.";

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">{message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-4xl bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-2xl text-blue-900 font-bold">Mis solicitudes</h1>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Estado)}>
        <TabsList className="w-full flex flex-wrap justify-center gap-3 h-auto mb-5 rounded-xl px-3 py-2">
          {ESTADOS.map((estado) => {
            const cantidad = getSolicitudesByEstado(estado.value).length;
            return (
              <TabsTrigger key={estado.value} value={estado.value}>
                <span>{estado.label}</span>
                <Badge
                  variant={
                    cantidad > 0
                      ? "badgeCantidadEstado"
                      : "badgeSinCantidadEstado"
                  }
                  className="rounded-full min-w-6 h-6 flex items-center justify-center"
                >
                  {cantidad}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ESTADOS.map((estado) => {
          const solicitudesEstado = getSolicitudesByEstado(estado.value);
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
                          <h3 className="font-semibold text-lg">
                            Solicitud {solicitud.id_solicitud}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Solicitante:{" "}
                            {
                              solicitud
                                .usuario_solicitud_cedula_solicitanteTousuario
                                ?.nombre
                            }{" "}
                            {" - "}{" "}
                            {
                              solicitud
                                .usuario_solicitud_cedula_solicitanteTousuario
                                ?.telefono
                            }
                          </p>
                        </div>
                        <Badge
                          className={`${obtenerPrioridadColor(
                            solicitud.prioridad
                          )}`}
                        >
                          {ObtenerPrioridadLabel(solicitud.prioridad)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar1 className="text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {formatearFecha(solicitud.fecha)} {"-"}{" "}
                              {formatearHora(solicitud.hora)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">Origen:</span>{" "}
                              {solicitud.origen}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Destino:</span>{" "}
                              {solicitud.destino}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Users className="text-muted-foreground" />
                          <p>
                            {solicitud.cantidad_pasajeros} Pasajero
                            {solicitud.cantidad_pasajeros !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <KeySquare className="text-muted-foreground" />
                          <p>
                            <span className="font-medium">Conductor: {""}</span>
                            {solicitud.usuario_solicitud_cedula_conductorTousuario
                              ? `${solicitud.usuario_solicitud_cedula_conductorTousuario.nombre} - ${solicitud.usuario_solicitud_cedula_conductorTousuario.telefono}`
                              : "Sin asignar"}
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Car className="text-muted-foreground" />
                          <p>
                            <span className="font-medium">Vehículo: {""}</span>
                            {solicitud.placa_vehiculo
                              ? `${solicitud.placa_vehiculo} - ${solicitud.vehiculo?.tipo_vehiculo}`
                              : "Sin asignar"}
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">
                              Tipo de Labor:
                            </p>
                            <p className="text-sm">
                              {ObtenerTipoLaborLabel(solicitud.tipo_labor)}
                            </p>
                          </div>
                        </div>

                        {solicitud.equipo_o_carga && (
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                Equipo/Carga:
                              </p>
                              <p className="text-sm">
                                {solicitud.equipo_o_carga}
                              </p>
                            </div>
                          </div>
                        )}

                        {solicitud.observaciones && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                Observaciones:
                              </p>
                              <p className="text-sm">
                                {solicitud.observaciones}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {solicitud.estado === "finalizada" &&
                        solicitud.hora_total !== null &&
                        solicitud.hora_total !== undefined && (
                          <div className="bg-gray-200 p-4 rounded-sm space-y-2">
                            <p className="font-medium">Seguimiento</p>
                            <div className="flex items-start gap-2">
                              <CirclePlay className="w-5 h-5 text-green-600" />
                              <p className="text-sm font-medium">
                                hora Inicio: {""}
                                {formatearHora(solicitud.hora_inicio_transporte)}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CircleStop className="w-5 h-5 text-red-600" />
                              <p className="text-sm font-medium">
                                hora Fin: {""}
                                {formatearHora(solicitud.hora_fin_transporte)}
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              <Clock className="w-5 h-5 text-blue-600" />
                                <p className="text-sm">
                                  <span className="font-medium">Duración Total: </span>
                                {formatearDuracion(solicitud.hora_total)}
                              </p>
                            
                            </div>

                          </div>

                          // <div className="flex items-start gap-3">
                          //   <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          //   <div>
                          //     <p className="text-sm font-medium">
                          //       Duración Total:
                          //     </p>
                          //     <p className="text-sm font-semibold text-primary">
                          //       {formatearDuracion(solicitud.hora_total)}
                          //     </p>
                          //   </div>
                          // </div>
                        )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
