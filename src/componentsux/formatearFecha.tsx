import { format } from "date-fns";
import dayjs from "dayjs";
import { es } from "date-fns/locale";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "N/A";
  return format(dayjs.utc(fecha).endOf("day").toDate(), "PPP", {
    locale: es,
  });
};

 export const formatearHora = (hora?: string | null) => {
    if (!hora) return "N/A";
    const horas = new Date(hora);
    return horas.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  export const formatearDuracion = (segundos: number): string => {
    if (!segundos && segundos !== 0) return "N/A";

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    const partes = [];

    if (horas > 0) partes.push(`${horas} hora${horas > 1 ? "s" : ""}`);
    if (minutos > 0) partes.push(`${minutos} minuto${minutos > 1 ? "s" : ""}`);
    if (segs > 0) partes.push(`${segs} segundo${segs > 1 ? "s" : ""}`);

    return partes.join(" ");
  };