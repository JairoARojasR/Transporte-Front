"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerVehiculoPorPlaca, Vehiculo } from "@/lib/vehiculos/vehiculoApi";
import { Badge } from "@/components/ui/badge";

export default function VehiculoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const placa = Array.isArray(params.placa) ? params.placa[0] : params.placa;

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placa) return;

    async function cargarVehiculo() {
      try {
        const data = await obtenerVehiculoPorPlaca(placa!);
        console.log("Vehiculo cargado:", data);
        setVehiculo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el vehículo");
      } finally {
        setLoading(false);
      }
    }

    cargarVehiculo();
  }, [placa]);

  if (loading) return <p>Cargando vehículo...</p>;
  if (error) return <p>{error}</p>;
  if (!vehiculo) return <p>No se encontró el vehículo.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalles del vehículo {vehiculo.placa}</h1>

      <p><strong>Tipo:</strong> {vehiculo.tipo_vehiculo}</p>
      <p><strong>Capacidad:</strong> {vehiculo.capacidad}</p>
      <p><strong>Odómetro:</strong> {vehiculo.odometro} km</p>
      <p><strong>Estado:</strong> {vehiculo.estado}</p>
      <p><strong>Último mantenimiento:</strong> {vehiculo.fecha_ultimo_mantenimiento}</p>

      <h2 className="mt-4 font-semibold">Conductores</h2>
      {/* <ul className="list-disc ml-6">
        {vehiculo.conductor.map((c) => (
          <li key={c.cedula_conductor}>
            {c.usuario.nombre} ({c.tipo_conductor})
          </li>
        ))}
      </ul> */}
    </div>
  );
}
