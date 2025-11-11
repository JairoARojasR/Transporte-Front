"use client";

import { useEffect, useState } from "react";
import {
  obtenerMisSolicitudesConductor,
  editarSolicitudPorId,
  type Solicitud,
  type Estado,
} from "@/lib/solicitud/solicitudApi";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";
import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
  ObtenerTipoLaborLabel,
} from "@/componentsux/estadoVehiculo";

const ESTADOS: { value: Estado; label: string }[] = [
  { value: "asignada", label: "Asignadas" },
  { value: "aceptada", label: "Aceptadas" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "finalizada", label: "Finalizadas" },
  { value: "cancelada", label: "Canceladas" },
  { value: "en_reasignacion", label: "En Reasignación" },
];

export default function MisSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("asignada");

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const solicitudData = await obtenerMisSolicitudesConductor();
        console.log("info solicitud", solicitudData);
        setSolicitudes(solicitudData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Error al cargar datos"
        );
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const getSolicitudesByEstado = (estado: Estado) => {
    return solicitudes.filter((s) => s.estado === estado);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando tus solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-4xl bg-gradient-to-br from-slate-50 to-blue-50">
      <h1 className="text-2xl text-blue-900 font-bold">Mis solicitudes</h1>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Estado)}>
        <TabsList>
          {ESTADOS.map((estado) => {
            const count = getSolicitudesByEstado(estado.value).length;
            return (
              <TabsTrigger key={estado.value} value={estado.value}>
                <span>{estado.label}</span>
                <Badge
                  variant={
                    count > 0 ? "badgeCantidadEstado" : "badgeSinCantidadEstado"
                  }
                >
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ESTADOS.map((estado) => {
          const solicitudesEstado = getSolicitudesByEstado(estado.value);
          return (
            <TabsContent key={estado.value} value={estado.value}></TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
