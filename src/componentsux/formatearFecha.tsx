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