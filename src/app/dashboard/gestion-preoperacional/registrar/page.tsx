"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  registrarPreoperacional,
  type Preoperacional,
  type Estado,
  type Combustible,
} from "@/lib/preoperacional/preoperacional";
import {
  obtenerVehiculos,
  type Vehiculo,
  type ConductorAsignado,
} from "@/lib/vehiculos/vehiculoApi";
import { Loader2 } from "lucide-react";

export default function RegistroPreoperacionalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductoresDisponibles, setConductoresDisponibles] = 
  useState<ConductorAsignado[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);

  const [formData, setFormData] = useState<Preoperacional>({
    placa_vehiculo: "",
    cedula_conductor: 0,
    fecha: new Date().toISOString().split("T")[0],
    descanso_adecuando: false,
    consumo_alcohol: false,
    medicamentos_que_afecten_conduccion: false,
    condiciones_fisicas_mentales: false,
    soat_vigente: false,
    tecnico_mecanica: false,
    estado_llantas: "bueno",
    estado_luces: "bueno",
    estado_frenos: "bueno",
    nivel_combustible: "lleno",
    observaciones: "",
  });

  useEffect(() => {
    const cargarVehiculos = async () => {
      try {
        const data = await obtenerVehiculos();
        setVehiculos(data);
      } catch (error) {
        console.error("Error fetching vehiculos:", error);
        toast.error("Error al cargar la lista de vehiculos");
      } finally {
        setLoadingVehiculos(false);
      }
    };
    cargarVehiculos();
  }, []);

  const handleVehiculoChange = (placa: string) => {
    setFormData((prev) => ({
      ...prev,
      placa_vehiculo: placa,
      cedula_conductor: 0,
    }));

    const vehiculoSeleccionado = vehiculos.find((v) => v.placa === placa);
    if (vehiculoSeleccionado) {
      setConductoresDisponibles(vehiculoSeleccionado.conductores || []);
    } else {
      setConductoresDisponibles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.placa_vehiculo) {
      toast.warning("Debe seleccionar un vehículo");
      return;
    }

    if (!formData.cedula_conductor || formData.cedula_conductor === 0) {
      toast.warning("Debe seleccionar un conductor");
      return;
    }

    setIsLoading(true);
    try {
      await registrarPreoperacional(formData);
      toast.success("Registro preoperacional creado exitosamente");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error al crear el registro");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingVehiculos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Registro Preoperacional</CardTitle>
          <CardDescription>
            Complete el formulario de inspección preoperacional del vehículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vehiculo">Vehículo *</Label>
                <Select
                  value={formData.placa_vehiculo}
                  onValueChange={handleVehiculoChange}
                  required
                >
                  <SelectTrigger id="vehiculo" className="w-full">
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
                  value={
                    formData.cedula_conductor && formData.cedula_conductor !== 0
                      ? formData.cedula_conductor.toString()
                      : undefined
                  }
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      cedula_conductor: Number.parseInt(value),
                    }))
                  }
                  disabled={
                    !formData.placa_vehiculo ||
                    conductoresDisponibles.length === 0
                  }
                  required
                >
                  <SelectTrigger id="conductor" className="w-full">
                    <SelectValue placeholder="Seleccione un conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {conductoresDisponibles.map((conductor) => (
                      <SelectItem
                        key={conductor.cedula_conductor}
                        value={conductor.cedula_conductor.toString()}
                      >
                        {conductor.usuario?.nombre ||
                          conductor.cedula_conductor}{" "}
                        ({conductor.tipo_conductor})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fecha: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Estado de salud */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Estado de Salud del Conductor
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>¿Tuvo descanso adecuado (mínimo 8 horas)? *</Label>
                  <RadioGroup
                    value={formData.descanso_adecuando ? "si" : "no"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        descanso_adecuando: value === "si",
                      }))
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="descanso-si" />
                        <Label
                          htmlFor="descanso-si"
                          className="font-normal cursor-pointer"
                        >
                          Sí
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="descanso-no" />
                        <Label
                          htmlFor="descanso-no"
                          className="font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Ha consumido alcohol en las últimas 24 horas? *
                  </Label>
                  <RadioGroup
                    value={formData.consumo_alcohol ? "si" : "no"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        consumo_alcohol: value === "si",
                      }))
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="alcohol-si" />
                        <Label
                          htmlFor="alcohol-si"
                          className="font-normal cursor-pointer"
                        >
                          Sí
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="alcohol-no" />
                        <Label
                          htmlFor="alcohol-no"
                          className="font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Está tomando medicamentos que afecten la conducción? *
                  </Label>
                  <RadioGroup
                    value={
                      formData.medicamentos_que_afecten_conduccion ? "si" : "no"
                    }
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        medicamentos_que_afecten_conduccion: value === "si",
                      }))
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="medicamentos-si" />
                        <Label
                          htmlFor="medicamentos-si"
                          className="font-normal cursor-pointer"
                        >
                          Sí
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="medicamentos-no" />
                        <Label
                          htmlFor="medicamentos-no"
                          className="font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    ¿Se encuentra en condiciones físicas y mentales para
                    conducir? *
                  </Label>
                  <RadioGroup
                    value={formData.condiciones_fisicas_mentales ? "si" : "no"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        condiciones_fisicas_mentales: value === "si",
                      }))
                    }
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="condiciones-si" />
                        <Label
                          htmlFor="condiciones-si"
                          className="font-normal cursor-pointer"
                        >
                          Sí
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="condiciones-no" />
                        <Label
                          htmlFor="condiciones-no"
                          className="font-normal cursor-pointer"
                        >
                          No
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Chequeo preventivo del vehículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Chequeo Preventivo del Vehículo
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soat"
                    checked={formData.soat_vigente}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        soat_vigente: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="soat" className="font-normal cursor-pointer">
                    SOAT vigente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tecnicomecanica"
                    checked={formData.tecnico_mecanica}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        tecnico_mecanica: checked as boolean,
                      }))
                    }
                  />
                  <Label
                    htmlFor="tecnicomecanica"
                    className="font-normal cursor-pointer"
                  >
                    Revisión técnico-mecánica vigente
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado-llantas">
                    Estado de las llantas *
                  </Label>
                  <Select
                    value={formData.estado_llantas}
                    onValueChange={(value: Estado) =>
                      setFormData((prev) => ({
                        ...prev,
                        estado_llantas: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger id="estado-llantas" className="w-2xs">
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="malo">Malo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado-frenos">Estado de los frenos *</Label>
                  <Select
                    value={formData.estado_frenos}
                    onValueChange={(value: Estado) =>
                      setFormData((prev) => ({ ...prev, estado_frenos: value }))
                    }
                    required
                  >
                    <SelectTrigger id="estado-frenos" className="w-2xs">
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="malo">Malo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado-luces">Estado de las luces *</Label>
                  <Select
                    value={formData.estado_luces}
                    onValueChange={(value: Estado) =>
                      setFormData((prev) => ({ ...prev, estado_luces: value }))
                    }
                    required
                  >
                    <SelectTrigger id="estado-luces" className="w-2xs">
                      <SelectValue placeholder="Seleccione el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="malo">Malo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel-combustible">
                    Nivel de combustible *
                  </Label>
                  <Select
                    value={formData.nivel_combustible}
                    onValueChange={(value: Combustible) =>
                      setFormData((prev) => ({
                        ...prev,
                        nivel_combustible: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger id="nivel-combustible" className="w-2xs">
                      <SelectValue placeholder="Seleccione el nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lleno">Lleno</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Ingrese observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button variant={"register"} type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Preoperacional
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
