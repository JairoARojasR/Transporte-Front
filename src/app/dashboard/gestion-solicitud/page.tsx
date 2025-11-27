"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  obtenerVehiculosPorInspeccionFecha,
  type Vehiculo,
} from "@/lib/vehiculos/vehiculoApi";
import {
  obtenerSolicitudes,
  editarSolicitudPorId,
  exportarSolicitudesExcel,
  type Solicitud,
} from "@/lib/solicitud/solicitudApi";

import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";

import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
} from "@/componentsux/estadoVehiculo";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreVertical,
  Eye,
  Check,
  X,
  RefreshCcw,
  Calendar,
  History,
  Sheet,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function GestionSolicitudDos() {
  const {
    data: solicitud = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Solicitud[]>("/api/solicitudes", obtenerSolicitudes, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  //const fechaHoy = new Date().toISOString().split("T")[0]
  const fechaHoy = new Date().toLocaleDateString("en-CA");
  const { data: vehiculos = [] } = useSWR<Vehiculo[]>(
    `/api/vehiculos/${fechaHoy}`,
    () => obtenerVehiculosPorInspeccionFecha(fechaHoy),
    {
      refreshInterval: 30000,
    }
  );

  const [asignandoVehiculo, setAsignandoVehiculo] = useState<number | null>(
    null
  );
  const [asignacionPendiente, setAsignacionPendiente] = useState<{
    [key: number]: {
      placa: string;
      nombreConductor: string;
      cedulaConductor: number;
    };
  }>({});

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroVehiculo, setFiltroVehiculo] = useState<string>("todos");
  const [filtroConductor, setFiltroConductor] = useState<string>("todos");

  const [paginaActualHoy, setPaginaActualHoy] = useState(1);
  const [paginaActualAntiguas, setPaginaActualAntiguas] = useState(1);
  const itemsPorPagina = 3;

  //const fechaHoy = new Date().toISOString().split("T")[0];

  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  const fechaManana = mañana.toISOString().split("T")[0];

  const aplicarFiltros = (solicitudes: Solicitud[]) => {
    return solicitudes.filter((sol) => {
      if (filtroEstado !== "todos" && sol.estado !== filtroEstado) {
        return false;
      }

      if (filtroVehiculo !== "todos" && sol.placa_vehiculo !== filtroVehiculo) {
        return false;
      }

      if (
        filtroConductor !== "todos" &&
        sol.cedula_conductor?.toString() !== filtroConductor
      ) {
        return false;
      }

      return true;
    });
  };

  const vehiculosUnicos = Array.from(
    new Set(
      solicitud.filter((s) => s.placa_vehiculo).map((s) => s.placa_vehiculo)
    )
  );

  const conductoresUnicos = Array.from(
    new Set(
      solicitud
        .filter((s) => s.usuario_solicitud_cedula_conductorTousuario)
        .map((s) => ({
          cedula: s.cedula_conductor!,
          nombre: s.usuario_solicitud_cedula_conductorTousuario?.nombre!,
        }))
    )
  ).filter(
    (c, index, self) => index === self.findIndex((t) => t.cedula === c.cedula)
  );

  const solicitudesHoy = aplicarFiltros(
    solicitud.filter((sol) => {
      const fechaSolicitud = sol.fecha
        ? new Date(sol.fecha).toISOString().split("T")[0]
        : "";
      return fechaSolicitud === fechaHoy || fechaSolicitud === fechaManana;
    })
  );

  const solicitudesAntiguas = aplicarFiltros(
    solicitud.filter((sol) => {
      const fechaSolicitud = sol.fecha
        ? new Date(sol.fecha).toISOString().split("T")[0]
        : "";
      return fechaSolicitud < fechaHoy;
    })
  );

  const totalPaginasHoy = Math.ceil(solicitudesHoy.length / itemsPorPagina);
  const indiceInicioHoy = (paginaActualHoy - 1) * itemsPorPagina;
  const indiceFinalHoy = indiceInicioHoy + itemsPorPagina;
  const solicitudesHoyPaginadas = solicitudesHoy.slice(
    indiceInicioHoy,
    indiceFinalHoy
  );

  const totalPaginasAntiguas = Math.ceil(
    solicitudesAntiguas.length / itemsPorPagina
  );
  const indiceInicioAntiguas = (paginaActualAntiguas - 1) * itemsPorPagina;
  const indiceFinalAntiguas = indiceInicioAntiguas + itemsPorPagina;
  const solicitudesAntiguasPaginadas = solicitudesAntiguas.slice(
    indiceInicioAntiguas,
    indiceFinalAntiguas
  );

  useEffect(() => {
    setPaginaActualHoy(1);
    setPaginaActualAntiguas(1);
  }, [filtroEstado, filtroVehiculo, filtroConductor]);

  useEffect(() => {
    if (!solicitud.length) return;

    const nuevaAsignacionPendiente = { ...asignacionPendiente };
    let huboCambios = false;

    Object.keys(asignacionPendiente).forEach((idStr) => {
      const id = Number.parseInt(idStr);
      const solicitudActual = solicitud.find((s) => s.id_solicitud === id);

      if (!solicitudActual || solicitudActual.estado !== "asignada") {
        delete nuevaAsignacionPendiente[id];
        huboCambios = true;
      } else if (
        solicitudActual.cedula_conductor &&
        solicitudActual.cedula_conductor !==
          asignacionPendiente[id]?.cedulaConductor
      ) {
        delete nuevaAsignacionPendiente[id];
        huboCambios = true;
      }
    });

    if (huboCambios) {
      setAsignacionPendiente(nuevaAsignacionPendiente);
    }
  }, [solicitud]);

  const handleRefresh = async () => {
    toast.info("Actualizando... Cargando nuevas solicitudes");
    await mutate();
  };

  const handleExportarExcel = async () => {
    try {
      await exportarSolicitudesExcel(fechaInicio, fechaFin);
      toast.success("Exportación a Excel completada");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al exportar solicitudes a Excel"
      );
    }
  };

  const handleSeleccionarVehiculo = async (
    idSolicitud: number,
    placaVehiculo: string,
    nombreConductor: string,
    cedulaConductor: number
  ) => {
    try {
      setAsignandoVehiculo(idSolicitud);
      await editarSolicitudPorId(idSolicitud.toString(), {
        placa_vehiculo: placaVehiculo,
        cedula_conductor: cedulaConductor,
        estado: "asignada",
      });

      await mutate();

      setAsignacionPendiente({
        ...asignacionPendiente,
        [idSolicitud]: {
          placa: placaVehiculo,
          nombreConductor,
          cedulaConductor,
        },
      });
      toast.success(
        `Vehículo ${placaVehiculo} asignado. Esperando confirmación.`
      );
    } catch (error) {
      toast.warning(
        error instanceof Error ? error.message : "Error al asignar el vehículo"
      );
    } finally {
      setAsignandoVehiculo(null);
    }
  };

  const handleConfirmarAsignacion = async (idSolicitud: number) => {
    const asignacion = asignacionPendiente[idSolicitud];
    if (!asignacion) return;

    try {
      setAsignandoVehiculo(idSolicitud);

      await editarSolicitudPorId(idSolicitud.toString(), {
        estado: "aceptada",
      });

      await mutate();

      const nuevaAsignacionPendiente = { ...asignacionPendiente };
      delete nuevaAsignacionPendiente[idSolicitud];
      setAsignacionPendiente(nuevaAsignacionPendiente);
      toast.success(
        `La asignación del vehículo ${asignacion.placa} ha sido confirmada`
      );
    } catch (error) {
      toast.warning(
        error instanceof Error
          ? error.message
          : "Error al confirmar la asignación"
      );
    } finally {
      setAsignandoVehiculo(null);
    }
  };

  const handleCancelarAsignacion = async (idSolicitud: number) => {
    try {
      setAsignandoVehiculo(idSolicitud);

      await editarSolicitudPorId(idSolicitud.toString(), {
        placa_vehiculo: null,
        cedula_conductor: null,
        hora_inicio_transporte: null,
        estado: "pendiente",
      });

      await mutate();

      const nuevaAsignacionPendiente = { ...asignacionPendiente };
      delete nuevaAsignacionPendiente[idSolicitud];
      setAsignacionPendiente(nuevaAsignacionPendiente);

      toast.info(
        "Asignación cancelada. La solicitud ha vuelto a estado pendiente"
      );
    } catch (error) {
      toast.warning(
        error instanceof Error
          ? error.message
          : "Error al cancelar la asignación"
      );
    } finally {
      setAsignandoVehiculo(null);
    }
  };

  const Filtros = () => (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filtros:</span>
      </div>

      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent className="">
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="asignada">Asignada</SelectItem>
          <SelectItem value="aceptada">Aceptada</SelectItem>
          <SelectItem value="en_progreso">En Progreso</SelectItem>
          <SelectItem value="finalizada">Finalizada</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filtroVehiculo} onValueChange={setFiltroVehiculo}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Vehículo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los vehículos</SelectItem>
          {vehiculosUnicos.map((placa) => (
            <SelectItem key={placa} value={placa!}>
              {placa}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filtroConductor} onValueChange={setFiltroConductor}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Conductor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los conductores</SelectItem>
          {conductoresUnicos.map((conductor) => (
            <SelectItem
              key={conductor.cedula}
              value={conductor.cedula.toString()}
            >
              {conductor.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filtroEstado !== "todos" ||
        filtroVehiculo !== "todos" ||
        filtroConductor !== "todos") && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFiltroEstado("todos");
            setFiltroVehiculo("todos");
            setFiltroConductor("todos");
          }}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );


  const renderSolicitudRow = (sol: Solicitud) => {
    const vehiculoAsignado = vehiculos.find(
      (v) => v.placa === sol.placa_vehiculo
    );
    const asignacionActual = asignacionPendiente[sol.id_solicitud!];

    return (
      <tr
        key={sol.id_solicitud}
        className="hover:bg-slate-50 transition-colors border-b"
      >
        <td className="py-4 px-6">
          <div>
            <div className="font-medium">
              {sol.usuario_solicitud_cedula_solicitanteTousuario?.nombre}
            </div>
            <div className="text-sm text-muted-foreground">
              {sol.usuario_solicitud_cedula_solicitanteTousuario?.telefono}
            </div>
          </div>
        </td>

        <td className="py-4 px-6">
          <div>
            <div className="font-medium">{formatearFecha(sol.fecha)}</div>
            <div className="text-sm text-muted-foreground">
              {formatearHora(sol.hora)}
            </div>
          </div>
        </td>

        <td className="py-4 px-6">
          <div>
            <div className="font-medium">{sol.origen}</div>
            <div className="text-sm text-muted-foreground">→ {sol.destino}</div>
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
            className={`${obtenerEstadoSolicitudColor(sol.estado!)}`}
          >
            {ObtenerEstadoSolicitudLabel(sol.estado!)}
          </Badge>
        </td>

        <td className="py-4 px-6">
          {!asignacionActual &&
          sol.estado !== "asignada" &&
          sol.estado !== "aceptada" &&
          sol.estado !== "en_progreso" &&
          sol.estado !== "finalizada" ? (
            <Select
              value={
                sol.placa_vehiculo && vehiculoAsignado
                  ? sol.placa_vehiculo
                  : undefined
              }
              onValueChange={(value) => {
                const vehiculoSeleccionado = vehiculos.find(
                  (v) => v.placa === value
                );
                if (
                  vehiculoSeleccionado &&
                  vehiculoSeleccionado.conductor_sugerido &&
                  sol.id_solicitud
                ) {
                  handleSeleccionarVehiculo(
                    sol.id_solicitud,
                    vehiculoSeleccionado.placa,
                    vehiculoSeleccionado.conductor_sugerido.nombre,
                    vehiculoSeleccionado.conductor_sugerido.cedula
                  );
                }
              }}
              disabled={
                asignandoVehiculo === sol.id_solicitud || vehiculos.length === 0
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={
                    vehiculos.length === 0
                      ? "Sin vehículos"
                      : "Asignar vehículo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.placa} value={vehiculo.placa}>
                    {vehiculo.placa} -{" "}
                    {vehiculo.conductor_sugerido?.nombre || "Sin conductor"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm">
              <div className="font-medium">
                {asignacionActual?.placa || sol.placa_vehiculo || "Sin asignar"}
              </div>
            </div>
          )}
        </td>

        <td className="py-4 px-6">
          {asignacionActual ? (
            <div>
              <div className="font-medium mb-2">
                {asignacionActual.nombreConductor}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                  onClick={() => handleConfirmarAsignacion(sol.id_solicitud!)}
                  disabled={asignandoVehiculo === sol.id_solicitud}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => handleCancelarAsignacion(sol.id_solicitud!)}
                  disabled={asignandoVehiculo === sol.id_solicitud}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {sol.usuario_solicitud_cedula_conductorTousuario?.nombre || (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </div>
          )}
        </td>

        <td className="py-4 px-6">
          <div>
            {sol.hora_inicio_transporte || sol.hora_fin_transporte ? (
              <>
                {formatearHora(sol.hora_inicio_transporte)} -{" "}
                {formatearHora(sol.hora_fin_transporte)}
              </>
            ) : (
              <span className="text-muted-foreground">Sin registrar</span>
            )}
          </div>
        </td>

        <td className="py-4 px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link
                href={`/dashboard/gestion-solicitud/ver/${sol.id_solicitud}`}
              >
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    );
  };

  const renderSolicitudCard = (sol: Solicitud) => {
    const vehiculoAsignado = vehiculos.find(
      (v) => v.placa === sol.placa_vehiculo
    );
    const asignacionActual = asignacionPendiente[sol.id_solicitud!];

    return (
      <Card key={sol.id_solicitud} className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">
              {sol.usuario_solicitud_cedula_solicitanteTousuario?.nombre}
            </p>
            <p className="text-sm text-muted-foreground">
              {sol.usuario_solicitud_cedula_solicitanteTousuario?.telefono}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                href={`/dashboard/gestion-solicitud/ver/${sol.id_solicitud}`}
              >
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Fecha</p>
            <p className="font-medium">{formatearFecha(sol.fecha)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hora</p>
            <p className="font-medium">{formatearHora(sol.hora)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Ruta</p>
          <p className="font-medium">{sol.origen}</p>
          <p className="text-sm text-muted-foreground">→ {sol.destino}</p>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={obtenerPrioridadColor(sol.prioridad)}
          >
            {ObtenerPrioridadLabel(sol.prioridad)}
          </Badge>
          <Badge
            variant="outline"
            className={obtenerEstadoSolicitudColor(sol.estado!)}
          >
            {ObtenerEstadoSolicitudLabel(sol.estado!)}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Vehículo</p>
          {!asignacionActual &&
          sol.estado !== "asignada" &&
          sol.estado !== "aceptada" &&
          sol.estado !== "en_progreso" &&
          sol.estado !== "finalizada" ? (
            <Select
              value={
                sol.placa_vehiculo && vehiculoAsignado
                  ? sol.placa_vehiculo
                  : undefined
              }
              onValueChange={(value) => {
                const vehiculoSeleccionado = vehiculos.find(
                  (v) => v.placa === value
                );
                if (
                  vehiculoSeleccionado &&
                  vehiculoSeleccionado.conductor_sugerido &&
                  sol.id_solicitud
                ) {
                  handleSeleccionarVehiculo(
                    sol.id_solicitud,
                    vehiculoSeleccionado.placa,
                    vehiculoSeleccionado.conductor_sugerido.nombre,
                    vehiculoSeleccionado.conductor_sugerido.cedula
                  );
                }
              }}
              disabled={
                asignandoVehiculo === sol.id_solicitud || vehiculos.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    vehiculos.length === 0
                      ? "Sin vehículos"
                      : "Asignar vehículo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.placa} value={vehiculo.placa}>
                    {vehiculo.placa} -{" "}
                    {vehiculo.conductor_sugerido?.nombre || "Sin conductor"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm">
              {asignacionActual?.placa || sol.placa_vehiculo || "Sin asignar"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Conductor</p>
          {asignacionActual ? (
            <div>
              <p className="text-sm mb-2">{asignacionActual.nombreConductor}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                  onClick={() => handleConfirmarAsignacion(sol.id_solicitud!)}
                  disabled={asignandoVehiculo === sol.id_solicitud}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => handleCancelarAsignacion(sol.id_solicitud!)}
                  disabled={asignandoVehiculo === sol.id_solicitud}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">
              {sol.usuario_solicitud_cedula_conductorTousuario?.nombre || (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </p>
          )}
        </div>

        {(sol.hora_inicio_transporte || sol.hora_fin_transporte) && (
          <div>
            <p className="text-sm text-muted-foreground">Horario transporte</p>
            <p className="text-sm">
              {formatearHora(sol.hora_inicio_transporte)} -{" "}
              {formatearHora(sol.hora_fin_transporte)}
            </p>
          </div>
        )}
      </Card>
    );
  };

  const PaginationControls = ({
    paginaActual,
    totalPaginas,
    setPagina,
  }: {
    paginaActual: number;
    totalPaginas: number;
    setPagina: (pagina: number) => void;
  }) => {
    if (totalPaginas <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
        <div className="text-sm text-slate-600">
          Página {paginaActual} de {totalPaginas}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
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
          <p className="text-red-600 text-center">
            {error?.message || "Error al cargar datos"}
          </p>
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
                Gestión de Solicitudes
              </h1>
              <p className="text-slate-600">
                Solicitudes organizadas por fecha
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="register"
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refrescar
            </Button>
          </div>
        </div>

        <Card className="p-5 mb-5">
          <CardTitle>Generar Reporte de Transporte</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Seleccione el rango de fechas para exportar a Excel
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex flex-col sm:w-1/2 ">
              <h1 className="text-lg font-semibold">Fecha Inicio</h1>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="p-2 border border-gray-300 rounded mt-2"
              />
            </div>

            <div className="flex flex-col sm:w-1/2">
              <h1 className="text-lg font-semibold">Fecha Fin</h1>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="p-2 border border-gray-300 rounded mt-2"
              />
            </div>
          </div>

          <div className="w-200">
            <Button
              onClick={handleExportarExcel}
              variant="customButtondescargarexcel"
              className=""
            >
              <Sheet className="h-4 w-4" />
              Exportar a Excel
            </Button>
          </div>
        </Card>

        <div className="">
          <Card className="p-4 mb-5">
            <Filtros />
          </Card>
        </div>

        <Tabs defaultValue="hoy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hoy" className="gap-2">
              <Calendar className="h-4 w-4" />
              Hoy ({solicitudesHoy.length})
            </TabsTrigger>
            <TabsTrigger value="antiguas" className="gap-2">
              <History className="h-4 w-4" />
              Anteriores ({solicitudesAntiguas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hoy">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b bg-white">
                <h2 className="text-xl font-semibold text-slate-900">
                  Solicitudes de Hoy
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Actualización automática cada 10 segundos •{" "}
                  {solicitudesHoy.length} solicitudes
                </p>
              </div>

              {solicitudesHoy.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay solicitudes para hoy</p>
                </div>
              ) : (
                <>
                  {/* Vista Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                      <tbody className="bg-white">
                        {solicitudesHoyPaginadas.map(renderSolicitudRow)}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Mobile */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                    {solicitudesHoyPaginadas.map(renderSolicitudCard)}
                  </div>

                  <PaginationControls
                    paginaActual={paginaActualHoy}
                    totalPaginas={totalPaginasHoy}
                    setPagina={setPaginaActualHoy}
                  />
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="antiguas">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b bg-white">
                <h2 className="text-xl font-semibold text-slate-900">
                  Solicitudes Anteriores
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Historial de solicitudes • {solicitudesAntiguas.length}{" "}
                  solicitudes
                </p>
              </div>

              {solicitudesAntiguas.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    No hay solicitudes anteriores
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
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
                      <tbody className="bg-white">
                        {solicitudesAntiguasPaginadas.map(renderSolicitudRow)}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista Mobile */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                    {solicitudesAntiguasPaginadas.map(renderSolicitudCard)}
                  </div>

                  <PaginationControls
                    paginaActual={paginaActualAntiguas}
                    totalPaginas={totalPaginasAntiguas}
                    setPagina={setPaginaActualAntiguas}
                  />
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
