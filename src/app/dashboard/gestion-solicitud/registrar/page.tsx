"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { obtenerEmpleados, type DatosUsuario } from "@/lib/usuario/usuario";
import {
  registrarSolicitud,
  type Solicitud,
  type TipoLabor,
  type Prioridad,
} from "@/lib/solicitud/solicitudApi";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/componentsux/dashboard/useAuth";

export default function SolicitudVehiculoPage() {
   const loading = useAuth();
  

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [empleados, setEmpleados] = useState<DatosUsuario[]>([]);
  const [empleadoOpen, setEmpleadoOpen] = useState(false);
  const [loadingSolicitud, setLoadingSolicitud] = useState(true);
  const hoy = new Date().toLocaleDateString("en-CA");

  const [formData, setFormData] = useState<Solicitud>({
    id_solicitud: 0,
    cedula_solicitante: 0,
    telefono: "",
    placa_vehiculo: "",
    cedula_conductor: 0,
    fecha: hoy,
    hora: "",
    origen: "",
    destino: "",
    estado: "pendiente",
    tipo_labor: "otro",
    prioridad: "baja",
    cantidad_pasajeros: 0,
    equipo_o_carga: "",
    observaciones: "",
    hora_inicio_transporte: "",
    hora_fin_transporte: "",
  });

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const dataEmpleados = await obtenerEmpleados();
        console.log("info empleados", dataEmpleados);
        setEmpleados(dataEmpleados);
      } catch (error) {
        console.error("Error fetching empleados:", error);
        toast.error("Error al cargar la lista de empleados");
      } finally {
        setLoadingSolicitud(false);
      }
    };
    cargarEmpleados();
  }, []);

  const handleEmpleadoChange = (value: string) => {
    const cedula = parseInt(value);
    const empleado = empleados.find((e) => e.cedula === cedula);
    setFormData({
      ...formData,
      cedula_solicitante: cedula,
      telefono: empleado?.telefono?.toString() || "",
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

     console.log("Datos a enviar:", formData);

    try {
      await registrarSolicitud(formData);
      toast.success("Solicitud creada exitosamente");
       console.log("Datos enviados:", formData);
      //router.push("/dashboard");
    } catch (error) {
      toast.error("Error al crear el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const seleccionarEmpleado = empleados.find(
    (e) => e.cedula === formData.cedula_solicitante
  );

  const normalizarTexto = (texto: string): string => {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  if (loadingSolicitud) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return <div className="spinner">Verificando...</div>;
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
          <form onSubmit={handleSubmit}>
            <div>
              <h3>Información Solicitante</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empleado">Empleado *</Label>
                  <Popover open={empleadoOpen} onOpenChange={setEmpleadoOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={empleadoOpen}
                        className="w-full md:w-2/2 justify-between bg-transparent"
                      >
                        {seleccionarEmpleado
                          ? `${seleccionarEmpleado.nombre} - ${seleccionarEmpleado.cedula}`
                          : "Seleccionar empleado.."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command
                        filter={(value, search) => {
                          const emp = empleados.find(
                            (e) => e.cedula.toString() === value
                          );
                          if (!emp) return 0;

                          const nombreMatch = emp.nombre
                            .toLowerCase()
                            .includes(search.toLowerCase());
                          const cedulaMatch = emp.cedula
                            .toString()
                            .includes(search);

                          return nombreMatch || cedulaMatch ? 1 : 0;
                        }}
                      >
                        <CommandInput placeholder="Buscar empleado..." />
                        <CommandList>
                          <CommandEmpty>
                            No se encontró el empleado.
                          </CommandEmpty>
                          <CommandGroup>
                            {empleados.map((emp) => (
                              <CommandItem
                                key={emp.cedula}
                                value={emp.cedula.toString()}
                                onSelect={() => {
                                  handleEmpleadoChange(emp.cedula.toString());
                                  setEmpleadoOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    seleccionarEmpleado?.cedula === emp.cedula
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />

                                <div>
                                  <div className="font-medium">
                                    {emp.nombre}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Cédula: {emp.cedula}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="empleado">Empleado *</Label>
                  <Select
                    value={
                      formData.cedula_solicitante &&
                      formData.cedula_solicitante !== 0
                        ? formData.cedula_solicitante.toString()
                        : undefined
                    }
                    onValueChange={handleEmpleadoChange}
                    required
                  >
                    <SelectTrigger id="empleado" className="w-full">
                      <SelectValue placeholder="Seleccione un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {empleados.map((emp) => (
                        <SelectItem
                          key={emp.cedula}
                          value={emp.cedula.toString()}
                        >
                          {emp.nombre} - {emp.cedula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    placeholder="Se llena al elegir empleado"
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    readOnly
                    className="bg-muted"
                  ></Input>
                </div>
              </div>

              <div className="space-y-4 mt-5">
                <h3 className="">Detalles del Viaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha: e.target.value,
                        }))
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
                        setFormData((prev) => ({
                          ...prev,
                          hora: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origen">Origen *</Label>
                    <Input
                      id="origen"
                      type="text"
                      placeholder="Dirección de origen"
                      value={formData.origen}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          origen: e.target.value,
                        }))
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
                        setFormData((prev) => ({
                          ...prev,
                          destino: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_labor">Tipo de Labor *</Label>
                    <Select
                      value={formData.tipo_labor}
                      onValueChange={(value: TipoLabor) =>
                        setFormData((prev) => ({
                          ...prev,
                          tipo_labor: value,
                        }))
                      }
                      required
                    >
                      <SelectTrigger id="tipo_labor" className="w-full">
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
                    <Label htmlFor="estado">Prioridad *</Label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value: Prioridad) =>
                        setFormData((prev) => ({
                          ...prev,
                          prioridad: value,
                        }))
                      }
                    >
                      <SelectTrigger id="prioridad" className="w-full">
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
                  <Label htmlFor="cantidad_pasajeros">Cantidad Pasajeros</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.cantidad_pasajeros ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cantidad_pasajeros:
                          e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-1/2"
      
                  ></Input>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipo">Carga o Equipo a Transportar</Label>
                  <Textarea
                    id="equipo"
                    placeholder="Describa la carga o equipo a transportar"
                    value={formData.equipo_o_carga}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        equipo_o_carga: e.target.value,
                      }))
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
                      setFormData((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="register"
                  //onClick={() => router.back()}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Registrar Solicitud
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
