"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { obtenerRegistroPreoperacional, type Preoperacional } from "@/lib/preoperacional/preoperacional"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Truck,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Gauge,
  Lightbulb,
  Disc,
  Fuel,
  MessageSquare,
} from "lucide-react"
import { obtenerEstadoColor, obtenerEstadoLabel, obtenerTipoLabel } from "@/componentsux/estadoVehiculo"
import { formatearFecha } from "@/componentsux/formatearFecha"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DetalleInspeccionPreoperacional({ params }: PageProps) {
  const router = useRouter()
  const [preoperacional, setPreoperacional] = useState<Preoperacional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [id, setId] = useState<string>("")

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true)
        const resolvedParams = await params
        const idParam = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id
        setId(idParam)

        const preoperacionalData = await obtenerRegistroPreoperacional(idParam)
        console.log("info", preoperacionalData)

        if (preoperacionalData && preoperacionalData.length > 0) {
          setPreoperacional(preoperacionalData[0])
        } else {
          setError("Registro no encontrado")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [params])

  const obtenerEstadoElementoLabel = (estado?: string) => {
    switch (estado) {
      case "bueno":
        return "Bueno"
      case "regular":
        return "Regular"
      case "malo":
        return "Malo"
      default:
        return "N/A"
    }
  }

  const obtenerEstadoElementoColor = (estado?: string) => {
    switch (estado) {
      case "bueno":
        return "bg-green-100 text-green-700 border-green-200"
      case "regular":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "malo":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const obtenerCombustibleLabel = (nivel?: string) => {
    switch (nivel) {
      case "lleno":
        return "Lleno"
      case "medio":
        return "Medio"
      case "bajo":
        return "Bajo"
      default:
        return "N/A"
    }
  }

  const obtenerCombustibleColor = (nivel?: string) => {
    switch (nivel) {
      case "lleno":
        return "bg-green-100 text-green-700 border-green-200"
      case "medio":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "bajo":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalle de inspección...</p>
        </div>
      </div>
    )
  }

  if (error || !preoperacional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 text-center mb-4">{error || "Registro no encontrado"}</p>
          <Button onClick={() => router.back()} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Detalle Inspección Preoperacional</h1>
              <p className="text-slate-600 text-lg">
                Información completa de la inspección realizada por <span className="font-bold">{preoperacional.usuario?.nombre}</span> el dia <span className="font-bold">{formatearFecha(preoperacional.fecha)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Header Card */}
        <Card className="p-6 mb-6 shadow-lg border-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{preoperacional.placa_vehiculo}</h2>
              <p className="text-sm text-slate-600">{obtenerTipoLabel(preoperacional.vehiculo?.tipo_vehiculo)}</p>
            </div>
            <Badge
              variant="outline"
              className={`${obtenerEstadoColor(preoperacional.vehiculo?.estado)} text-sm px-3 py-1`}
            >
              {obtenerEstadoLabel(preoperacional.vehiculo?.estado)}
            </Badge>
          </div>
        </Card>

        {/* Info Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-slate-600">Conductor</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">{preoperacional.usuario?.nombre}</p>
            <p className="text-sm text-slate-600 mt-1">CC: {preoperacional.cedula_conductor}</p>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-slate-600">Fecha de Inspección</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">{formatearFecha(preoperacional.fecha)}</p>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">Vehículo</p>
            </div>
            <p className="text-xl font-semibold text-slate-900">{preoperacional.placa_vehiculo}</p>
            <p className="text-sm text-slate-600 mt-1">{obtenerTipoLabel(preoperacional.vehiculo?.tipo_vehiculo)}</p>
          </Card>
        </div> */}

        {/* Condiciones del Conductor */}
        <Card className="shadow-lg border-0 mb-6 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Condiciones del Conductor</h2>
            <p className="text-sm text-slate-600 mt-1">
              Evaluación de las condiciones físicas y mentales del conductor
            </p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                {preoperacional.descanso_adecuando ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-slate-900">Descanso Adecuado</span>
              </div>
              <Badge
                variant="outline"
                className={
                  preoperacional.descanso_adecuando
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {preoperacional.descanso_adecuando ? "Sí" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                {!preoperacional.consumo_alcohol ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-slate-900">Sin Consumo de Alcohol</span>
              </div>
              <Badge
                variant="outline"
                className={
                  !preoperacional.consumo_alcohol
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {!preoperacional.consumo_alcohol ? "Sí" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                {!preoperacional.medicamentos_que_afecten_conduccion ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium text-slate-900">Sin Medicamentos que Afecten la Conducción</span>
              </div>
              <Badge
                variant="outline"
                className={
                  !preoperacional.medicamentos_que_afecten_conduccion
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }
              >
                {!preoperacional.medicamentos_que_afecten_conduccion ? "Sí" : "No"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                {preoperacional.condiciones_fisicas_mentales ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium text-slate-900">Condiciones Físicas y Mentales Aptas</span>
              </div>
              <Badge
                variant="outline"
                className={
                  preoperacional.condiciones_fisicas_mentales
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {preoperacional.condiciones_fisicas_mentales ? "Sí" : "No"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Documentación del Vehículo */}
        <Card className="shadow-lg border-0 mb-6 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Documentación del Vehículo</h2>
            <p className="text-sm text-slate-600 mt-1">Verificación de documentos legales y obligatorios</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">SOAT</p>
                  {/* <p className="text-sm text-slate-600">Seguro Obligatorio de Accidentes de Tránsito</p> */}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  preoperacional.soat_vigente
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {preoperacional.soat_vigente ? "Vigente" : "Vencido"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Revisión Técnico-Mecánica</p>
                  {/* <p className="text-sm text-slate-600">Certificado de inspección técnica</p> */}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  preoperacional.tecnico_mecanica
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {preoperacional.tecnico_mecanica ? "Vigente" : "Vencido"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Estado del Vehículo */}
        <Card className="shadow-lg border-0 mb-6 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Estado del Vehículo</h2>
            <p className="text-sm text-slate-600 mt-1">Condiciones mecánicas y operativas del vehículo</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-orange-600" />
                </div>
                <p className="font-medium text-slate-900">Estado de Llantas</p>
              </div>
              <Badge variant="outline" className={`${obtenerEstadoElementoColor(preoperacional.estado_llantas)} mt-2`}>
                {obtenerEstadoElementoLabel(preoperacional.estado_llantas)}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="font-medium text-slate-900">Estado de Luces</p>
              </div>
              <Badge variant="outline" className={`${obtenerEstadoElementoColor(preoperacional.estado_luces)} mt-2`}>
                {obtenerEstadoElementoLabel(preoperacional.estado_luces)}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Disc className="w-5 h-5 text-red-600" />
                </div>
                <p className="font-medium text-slate-900">Estado de Frenos</p>
              </div>
              <Badge variant="outline" className={`${obtenerEstadoElementoColor(preoperacional.estado_frenos)} mt-2`}>
                {obtenerEstadoElementoLabel(preoperacional.estado_frenos)}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium text-slate-900">Nivel de Combustible</p>
              </div>
              <Badge variant="outline" className={`${obtenerCombustibleColor(preoperacional.nivel_combustible)} mt-2`}>
                {obtenerCombustibleLabel(preoperacional.nivel_combustible)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Observaciones */}
        <Card className="shadow-lg border-0 bg-white">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-900">Observaciones</h2>
            <p className="text-sm text-slate-600 mt-1">Notas y comentarios adicionales sobre la inspección</p>
          </div>
          <div className="p-6">
            {preoperacional.observaciones ? (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-slate-700">{preoperacional.observaciones}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Sin observaciones registradas</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
