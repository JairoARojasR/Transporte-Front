"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  obtenerMisSolicitudesConductor,
  editarSolicitudPorId,
  type Solicitud,
  type Estado,
} from "@/lib/solicitud/solicitudApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";
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
  CircleStop,
  Clock,
  FileText,
  MapPin,
  Package,
  Users,
  XCircle,
} from "lucide-react";

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "asignada", label: "Asignadas" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "finalizada", label: "Finalizadas" },
  { value: "en_reasignacion", label: "En Reasignación" },
];

export default function MisSolicitudesPage() {
  const {
    data: solicitudes = [],
    isLoading,
    error,
    mutate,
  } = useSWR("mis-solicitudes-conductor", obtenerMisSolicitudesConductor, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState<Estado>("asignada");
  const horaTransporte = dayjs()
    .tz("America/Bogota")
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

  // useEffect(() => {
  //   async function cargarDatos() {
  //     try {
  //       setLoading(true);
  //       const solicitudData = await obtenerMisSolicitudesConductor();
  //       console.log("info solicitud", solicitudData);
  //       setSolicitudes(solicitudData);
  //     } catch (error) {
  //       setError(
  //         error instanceof Error ? error.message : "Error al cargar datos"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   cargarDatos();
  // }, []);

  const getSolicitudesByEstado = (estado: Estado) => {
    return solicitudes.filter((s) => s.estado === estado);
  };

  const isoAHoraEnSegundos = (iso: string): number => {
    const [, timePartRaw] = iso.split("T");
    const timePart = timePartRaw.slice(0, 8);

    const [h, m, s] = timePart.split(":").map(Number);

    return h * 3600 + m * 60 + s;
  };

  const formatearDuracion = (segundos: number): string => {
    if (!segundos && segundos !== 0) return "N/A";

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    const partes = [];

    if (horas > 0) partes.push(`${horas} hora${horas > 1 ? "s" : ""}`);
    if (minutos > 0) partes.push(`${minutos} minuto${minutos > 1 ? "s" : ""}`);
    if (segs > 0) partes.push(`${segs} segundo${segs > 1 ? "s" : ""}`);

    return partes.join(" ");
  };

  const handleAceptar = async (solicitud: Solicitud) => {
    try {
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "aceptada",
      });
      mutate();
      toast.success("Has aceptado la solicitud correctamente.");
    } catch (error) {
      toast.warning("No se pudo aceptar la solicitud.");
    }
  };

  const handleRechazar = async (solicitud: Solicitud) => {
    try {
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "pendiente",
        placa_vehiculo: null,
        cedula_conductor: null,
      });
      mutate();
      toast.info("Has rechazado la solicitud.");
    } catch (error) {
      toast.warning("No se pudo rechazar la solicitud.");
    }
  };

  const handleIniciar = async (solicitud: Solicitud) => {
    try {
      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "en_progreso",
        hora_inicio_transporte: horaTransporte,
      });
      mutate();
      console.log("Hora de inicio transporte:", horaTransporte);

      toast.success("Has iniciado la solicitud correctamente.");
    } catch (error) {
      toast.warning("No se pudo iniciar la solicitud.");
    }
  };

  const handleFinalizar = async (solicitud: Solicitud) => {
    try {
      if (!solicitud.hora_inicio_transporte) {
        toast.warning("Esta solicitud no tiene hora de inicio registrada");
        return;
      }
      // 1. Hora FIN actual en Bogotá, mismo formato que usas para guardar
      const horaFinIso = horaTransporte;
      // 2. Hora INICIO desde lo que ya guardaste
      const horaInicioIso = solicitud.hora_inicio_transporte;

      // 3. Convertir ambas a segundos del día (modo manual)
      const segundosInicio = isoAHoraEnSegundos(horaInicioIso);
      const segundosFin = isoAHoraEnSegundos(horaFinIso);

      let diferenciaSegundos = segundosFin - segundosInicio;

      // Por si acaso, si da negativo (cruzó medianoche) lo ajustas:
      if (diferenciaSegundos < 0) {
        diferenciaSegundos += 24 * 3600;
      }

      console.log("Inicio:", horaInicioIso);
      console.log("Fin:", horaFinIso);
      console.log("Diferencia (segundos):", diferenciaSegundos);

      await editarSolicitudPorId(solicitud.id_solicitud!.toString(), {
        estado: "finalizada",
        hora_fin_transporte: horaFinIso,
        // Ajusta el nombre del campo a como lo tienes en Prisma:
        hora_total: diferenciaSegundos, // o tiempo_total_segundos, etc.
      });
      mutate();

      toast.success("Has finalizado la solicitud correctamente.");
    } catch (error) {
      toast.warning("No se pudo finalizar la solicitud.");
    }
  };

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
        <TabsList className="w-full flex flex-wrap items-center justify-center gap-3 h-auto mb-5 rounded-xl px-3 py-2">
          {ESTADOS.map((estado) => {
            const cantidad = getSolicitudesByEstado(estado.value).length;
            return (
              <TabsTrigger key={estado.value} value={estado.value}>
                <span className="text-xs sm:text-sm">{estado.label}</span>
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
                          <Car className="text-muted-foreground" />
                          <p className="">
                            {solicitud.placa_vehiculo} -{" "}
                            {solicitud.vehiculo?.tipo_vehiculo}
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

                      {solicitud.estado === "asignada" && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            onClick={() => handleAceptar(solicitud)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceptar Solicitud
                          </Button>
                          <Button
                            onClick={() => handleRechazar(solicitud)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}

                      {solicitud.estado === "aceptada" && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            onClick={() => handleIniciar(solicitud)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Iniciar Viaje
                          </Button>
                        </div>
                      )}

                      {solicitud.estado === "en_progreso" && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            onClick={() => handleFinalizar(solicitud)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CircleStop className="w-4 h-4 mr-2" />
                            Finalizar Viaje
                          </Button>
                        </div>
                      )}
                      {solicitud.estado === "finalizada" &&
                        solicitud.hora_total !== null &&
                        solicitud.hora_total !== undefined && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">
                                Duración Total:
                              </p>
                              <p className="text-sm font-semibold text-primary">
                                {formatearDuracion(solicitud.hora_total)}
                              </p>
                            </div>
                          </div>
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
