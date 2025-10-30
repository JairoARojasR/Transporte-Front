"use client";

import type React from "react"; //importante para el handle
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
  type TipoConductor,
  type TipoVehiculo,
  type ConductorAsignado,
} from "@/lib/vehiculos/vehiculoApi";
import { Loader2 } from "lucide-react";

export default function RegistroPreoperacionalPage() {
  const router = useRouter(); //rutas
  const [isLoading, setIsLoading] = useState(false); //carga bd
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [conductoresDisponibles, setConductoresDisponibles] = useState<
    ConductorAsignado[]
  >([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

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
        console.log("info vehiculos", data);
        setVehiculos(data);
      } catch (error) {
        console.error("Error fetching vehiculos: ", error);
        toast.error("Error al cargar la lista de vehiculos");
      } finally {
        setLoadingVehiculos(false);
      }
    };
    cargarVehiculos();
  }, []);

  //handleVehiculoChange
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
            <div>
              <div>
                <Label htmlFor="vehiculo">Vehículo *</Label>
                <Select
                  value={formData.placa_vehiculo}
                  onValueChange={handleVehiculoChange}
                  required
                >
                    

                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
