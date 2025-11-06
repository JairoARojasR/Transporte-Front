"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerVehiculoPorRegistroInspeccion,
  type Vehiculo
} from "@/lib/vehiculos/vehiculoApi";

import {
  
} from "@/lib/solicitud/solicitudApi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalleSolicitud ({ params }: PageProps){
const router = useRouter();
const [solicitud, setSolicitud] = useEffect<>([])
}