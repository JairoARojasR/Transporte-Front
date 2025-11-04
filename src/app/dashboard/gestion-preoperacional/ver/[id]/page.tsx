"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerVehiculoPorPlaca,
  type Vehiculo,
} from "@/lib/vehiculos/vehiculoApi";
import {
  obtenerRegistroPreoperacional,
  type Preoperacional,
} from "@/lib/preoperacional/preoperacional";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Truck,
  Gauge,
  Users,
  Calendar,
  Pencil,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalleInspeccionPreoperacional({ params }: PageProps) {
  const router = useRouter();
  const [preoperacional, setPreoperacional] = useState<Preoperacional | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const idParam = Array.isArray(resolvedParams.id)
          ? resolvedParams.id[0]
          : resolvedParams.id;
        setId(idParam);

        const preoperacionalData = await obtenerRegistroPreoperacional(idParam);
        console.log("info", preoperacionalData);

        if (preoperacionalData && preoperacionalData.length > 0) {
          setPreoperacional(preoperacionalData[0]);
        } else {
          setError("Vehículo no encontrado");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando detalle.</p>
        </div>
      </div>
    );
  }

  if (error || !preoperacional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 text-center mb-4">
            {error || "Vehículo no encontrado"}
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Detalle del Vehículo
              </h1>
              <p className="text-slate-600">
                Información completa inspección preoperacional del conductor{" "}
                {preoperacional.usuario?.nombre}
              </p>
            </div>
            {/* <Link href={`/dashboard/gestion-vehiculos/editarv/${vehiculo.placa}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Pencil className="w-4 h-4 mr-2" />
                Editar Vehículo
              </Button>
            </Link> */}
          </div>
        </div>

        <Card>
            <div>
                <div>
                    <Truck></Truck>
                    {preoperacional.placa_vehiculo}
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
