// frontend/src/utils/constants.js

// Roles de usuario
export const ROLES = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  ESTUDIANTE: "Estudiante",
};

// Estados
export const ESTADOS = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  MATRICULADO: "Matriculado",
  RETIRADO: "Retirado",
};

// Niveles educativos
export const NIVELES = {
  1: "Primero Básico",
  2: "Segundo Básico",
  3: "Tercero Básico",
  4: "Cuarto Básico",
  5: "Quinto Básico",
  6: "Sexto Básico",
  7: "Séptimo Básico",
  8: "Octavo Básico",
  9: "Primero Medio",
  10: "Segundo Medio",
  11: "Tercero Medio",
  12: "Cuarto Medio",
};

// Escala de notas
export const ESCALA_NOTAS = {
  MIN: 1.0,
  MAX: 7.0,
  APROBACION: 4.0,
};

// Porcentaje mínimo de asistencia
export const MIN_ASISTENCIA = 75;

// Colores de estados
export const ESTADO_COLORS = {
  Activo: "bg-green-100 text-green-700",
  Inactivo: "bg-gray-100 text-gray-700",
  Matriculado: "bg-blue-100 text-blue-700",
  Retirado: "bg-red-100 text-red-700",
  Aprobado: "bg-green-100 text-green-700",
  Reprobado: "bg-red-100 text-red-700",
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK: "Error de conexión. Verifica tu conexión a internet.",
  UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
  NOT_FOUND: "El recurso solicitado no existe.",
  SERVER_ERROR: "Error del servidor. Intenta nuevamente.",
  VALIDATION: "Por favor verifica los datos ingresados.",
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
};
