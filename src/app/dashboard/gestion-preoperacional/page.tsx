"use client"

import { useEffect, useState } from "react"
import { obtenerRegistros, type Preoperacional } from "@/lib/preoperacional/preoperacional"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Truck,
  MoreVertical,
  Eye,
  Pencil,
  RefreshCcw,
  Calendar,
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import dayjs from "dayjs"
import { es } from "date-fns/locale"
import utc from "dayjs/plugin/utc"
import { toast } from "sonner"

dayjs.extend(utc)

import { formatearFecha } from "@/componentsux/formatearFecha"
import { actualizarEstadoInspeccion } from "@/lib/preoperacional/preoperacional"

export default function GestionPreoperacional() {
  const [preoperacional, setPreoperacional] = useState<Preoperacional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroVehiculo, setFiltroVehiculo] = useState<string>("todos")
  const [filtroConductor, setFiltroConductor] = useState<string>("todos")
  const [paginaActualHoy, setPaginaActualHoy] = useState(1)
  const [paginaActualAntiguas, setPaginaActualAntiguas] = useState(1)
  const itemsPorPagina = 2

  const fechaHoy = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setLoading(true)
      const preoperacionalData = await obtenerRegistros()
      console.log("info", preoperacionalData)
      setPreoperacional(preoperacionalData)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const handleActualizarEstado = async (idInspeccion: string) => {
    setLoading(true)
    setError(null)
    try {
      await actualizarEstadoInspeccion(idInspeccion)
      await cargarDatos()
      toast.success("Estado actualizado correctamente")
    } catch (err) {
      setError("Error al actualizar estado")
      toast.error("Error al actualizar estado")
      console.error("Error al actualizar estado:", err)
    } finally {
      setLoading(false)
    }
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

  const aplicarFiltros = (registros: Preoperacional[]) => {
    return registros.filter((preo) => {
      if (filtroEstado !== "todos" && preo.vehiculo?.estado !== filtroEstado) {
        return false
      }
      if (filtroVehiculo !== "todos" && preo.placa_vehiculo !== filtroVehiculo) {
        return false
      }
      if (filtroConductor !== "todos" && preo.cedula_conductor?.toString() !== filtroConductor) {
        return false
      }
      return true
    })
  }

  const vehiculosUnicos = Array.from(
    new Set(preoperacional.filter((p) => p.placa_vehiculo).map((p) => p.placa_vehiculo)),
  )

  const conductoresUnicos = Array.from(
    new Set(
      preoperacional
        .filter((p) => p.usuario)
        .map((p) => ({
          cedula: p.cedula_conductor!,
          nombre: p.usuario?.nombre!,
        })),
    ),
  ).filter((c, index, self) => index === self.findIndex((t) => t.cedula === c.cedula))

  const registrosHoy = aplicarFiltros(
    preoperacional.filter((preo) => {
      const fechaRegistro = preo.fecha ? new Date(preo.fecha).toISOString().split("T")[0] : ""
      return fechaRegistro === fechaHoy
    }),
  )

  const registrosAntiguos = aplicarFiltros(
    preoperacional.filter((preo) => {
      const fechaRegistro = preo.fecha ? new Date(preo.fecha).toISOString().split("T")[0] : ""
      return fechaRegistro < fechaHoy
    }),
  )

  const totalPaginasHoy = Math.ceil(registrosHoy.length / itemsPorPagina)
  const indiceInicioHoy = (paginaActualHoy - 1) * itemsPorPagina
  const indiceFinalHoy = indiceInicioHoy + itemsPorPagina
  const registrosHoyPaginados = registrosHoy.slice(indiceInicioHoy, indiceFinalHoy)

  const totalPaginasAntiguas = Math.ceil(registrosAntiguos.length / itemsPorPagina)
  const indiceInicioAntiguas = (paginaActualAntiguas - 1) * itemsPorPagina
  const indiceFinalAntiguas = indiceInicioAntiguas + itemsPorPagina
  const registrosAntiguosPaginados = registrosAntiguos.slice(indiceInicioAntiguas, indiceFinalAntiguas)

  useEffect(() => {
    setPaginaActualHoy(1)
    setPaginaActualAntiguas(1)
  }, [filtroEstado, filtroVehiculo, filtroConductor])

  const Filtros = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filtros:</span>
      </div>
      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value="disponible">Disponible</SelectItem>
          <SelectItem value="no_disponible">No Disponible</SelectItem>
          <SelectItem value="asignado">Asignado</SelectItem>
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
            <SelectItem key={conductor.cedula} value={conductor.cedula.toString()}>
              {conductor.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(filtroEstado !== "todos" || filtroVehiculo !== "todos" || filtroConductor !== "todos") && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFiltroEstado("todos")
            setFiltroVehiculo("todos")
            setFiltroConductor("todos")
          }}
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  const PaginationControls = ({
    paginaActual,
    totalPaginas,
    setPagina,
  }: {
    paginaActual: number
    totalPaginas: number
    setPagina: (pagina: number) => void
  }) => {
    if (totalPaginas <= 1) return null

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
    )
  }

  const renderRegistroRow = (preo: Preoperacional) => (
    <tr key={preo.id_inspeccion} className="hover:bg-slate-50 transition-colors border-b">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{preo.placa_vehiculo}</div>
            <div className="text-sm text-muted-foreground">{obtenerTipoLabel(preo.vehiculo?.tipo_vehiculo)}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="font-medium">{preo.usuario?.nombre}</span>
      </td>
      <td className="py-4 px-6">
        <span className="font-medium">
          {format(dayjs.utc(preo.fecha).endOf("day").toDate(), "PPP", {
            locale: es,
          })}
        </span>
      </td>
      <td className="py-4 px-6">
        <Badge variant="outline" className={`${obtenerEstadoColor(preo.vehiculo?.estado)}`}>
          {obtenerEstadoLabel(preo.vehiculo?.estado)}
        </Badge>
      </td>
      <td className="py-4 px-6">
        <Badge variant="estadoVehiculo">{preo.observaciones ? preo.observaciones : "Sin alertas"}</Badge>
      </td>
      <td className="py-4 px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href={`/dashboard/gestion-preoperacional/ver/${preo.id_inspeccion}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleActualizarEstado(preo.id_inspeccion.toString())}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Actualizar Estado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )

  const renderRegistroCard = (preo: Preoperacional) => (
    <Card key={preo.id_inspeccion} className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">{preo.placa_vehiculo}</p>
            <p className="text-sm text-muted-foreground">{obtenerTipoLabel(preo.vehiculo?.tipo_vehiculo)}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href={`/dashboard/gestion-preoperacional/ver/${preo.id_inspeccion}`}>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleActualizarEstado(preo.id_inspeccion.toString())}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Actualizar Estado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Conductor</p>
        <p className="font-medium">{preo.usuario?.nombre}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Fecha</p>
        <p className="font-medium">{formatearFecha(preo.fecha)}</p>
      </div>

      <div className="flex gap-2">
        <Badge variant="outline" className={obtenerEstadoColor(preo.vehiculo?.estado)}>
          {obtenerEstadoLabel(preo.vehiculo?.estado)}
        </Badge>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Alertas</p>
        <Badge variant="estadoVehiculo">{preo.observaciones ? preo.observaciones : "Sin alertas"}</Badge>
      </div>
    </Card>
  )

  if (loading) {
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
          <p className="text-red-600 text-center">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Inspección Preoperacional</h1>
              <p className="text-slate-600">Registros de inspección organizados por fecha</p>
            </div>
          </div>
        </div>

        <Card className="p-4 mb-5">
          <Filtros />
        </Card>

        <Tabs defaultValue="hoy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hoy" className="gap-2">
              <Calendar className="h-4 w-4" />
              Hoy ({registrosHoy.length})
            </TabsTrigger>
            <TabsTrigger value="antiguas" className="gap-2">
              <History className="h-4 w-4" />
              Anteriores ({registrosAntiguos.length})
            </TabsTrigger>
          </TabsList>

          {/* Today's records tab */}
          <TabsContent value="hoy">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b bg-white">
                <h2 className="text-xl font-semibold text-slate-900">Registros de Hoy</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Inspecciones realizadas hoy • {registrosHoy.length} registros
                </p>
              </div>

              {registrosHoy.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay registros para hoy</p>
                </div>
              ) : (
                <>
                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Vehículo</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Conductor</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Fecha</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Estado</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Alertas</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">{registrosHoyPaginados.map(renderRegistroRow)}</tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                    {registrosHoyPaginados.map(renderRegistroCard)}
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

          {/* Historical records tab */}
          <TabsContent value="antiguas">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="p-6 border-b bg-white">
                <h2 className="text-xl font-semibold text-slate-900">Registros Anteriores</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Historial de inspecciones • {registrosAntiguos.length} registros
                </p>
              </div>

              {registrosAntiguos.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No hay registros anteriores</p>
                </div>
              ) : (
                <>
                  {/* Desktop view */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Vehículo</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Conductor</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Fecha</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Estado</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Alertas</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">{registrosAntiguosPaginados.map(renderRegistroRow)}</tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden p-4 space-y-4 bg-slate-50">
                    {registrosAntiguosPaginados.map(renderRegistroCard)}
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
  )
}
