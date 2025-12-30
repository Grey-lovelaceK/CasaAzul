// frontend/src/utils/formatters.js

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Formatear fecha
export const formatDate = (date, formatStr = "dd/MM/yyyy") => {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    return "-";
  }
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

// Formatear RUT chileno
export const formatRut = (rut) => {
  if (!rut) return "";

  // Limpiar el RUT
  const cleaned = rut.replace(/[^0-9kK]/g, "");

  if (cleaned.length < 2) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();

  // Formatear con puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${dv}`;
};

// Validar RUT chileno
export const validateRut = (rut) => {
  if (!rut) return false;

  const cleaned = rut.replace(/[^0-9kK]/g, "");
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const dvValue =
    expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();

  return dv === dvValue;
};

// Formatear nota (1 decimal)
export const formatNota = (nota) => {
  if (!nota && nota !== 0) return "-";
  return Number(nota).toFixed(1);
};

// Formatear porcentaje
export const formatPercentage = (value) => {
  if (!value && value !== 0) return "-";
  return `${Number(value).toFixed(1)}%`;
};

// Formatear nombre completo
export const formatFullName = (nombres, apellidoPaterno, apellidoMaterno) => {
  return `${nombres} ${apellidoPaterno} ${apellidoMaterno || ""}`.trim();
};

// Formatear teléfono chileno
export const formatPhone = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 9) {
    return `+56 9 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }

  return phone;
};

// Obtener iniciales
export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
