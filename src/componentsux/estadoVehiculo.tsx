export const obtenerEstadoLabel = (estado?: string) => {
  switch (estado) {
    case "disponible":
      return "Disponible";
    case "no_disponible":
      return "No Disponible";
    case "asignado":
      return "Asignado";
    default:
      return "Desconocido";
  }
};

export const obtenerEstadoColor = (estado?: string) => {
  switch (estado) {
    case "disponible":
      return "bg-green-100 text-green-700 border-green-200";
    case "no_disponible":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "asignado":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const ObtenerPrioridadLabel = (prioridad?: string) => {
  switch (prioridad) {
    case "baja":
      return "Baja";
    case "media":
      return "Media";
    case "alta":
      return "Alta";
    default:
      return "Desconocido";
  }
};

export const obtenerPrioridadColor = (prioridad?: string) => {
  switch (prioridad) {
    case "baja":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "media":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "alta":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const ObtenerEstadoSolicitudLabel = (estado?: string) => {
  switch (estado) {
    case "pendiente":
      return "Pendiente";
    case "asignada":
      return "Asignada";
    case "aceptada":
      return "Aceptada";
    case "en_progreso":
      return "En Progreso";
      case "finalizada":
      return "Finalizada";
      case "cancelada":
      return "Cancelada";
      case "en_reasignacion":
      return "En Reasignación";
    default:
      return "Desconocido";
  }
};

export const obtenerEstadoSolicitudColor = (estado?: string) => {
  switch (estado) {
    case "pendiente":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "media":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "alta":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const obtenerTipoLabel = (tipo?: string) => {
  switch (tipo) {
    case "camion":
      return "Camión";
    case "camioneta":
      return "Camioneta";
    case "carrotanque":
      return "Carrotanque";
    case "retroexcavadora":
      return "Retroexcavadora";
    default:
      return "N/A";
  }
};
