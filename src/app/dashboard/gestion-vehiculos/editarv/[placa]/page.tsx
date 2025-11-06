"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  editarVehiculoPorPlaca,
  obtenerVehiculoPorPlaca,
  type Vehiculo,
  type ConductorAsignado,
} from "@/lib/vehiculos/vehiculoApi"
import { obtenerConductores, type DatosUsuario } from "@/lib/usuario/usuario"
import { useRouter, useParams } from "next/navigation"
import { Truck, Calendar, Gauge, Users, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditarVehiculoPage() {
  const router = useRouter()
  const params = useParams()
  const placa = params.placa as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [conductores, setConductores] = useState<DatosUsuario[]>([])
  const [isLoadingConductores, setIsLoadingConductores] = useState(true)
  const [formData, setFormData] = useState<Vehiculo>({
    placa: "",
    tipo_vehiculo: undefined,
    capacidad: null,
    odometro: null,
    estado: "disponible",
    fecha_ultimo_mantenimiento: null,
    conductores: [],
  })

  const [conductorHabitual, setConductorHabitual] = useState<string>("")
  const [conductorEventual, setConductorEventual] = useState<string>("")

  // Cargar datos del vehículo
  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const data = await obtenerVehiculoPorPlaca(placa)

        if (data && data.length > 0) {
          const vehiculo = data[0]

          // Formatear fecha para input type="date"
          let fechaFormateada = null
          if (vehiculo.fecha_ultimo_mantenimiento) {
            const fecha = new Date(vehiculo.fecha_ultimo_mantenimiento)
            fechaFormateada = fecha.toISOString().split("T")[0]
          }

          setFormData({
            placa: vehiculo.placa,
            tipo_vehiculo: vehiculo.tipo_vehiculo,
            capacidad: vehiculo.capacidad,
            odometro: vehiculo.odometro,
            estado: vehiculo.estado,
            fecha_ultimo_mantenimiento: fechaFormateada,
            conductores: vehiculo.conductores || [],
          })

          // Establecer conductores existentes
          if (vehiculo.conductores && vehiculo.conductores.length > 0) {
            const habitual = vehiculo.conductores.find((c) => c.tipo_conductor === "habitual")
            const eventual = vehiculo.conductores.find((c) => c.tipo_conductor === "eventual")

            if (habitual) {
              setConductorHabitual(habitual.cedula_conductor.toString())
            }
            if (eventual) {
              setConductorEventual(eventual.cedula_conductor.toString())
            }
          }
        }
      } catch (error) {
        console.error("Error fetching vehiculo:", error)
        toast.error("Error al cargar los datos del vehículo")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (placa) {
      fetchVehiculo()
    }
  }, [placa])

  // Cargar lista de conductores
  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const data = await obtenerConductores()
        setConductores(data)
      } catch (error) {
        console.error("Error fetching conductores:", error)
        toast.error("Error al cargar la lista de conductores")
      } finally {
        setIsLoadingConductores(false)
      }
    }

    fetchConductores()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Construir array de conductores
      const conductores: ConductorAsignado[] = []

      if (conductorHabitual && conductorHabitual !== "none") {
        conductores.push({
          cedula_conductor: Number.parseInt(conductorHabitual),
          tipo_conductor: "habitual",
        })
      }

      if (conductorEventual && conductorEventual !== "none") {
        conductores.push({
          cedula_conductor: Number.parseInt(conductorEventual),
          tipo_conductor: "eventual",
        })
      }

      const dataToSend: Vehiculo = {
        ...formData,
        conductores,
      }

      await editarVehiculoPorPlaca(placa, dataToSend)

      toast.success("Vehículo actualizado exitosamente")
      router.push("/dashboard/gestion-vehiculos")
    } catch (error) {
      console.error("Error updating vehicle:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar el vehículo")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-lg text-muted-foreground">Cargando datos del vehículo...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard/gestion-vehiculos")} className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Gestión de Vehículos
          </Button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Editar Vehículo</h1>
            <p className="mt-2 text-lg text-muted-foreground">Actualiza la información del vehículo {placa}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Información del Vehículo</CardTitle>
              <CardDescription className="text-base">Modifica los campos que desees actualizar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Información básica */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="placa" className="text-base font-semibold">
                    Placa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    disabled
                    className="text-base py-5 bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">La placa no se puede modificar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_vehiculo" className="text-base font-semibold">
                    Tipo de Vehículo
                  </Label>
                  <Select
                    value={formData.tipo_vehiculo}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        tipo_vehiculo: value as Vehiculo["tipo_vehiculo"],
                      })
                    }
                  >
                    <SelectTrigger id="tipo_vehiculo" className="text-base w-full py-5">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camion">Camión</SelectItem>
                      <SelectItem value="carrotanque">Carrotanque</SelectItem>
                      <SelectItem value="camioneta">Camioneta</SelectItem>
                      <SelectItem value="retroexcavadora">Retroexcavadora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidad" className="text-base font-semibold">
                    Capacidad Transporte
                  </Label>
                  <div className="relative">
                    <Input
                      id="capacidad"
                      type="number"
                      placeholder="10"
                      value={formData.capacidad ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacidad: e.target.value ? Number.parseFloat(e.target.value) : null,
                        })
                      }
                      className="py-5 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odometro" className="text-base font-semibold">
                    Odómetro (km)
                  </Label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="odometro"
                      type="number"
                      placeholder="125000"
                      value={formData.odometro ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          odometro: e.target.value ? Number.parseFloat(e.target.value) : null,
                        })
                      }
                      className="py-5 pl-10 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-base font-semibold">
                    Estado
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        estado: value as Vehiculo["estado"],
                      })
                    }
                  >
                    <SelectTrigger id="estado" className="h-11 text-base w-full py-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="no_disponible">No Disponible</SelectItem>
                      <SelectItem value="asignado">Asignado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_ultimo_mantenimiento" className="text-base font-semibold">
                    Último Mantenimiento
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fecha_ultimo_mantenimiento"
                      type="date"
                      value={formData.fecha_ultimo_mantenimiento ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fecha_ultimo_mantenimiento: e.target.value || null,
                        })
                      }
                      className="py-5 pl-10 text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Asignación de Conductores */}
              <div className="space-y-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Asignación de Conductores</h3>
                </div>
                <p className="text-sm text-muted-foreground">Modifica los conductores asignados al vehículo</p>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="conductor_habitual" className="text-base font-medium">
                      Conductor Habitual
                    </Label>
                    <Select
                      value={conductorHabitual}
                      onValueChange={setConductorHabitual}
                      disabled={isLoadingConductores}
                    >
                      <SelectTrigger id="conductor_habitual" className="py-5 text-base w-full">
                        <SelectValue placeholder={isLoadingConductores ? "Cargando..." : "Sin Asignar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin Asignar</SelectItem>
                        {conductores.map((conductor) => (
                          <SelectItem key={conductor.cedula} value={conductor.cedula.toString()}>
                            {conductor.nombre} (CC: {conductor.cedula})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conductor_eventual" className="text-base font-medium">
                      Conductor Eventual
                    </Label>
                    <Select
                      value={conductorEventual}
                      onValueChange={setConductorEventual}
                      disabled={isLoadingConductores}
                    >
                      <SelectTrigger id="conductor_eventual" className="py-5 text-base w-full">
                        <SelectValue placeholder={isLoadingConductores ? "Cargando..." : "Sin Asignar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin Asignar</SelectItem>
                        {conductores.map((conductor) => (
                          <SelectItem key={conductor.cedula} value={conductor.cedula.toString()}>
                            {conductor.nombre} (CC: {conductor.cedula})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/dashboard/gestion-vehiculos")}
                  disabled={isLoading}
                  className="h-12 text-base font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !formData.placa}
                  className="h-12 text-base font-semibold"
                >
                  {isLoading ? "Guardando..." : "Actualizar Vehículo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
