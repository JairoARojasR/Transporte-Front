"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { obtenerVehiculosPorInspeccionFecha, type Vehiculo } from "@/lib/vehiculos/vehiculoApi"
import { obtenerSolicitudes, editarSolicitudPorId, type Solicitud } from "@/lib/solicitud/solicitudApi"
import "@/app/styles/overflow.css"

import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha"

import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
} from "@/componentsux/estadoVehiculo"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Eye, Check, X, RefreshCcw } from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function GestionSolicitud() {
  const {
    data: solicitud = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Solicitud[]>("/api/solicitudes", obtenerSolicitudes, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  })

  const fechaHoy = new Date().toISOString().split("T")[0]
  const { data: vehiculos = [] } = useSWR<Vehiculo[]>(
    `/api/vehiculos/${fechaHoy}`,
    () => obtenerVehiculosPorInspeccionFecha(fechaHoy),
    {
      refreshInterval: 30000,
    },
  )

  const [asignandoVehiculo, setAsignandoVehiculo] = useState<number | null>(null)
  const [asignacionPendiente, setAsignacionPendiente] = useState<{
    [key: number]: { placa: string; nombreConductor: string; cedulaConductor: number }
  }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  const totalPages = Math.ceil(solicitud.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const solicitudesPaginadas = solicitud.slice(startIndex, endIndex)

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [solicitud.length, totalPages, currentPage])

  useEffect(() => {
    if (!solicitud.length) return

    const nuevaAsignacionPendiente = { ...asignacionPendiente }
    let huboCambios = false

    Object.keys(asignacionPendiente).forEach((idStr) => {
      const id = Number.parseInt(idStr)
      const solicitudActual = solicitud.find((s) => s.id_solicitud === id)

      if (!solicitudActual || solicitudActual.estado !== "asignada") {
        delete nuevaAsignacionPendiente[id]
        huboCambios = true
      } else if (
        solicitudActual.cedula_conductor &&
        solicitudActual.cedula_conductor !== asignacionPendiente[id]?.cedulaConductor
      ) {
        delete nuevaAsignacionPendiente[id]
        huboCambios = true
      }
    })

    if (huboCambios) {
      setAsignacionPendiente(nuevaAsignacionPendiente)
    }
  }, [solicitud])

  const handleRefresh = async () => {
    await mutate()
  }

  const handleSeleccionarVehiculo = async (
    idSolicitud: number,
    placaVehiculo: string,
    nombreConductor: string,
    cedulaConductor: number,
  ) => {
    try {
      setAsignandoVehiculo(idSolicitud)

      await editarSolicitudPorId(idSolicitud.toString(), {
        placa_vehiculo: placaVehiculo,
        cedula_conductor: cedulaConductor,
        estado: "asignada",
      })

      await mutate()

      setAsignacionPendiente({
        ...asignacionPendiente,
        [idSolicitud]: { placa: placaVehiculo, nombreConductor, cedulaConductor },
      })

     
    } catch (error) {
      
    } finally {
      setAsignandoVehiculo(null)
    }
  }

  const handleConfirmarAsignacion = async (idSolicitud: number) => {
    const asignacion = asignacionPendiente[idSolicitud]
    if (!asignacion) return

    try {
      setAsignandoVehiculo(idSolicitud)

      await editarSolicitudPorId(idSolicitud.toString(), {
        estado: "aceptada",
      })

      await mutate()

      const nuevaAsignacionPendiente = { ...asignacionPendiente }
      delete nuevaAsignacionPendiente[idSolicitud]
      setAsignacionPendiente(nuevaAsignacionPendiente)

      
    } catch (error) {
      
    } finally {
      setAsignandoVehiculo(null)
    }
  }

  const handleCancelarAsignacion = async (idSolicitud: number) => {
    try {
      setAsignandoVehiculo(idSolicitud)

      await editarSolicitudPorId(idSolicitud.toString(), {
        placa_vehiculo: null,
        cedula_conductor: null,
        estado: "pendiente",
      })

      await mutate()

      const nuevaAsignacionPendiente = { ...asignacionPendiente }
      delete nuevaAsignacionPendiente[idSolicitud]
      setAsignacionPendiente(nuevaAsignacionPendiente)

      
    } catch (error) {
      
    } finally {
      setAsignandoVehiculo(null)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setCurrentPage(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          )
        }
        pages.push(<PaginationEllipsis key="ellipsis" />)
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
              1
            </PaginationLink>
          </PaginationItem>
        )
        pages.push(<PaginationEllipsis key="ellipsis" />)
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setCurrentPage(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          )
        }
      } else {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
              1
            </PaginationLink>
          </PaginationItem>
        )
        pages.push(<PaginationEllipsis key="ellipsis-1" />)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => setCurrentPage(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          )
        }
        pages.push(<PaginationEllipsis key="ellipsis-2" />)
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    return pages
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 text-center">{error?.message || "Error al cargar datos"}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Solicitudes de Transporte</h1>
              <p className="text-slate-600">Gestiona las solicitudes de transporte de empleados.</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2 bg-transparent">
              <RefreshCcw className="h-4 w-4" />
              Refrescar
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="p-6 border-b bg-white">
            <h2 className="text-xl font-semibold text-slate-900">Lista de Registros</h2>
            <p className="text-sm text-slate-600 mt-1">
              Se actualiza automáticamente cada 10 segundos. Total: {solicitud.length} solicitudes | Mostrando {startIndex + 1}-{Math.min(endIndex, solicitud.length)} de {solicitud.length}
            </p>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Solicitante</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Fecha/Hora</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ruta</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Prioridad</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Vehículo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Conductor</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Horas actividad</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesPaginadas.map((sol) => {
                  const vehiculoAsignado = vehiculos.find((v) => v.placa === sol.placa_vehiculo)
                  const asignacionActual = asignacionPendiente[sol.id_solicitud!]

                  return (
                    <tr key={sol.id_solicitud} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{sol.usuario_solicitud_cedula_solicitanteTousuario?.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {sol.usuario_solicitud_cedula_solicitanteTousuario?.telefono}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{formatearFecha(sol.fecha)}</div>
                          <div className="text-sm text-muted-foreground">{formatearHora(sol.hora)}</div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium">{sol.origen}</div>
                          <div className="text-sm text-muted-foreground">→ {sol.destino}</div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`${obtenerPrioridadColor(sol.prioridad)}`}>
                          {ObtenerPrioridadLabel(sol.prioridad)}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`${obtenerEstadoSolicitudColor(sol.estado!)}`}>
                          {ObtenerEstadoSolicitudLabel(sol.estado!)}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        {!asignacionActual && sol.estado !== "asignada" && sol.estado !== "aceptada" ? (
                          <Select
                            value={sol.placa_vehiculo && vehiculoAsignado ? sol.placa_vehiculo : undefined}
                            onValueChange={(value) => {
                              const vehiculoSeleccionado = vehiculos.find((v) => v.placa === value)
                              if (vehiculoSeleccionado && vehiculoSeleccionado.conductor_sugerido && sol.id_solicitud) {
                                handleSeleccionarVehiculo(
                                  sol.id_solicitud,
                                  vehiculoSeleccionado.placa,
                                  vehiculoSeleccionado.conductor_sugerido.nombre,
                                  vehiculoSeleccionado.conductor_sugerido.cedula,
                                )
                              }
                            }}
                            disabled={asignandoVehiculo === sol.id_solicitud || vehiculos.length === 0}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue
                                placeholder={vehiculos.length === 0 ? "Sin vehículos" : "Asignar vehículo"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {vehiculos.map((vehiculo) => (
                                <SelectItem key={vehiculo.placa} value={vehiculo.placa}>
                                  {vehiculo.placa} - {vehiculo.conductor_sugerido?.nombre || "Sin conductor"}
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
                            <div className="font-medium mb-2">{asignacionActual.nombreConductor}</div>
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
                          {sol.hora_inicio_transporte && sol.hora_fin_transporte ? (
                            <>
                              {formatearHora(sol.hora_inicio_transporte)} - {formatearHora(sol.hora_fin_transporte)}
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
                            <Link href={`/dashboard/gestion-solicitud/ver/${sol.id_solicitud}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="hidden md:flex justify-center items-center p-6 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <div className="md:hidden space-y-4 p-4">
            {solicitudesPaginadas.map((sol) => {
              const vehiculoAsignado = vehiculos.find((v) => v.placa === sol.placa_vehiculo)
              const asignacionActual = asignacionPendiente[sol.id_solicitud!]

              return (
                <Card key={sol.id_solicitud} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {sol.usuario_solicitud_cedula_solicitanteTousuario?.nombre}
                      </h3>
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
                      <DropdownMenuContent align="end" className="w-48">
                        <Link href={`/dashboard/gestion-solicitud/ver/${sol.id_solicitud}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Fecha</p>
                      <p className="font-medium">{formatearFecha(sol.fecha)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Hora</p>
                      <p className="font-medium">{formatearHora(sol.hora)}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Ruta</p>
                    <p className="font-medium text-sm">{sol.origen}</p>
                    <p className="text-sm text-muted-foreground">→ {sol.destino}</p>
                  </div>

                  <div className="flex gap-2">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Prioridad</p>
                      <Badge variant="outline" className={`${obtenerPrioridadColor(sol.prioridad)}`}>
                        {ObtenerPrioridadLabel(sol.prioridad)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Estado</p>
                      <Badge variant="outline" className={`${obtenerEstadoSolicitudColor(sol.estado!)}`}>
                        {ObtenerEstadoSolicitudLabel(sol.estado!)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Vehículo</p>
                      {!asignacionActual && sol.estado !== "asignada" && sol.estado !== "aceptada" ? (
                        <Select
                          value={sol.placa_vehiculo && vehiculoAsignado ? sol.placa_vehiculo : undefined}
                          onValueChange={(value) => {
                            const vehiculoSeleccionado = vehiculos.find((v) => v.placa === value)
                            if (vehiculoSeleccionado && vehiculoSeleccionado.conductor_sugerido && sol.id_solicitud) {
                              handleSeleccionarVehiculo(
                                sol.id_solicitud,
                                vehiculoSeleccionado.placa,
                                vehiculoSeleccionado.conductor_sugerido.nombre,
                                vehiculoSeleccionado.conductor_sugerido.cedula,
                              )
                            }
                          }}
                          disabled={asignandoVehiculo === sol.id_solicitud || vehiculos.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={vehiculos.length === 0 ? "Sin vehículos" : "Asignar vehículo"} />
                          </SelectTrigger>
                          <SelectContent>
                            {vehiculos.map((vehiculo) => (
                              <SelectItem key={vehiculo.placa} value={vehiculo.placa}>
                                {vehiculo.placa} - {vehiculo.conductor_sugerido?.nombre || "Sin conductor"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium">{asignacionActual?.placa || sol.placa_vehiculo || "Sin asignar"}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-2">Conductor</p>
                      {asignacionActual ? (
                        <div className="space-y-2">
                          <p className="font-medium">{asignacionActual.nombreConductor}</p>
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
                        <p className="font-medium">
                          {sol.usuario_solicitud_cedula_conductorTousuario?.nombre || (
                            <span className="text-muted-foreground">Sin asignar</span>
                          )}
                        </p>
                      )}
                    </div>

                    {(sol.hora_inicio_transporte || sol.hora_fin_transporte) && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Horas de actividad</p>
                        <p className="text-sm">
                          {formatearHora(sol.hora_inicio_transporte)} - {formatearHora(sol.hora_fin_transporte)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="md:hidden flex justify-center items-center p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {renderPageNumbers()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      </div>
    </div>
  )
}
