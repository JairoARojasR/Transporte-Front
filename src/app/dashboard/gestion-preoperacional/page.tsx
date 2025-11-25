"use client";

import { useEffect, useState } from "react";
import {
  obtenerRegistros,
  type Preoperacional,
} from "@/lib/preoperacional/preoperacional";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Truck, MoreVertical, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import dayjs from "dayjs";
import { es } from "date-fns/locale";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";

export default function GestionPreoperacional() {
  const [preoperacional, setPreoperacional] = useState<Preoperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const preoperacionalData = await obtenerRegistros();
        console.log("info", preoperacionalData);
        setPreoperacional(preoperacionalData);
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

  const obtenerEstadoLabel = (estado?: string) => {
    switch (estado) {
      case "disponible":
        return "Disponible";
      case "no_disponible":
        return "No Disponible";
      case "asignado":
        return "Asignado";
      default:
        return "Desconocido";
    }
  };

  const obtenerEstadoColor = (estado?: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-700 border-green-200";
      case "no_disponible":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "asignado":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const obtenerTipoLabel = (tipo?: string) => {
    switch (tipo) {
      case "camion":
        return "Camión";
      case "camioneta":
        return "Camioneta";
      case "carrotanque":
        return "Carrotanque";
      case "retroexcavadora":
        return "Retroexcavadora";
      default:
        return "N/A";
    }
  };

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Inspección Preoperacional 
              </h1>
              <p className="text-slate-600">
                Administra la flota de vehículos para el transporte de los
                empleados.
              </p>
            </div>
          </div>
        </div>

        {/* Lista Preoperacional */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="p-6 border-b bg-white">
            <h2 className="text-xl font-semibold text-slate-900">
              Lista de Registros
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Administra la flota de vehículos para el transporte de los
              empleados.
            </p>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Vehículo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Conductor
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Fecha
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Alertas
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {preoperacional.map((preo) => {
                  return (
                    <tr
                      key={preo.id_inspeccion}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <span>
                            {preo.placa_vehiculo} {"-"}{" "}
                            {obtenerTipoLabel(preo.vehiculo?.tipo_vehiculo)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-700">
                        <span>{preo.usuario?.nombre}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {format(
                          dayjs.utc(preo.fecha).endOf("day").toDate(),
                          "PPP",
                          { locale: es }
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={"outline"}
                          className={`${obtenerEstadoColor(
                            preo.vehiculo?.estado
                          )}`}
                        >
                          {obtenerEstadoLabel(preo.vehiculo?.estado)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={"estadoVehiculo"}>
                          {preo.observaciones
                            ? preo.observaciones
                            : "Sin alertas"}
                        </Badge>
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
                              href={`/dashboard/gestion-preoperacional/ver/${preo.id_inspeccion}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </Link>
                            <Link
                              href={`/dashboard/gestion-vehiculos/editarv/${preo.id_inspeccion}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
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

          <div className="md:hidden space-y-4 p-4">
            {preoperacional.map((preo) => {
              return (
                <Card key={preo.id_inspeccion} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span>
                        {preo.placa_vehiculo} {"-"}{" "}
                        {obtenerTipoLabel(preo.vehiculo?.tipo_vehiculo)}
                      </span>
                    </div>

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
                          href={`/dashboard/gestion-preoperacional/ver/${preo.id_inspeccion}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                        </Link>
                        <Link
                          href={`/dashboard/gestion-vehiculos/editarv/${preo.id_inspeccion}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <Badge
                      variant={"outline"}
                      className={`${obtenerEstadoColor(preo.vehiculo?.estado)}`}
                    >
                      {obtenerEstadoLabel(preo.vehiculo?.estado)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Conductor</p>
                    <p className="font-medium">{preo.usuario?.nombre}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Fecha</p>
                    <p className="font-medium">{formatearFecha(preo.fecha)}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs mb-1">
                      Prioridad
                    </p>
                    <Badge variant={"estadoVehiculo"}>
                          {preo.observaciones
                            ? preo.observaciones
                            : "Sin alertas"}
                        </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
