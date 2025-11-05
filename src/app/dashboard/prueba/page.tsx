"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  registrarSolicitud,
  type TipoLabor,
  type Prioridad,
} from "@/lib/solicitud/solicitudApi";
import {
  obtenerEmpleados,
  obtenerConductores,
  type DatosUsuario,
} from "@/lib/usuario/usuario";
import { obtenerVehiculos, type Vehiculo } from "@/lib/vehiculos/vehiculoApi";

export default function SolicitudVehiculoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [empleados, setEmpleados] = useState<DatosUsuario[]>([]);
  const [conductores, setConductores] = useState<DatosUsuario[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    cedula_solicitante: "",
    telefono: "",
    placa_vehiculo: "",
    cedula_conductor: "",
    fecha: "",
    hora: "",
    cantidad_pasajeros: "",
    origen: "",
    destino: "",
    tipo_labor: "" as TipoLabor,
    prioridad: "" as Prioridad,
    equipo_o_carga: "",
    observaciones: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [empleadosData, conductoresData, vehiculosData] =
          await Promise.all([
            obtenerEmpleados(),
            obtenerConductores(),
            obtenerVehiculos(),
          ]);
        setEmpleados(empleadosData);
        setConductores(conductoresData);
        setVehiculos(vehiculosData);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al cargar los datos"
        );
      } finally {
        setLoadingData(false);
      }
    };
    cargarDatos();
  }, [toast]);

  const handleEmpleadoChange = (cedula: string) => {
    const empleado = empleados.find((e) => e.cedula.toString() === cedula);
    setFormData({
      ...formData,
      cedula_solicitante: cedula,
      telefono: empleado?.telefono?.toString() || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registrarSolicitud({
        cedula_solicitante: Number(formData.cedula_solicitante),
        telefono: formData.telefono,
        placa_vehiculo: formData.placa_vehiculo,
        cedula_conductor: Number(formData.cedula_conductor),
        fecha: formData.fecha,
        hora: formData.hora,
        origen: formData.origen,
        destino: formData.destino,
        tipo_labor: formData.tipo_labor,
        prioridad: formData.prioridad,
        cantidad_pasajeros: Number(formData.cantidad_pasajeros),
        equipo_o_carga: formData.equipo_o_carga,
        observaciones: formData.observaciones,
        estado: "pendiente",
        id_solicitud: 0,
        hora_inicio_transporte: "",
        hora_fin_transporte: "",
      });

      toast.success("solicitud creada");

      router.push("/dashboard");
    } catch (error) {
      toast.error("error al crear la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Solicitud de Vehículo</CardTitle>
          <CardDescription>
            Complete el formulario para solicitar un vehículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Solicitante */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Información del Solicitante
              </h3>

              <div className="space-y-2">
                <Label htmlFor="empleado">Empleado *</Label>
                <Select
                  value={formData.cedula_solicitante}
                  onValueChange={handleEmpleadoChange}
                  required
                >
                  <SelectTrigger id="empleado">
                    <SelectValue placeholder="Seleccione un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleados.map((empleado) => (
                      <SelectItem
                        key={empleado.cedula}
                        value={empleado.cedula.toString()}
                      >
                        {empleado.nombre} - {empleado.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Información del Vehículo y Conductor */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Asignación de Vehículo</h3>

              <div className="space-y-2">
                <Label htmlFor="vehiculo">Vehículo *</Label>
                <Select
                  value={formData.placa_vehiculo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, placa_vehiculo: value })
                  }
                  required
                >
                  <SelectTrigger id="vehiculo">
                    <SelectValue placeholder="Seleccione un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((vehiculo) => (
                      <SelectItem key={vehiculo.placa} value={vehiculo.placa}>
                        {vehiculo.placa} - {vehiculo.tipo_vehiculo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conductor">Conductor *</Label>
                <Select
                  value={formData.cedula_conductor}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cedula_conductor: value })
                  }
                  required
                >
                  <SelectTrigger id="conductor">
                    <SelectValue placeholder="Seleccione un conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {conductores.map((conductor) => (
                      <SelectItem
                        key={conductor.cedula}
                        value={conductor.cedula.toString()}
                      >
                        {conductor.nombre} - {conductor.cedula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            

            {/* Detalles del Viaje */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles del Viaje</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">Hora *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pasajeros">Número de Pasajeros *</Label>
                <Input
                  id="pasajeros"
                  type="number"
                  min="1"
                  value={formData.cantidad_pasajeros}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad_pasajeros: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origen">Origen *</Label>
                <Input
                  id="origen"
                  type="text"
                  placeholder="Dirección de origen"
                  value={formData.origen}
                  onChange={(e) =>
                    setFormData({ ...formData, origen: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino">Destino *</Label>
                <Input
                  id="destino"
                  type="text"
                  placeholder="Dirección de destino"
                  value={formData.destino}
                  onChange={(e) =>
                    setFormData({ ...formData, destino: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_labor">Tipo de Labor *</Label>
                  <Select
                    value={formData.tipo_labor}
                    onValueChange={(value: TipoLabor) =>
                      setFormData({ ...formData, tipo_labor: value })
                    }
                    required
                  >
                    <SelectTrigger id="tipo_labor">
                      <SelectValue placeholder="Seleccione tipo de labor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mantenimiento">
                        Mantenimiento
                      </SelectItem>
                      <SelectItem value="reparacion">Reparación</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="inspeccion_tecnica">
                        Inspección Técnica
                      </SelectItem>
                      <SelectItem value="emergencia">Emergencia</SelectItem>
                      <SelectItem value="gestion_administrativa">
                        Gestión Administrativa
                      </SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridad">Prioridad *</Label>
                  <Select
                    value={formData.prioridad}
                    onValueChange={(value: Prioridad) =>
                      setFormData({ ...formData, prioridad: value })
                    }
                    required
                  >
                    <SelectTrigger id="prioridad">
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipo">Carga o Equipo a Transportar</Label>
                <Textarea
                  id="equipo"
                  placeholder="Describa la carga o equipo a transportar"
                  value={formData.equipo_o_carga}
                  onChange={(e) =>
                    setFormData({ ...formData, equipo_o_carga: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales"
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Registrando..." : "Registrar Solicitud"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
