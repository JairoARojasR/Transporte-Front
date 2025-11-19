"use client";

import { useEffect, useState } from "react";
import { obtenerVehiculos, obtenerVehiculoPorRegistroInspeccion, type Vehiculo } from "@/lib/vehiculos/vehiculoApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Truck, MoreVertical, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface JwtPayload {
  sub: string; // cédula
  rol: number;
  iat?: number;
  exp?: number;
}
export default function GestionVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductor, setConductor] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<number | null>(null);


  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const vehiculosData = await obtenerVehiculos();
        console.log("info", vehiculosData);
        setVehiculos(vehiculosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

   useEffect(() => {
    try {
      const token = Cookies.get("access_token");
      if (!token) return;

      const decoded = jwtDecode<JwtPayload>(token);
      console.log("info decode", decoded);
      setRol(decoded.rol);
    } catch (e) {
      console.error("Error decodificando token", e);
      setRol(null);
    }
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const conductorData = await obtenerVehiculoPorRegistroInspeccion();
        console.log("info conductor", conductorData);
        setConductor(conductorData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const obtenerNombreConductor = (cedula: number) => {
    for (const vehiculo of vehiculos) {
      const conductor = vehiculo.conductores?.find(
        (c) => c.cedula_conductor === cedula
      );
      if (conductor) {
        return conductor.usuario?.nombre;
      }
    }
    return "Sin asignar";
  };

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

  const obtenerCapacidadLabel = (capacidad?: number | null) => {
    if (!capacidad) return "N/A";
    return `${capacidad} Pasajeros`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando vehículos...</p>
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
                Gestión de Vehículos
              </h1>
              <p className="text-slate-600">
                Administra la flota de vehículos para el transporte de los
                empleados. xd
              </p>
            </div>
            <Link href="/dashboard/gestion-vehiculos/registrar">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de Vehículos */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="p-6 border-b bg-white">
            <h2 className="text-xl font-semibold text-slate-900">
              Lista de Vehículos
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Administra la flota de vehículos para el transporte de los
              empleados.
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Vehículo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Tipo
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Capacidad
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Conductor
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Estado
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {vehiculos.map((vehiculo) => {
                  const conductorHabitual = vehiculo.conductores?.find(
                    (c) => c.tipo_conductor === "habitual"
                  );
                  const conductorEventual = vehiculo.conductores?.find(
                    (c) => c.tipo_conductor === "eventual"
                  );
                  return (
                    <tr
                      key={vehiculo.placa}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {vehiculo.placa}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {obtenerTipoLabel(vehiculo.tipo_vehiculo)}
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {obtenerCapacidadLabel(vehiculo.capacidad)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1">
                          <span className="text-slate-900">
                            {conductorHabitual
                              ? obtenerNombreConductor(
                                  conductorHabitual.cedula_conductor
                                )
                              : "Sin asignar habitual"}
                          </span>
                          {conductorHabitual && (
                            <Badge
                              variant="outline"
                              className="w-fit text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Habitual
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-1 mt-2">
                          <span className="text-slate-900">
                            {conductorEventual
                              ? obtenerNombreConductor(
                                  conductorEventual.cedula_conductor
                                )
                              : "Sin asignar eventual"}
                          </span>
                          {conductorEventual && (
                            <Badge
                              variant="outline"
                              className="w-fit text-xs bg-orange-50 text-orange-700 border-orange-200"
                            >
                              Eventual
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`${obtenerEstadoColor(vehiculo.estado)}`}
                        >
                          {obtenerEstadoLabel(vehiculo.estado)}
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
                              href={`/dashboard/gestion-vehiculos/ver/${vehiculo.placa}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </Link>
                            <Link
                              href={`/dashboard/gestion-vehiculos/editarv/${vehiculo.placa}`}
                            >
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {vehiculos.map((vehiculo) => {
              const conductorHabitual = vehiculo.conductores?.find(
                (c) => c.tipo_conductor === "habitual"
              );
              const conductorEventual = vehiculo.conductores?.find(
                (c) => c.tipo_conductor === "eventual"
              );
              return (
                <div
                  key={vehiculo.placa}
                  className="p-4 bg-white hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {vehiculo.placa}
                        </p>
                        <p className="text-sm text-slate-600">
                          {obtenerTipoLabel(vehiculo.tipo_vehiculo)}
                        </p>
                      </div>
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
                          href={`/dashboard/gestion-vehiculos/ver/${vehiculo.placa}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                        </Link>
                        <Link
                          href={`/dashboard/gestion-vehiculos/editarv/${vehiculo.placa}`}
                        >
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="cursor-pointer text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Capacidad:</span>
                      <span className="text-slate-900">
                        {obtenerCapacidadLabel(vehiculo.capacidad)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Conductor:</span>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">
                            {conductorHabitual
                              ? obtenerNombreConductor(
                                  conductorHabitual.cedula_conductor
                                )
                              : "Sin asignar habitual"}
                          </span>
                          {conductorHabitual && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Habitual
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">
                            {conductorEventual
                              ? obtenerNombreConductor(
                                  conductorEventual.cedula_conductor
                                )
                              : "Sin asignar habitual"}
                          </span>
                          {conductorEventual && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                            >
                              Eventual
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Estado:</span>
                      <Badge
                        variant="outline"
                        className={`${obtenerEstadoColor(vehiculo.estado)}`}
                      >
                        {obtenerEstadoLabel(vehiculo.estado)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {vehiculos.length === 0 && (
            <div className="p-12 text-center">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">
                No hay vehículos registrados
              </p>
              <p className="text-sm text-slate-500">
                Comienza agregando tu primer vehículo
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
