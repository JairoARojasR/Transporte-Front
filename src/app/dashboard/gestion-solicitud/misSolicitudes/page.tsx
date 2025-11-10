"use client";

import { useEffect, useState } from "react";
import { obtenerMisSolicitudesConductor, type Solicitud } from "@/lib/solicitud/solicitudApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Utilidades que ya usas (ajusta import si las tienes en otra ruta)
import { formatearFecha, formatearHora } from "@/componentsux/formatearFecha";
import {
  ObtenerPrioridadLabel,
  obtenerPrioridadColor,
  ObtenerEstadoSolicitudLabel,
  obtenerEstadoSolicitudColor,
} from "@/componentsux/estadoVehiculo";

export default function MisSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await obtenerMisSolicitudesConductor();
        console.log("Solicitudes obtenidas:", data);
        setSolicitudes(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al cargar";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


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
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Mis Solicitudes Asignadas</h1>

        <Card className="overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4">Fecha/Hora</th>
                  <th className="text-left py-3 px-4">Ruta</th>
                  <th className="text-left py-3 px-4">Vehículo</th>
                  <th className="text-left py-3 px-4">Prioridad</th>
                  <th className="text-left py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id_solicitud} className="border-t">
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatearFecha(s.fecha)}</div>
                      <div className="text-sm text-muted-foreground">{formatearHora(s.hora)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{s.origen}</div>
                      <div className="text-sm text-muted-foreground">→ {s.destino}</div>
                    </td>
                    <td className="py-3 px-4">{s.placa_vehiculo ?? "Sin asignar"}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={obtenerPrioridadColor(s.prioridad)}>
                        {ObtenerPrioridadLabel(s.prioridad)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={obtenerEstadoSolicitudColor(s.estado)}>
                        {ObtenerEstadoSolicitudLabel(s.estado)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versión móvil simple */}
          <div className="md:hidden divide-y">
            {solicitudes.map((s) => (
              <div key={s.id_solicitud} className="p-4">
                <div className="flex justify-between">
                  <div className="font-semibold">{formatearFecha(s.fecha)} · {formatearHora(s.hora)}</div>
                  <Badge variant="outline" className={obtenerEstadoSolicitudColor(s.estado)}>
                    {ObtenerEstadoSolicitudLabel(s.estado)}
                  </Badge>
                </div>
                <div className="text-sm mt-1">
                  {s.origen} → {s.destino}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={obtenerPrioridadColor(s.prioridad)}>
                    {ObtenerPrioridadLabel(s.prioridad)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Vehículo: {s.placa_vehiculo ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
