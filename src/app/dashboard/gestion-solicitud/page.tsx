"use client";

import { useEffect, useState } from "react";
import {
  obtenerRegistros,
  type Preoperacional,
} from "@/lib/preoperacional/preoperacional";
import {
  obtenerSolicitudes,
  type Solicitud,
} from "@/lib/solicitud/solicitudApi";

import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";

import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  obtenerEstadoLabel,
  obtenerEstadoColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
} from "@/componentsux/estadoVehiculo";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  MoreVertical,
  Plus,
  Eye,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import dayjs from "dayjs";
import { es } from "date-fns/locale";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export default function GestionSolicitud() {
  const [solicitud, setSolicitud] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const solicitudData = await obtenerSolicitudes();
        console.log("info", solicitudData);
        setSolicitud(solicitudData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error al cargar datos"
        );
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Solicitudes de Transporte
              </h1>
              <p className="text-slate-600">
                Gestiona las solicitudes de transporte de empleados.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="p-6 border-b bg-white">
            <h2 className="text-xl font-semibold text-slate-900">
              Lista de Registros
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Gestiona las solicitudes de transporte de empleados.
            </p>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Solicitante
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Fecha/Hora
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Ruta
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Prioridad
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Vehículo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Conductor
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Horas actividad
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {solicitud.map((sol) => {
                  return (
                    <tr
                      key={sol.id_solicitud}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">
                            {
                              sol.usuario_solicitud_cedula_solicitanteTousuario
                                ?.nombre
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {
                              sol.usuario_solicitud_cedula_solicitanteTousuario
                                ?.telefono
                            }
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">
                            {formatearFecha(sol.fecha)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatearHora(sol.hora)}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{sol.origen}</div>
                          <div className="text-sm text-muted-foreground">
                            → {""}
                            {sol.destino}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`${obtenerPrioridadColor(sol.prioridad)}`}
                        >
                          {ObtenerPrioridadLabel(sol.prioridad)}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`${obtenerEstadoSolicitudColor(
                            sol.estado
                          )}`}
                        >
                          {ObtenerEstadoSolicitudLabel(sol.estado)}
                        </Badge>
                      </td>
                      {/* select de vehiculo */}
                      <td className="py-4 px-6">
                        <div>
                          
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          {
                            sol.usuario_solicitud_cedula_conductorTousuario
                              ?.nombre
                          }
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          {formatearHora(sol.hora_inicio_transporte)}{" "}
                          {formatearHora(sol.hora_fin_transporte)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <Link
                              href={`/dashboard/gestion-preoperacional/ver/${sol.id_solicitud}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
