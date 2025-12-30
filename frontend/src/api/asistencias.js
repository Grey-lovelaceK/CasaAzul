// frontend/src/api/asistencias.js

import { apiClient } from "./config";

export const asistenciasApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/asistencias${queryString ? `?${queryString}` : ""}`
    );
  },

  create: async (data) => {
    return await apiClient.post("/asistencias", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/asistencias/${id}`, data);
  },

  tomarMasivo: async (data) => {
    return await apiClient.post("/asistencias/tomar-masivo", data);
  },

  getPorAsignatura: async (idAsignatura, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/asistencias/asignatura/${idAsignatura}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  getListaEstudiantes: async (idAsignatura, fecha) => {
    return await apiClient.get(
      `/asistencias/asignatura/${idAsignatura}/lista-estudiantes?fecha=${fecha}`
    );
  },

  eliminarPorFecha: async (idAsignatura, fecha) => {
    return await apiClient.delete("/asistencias/eliminar-fecha", {
      id_asignatura: idAsignatura,
      fecha: fecha,
    });
  },

  getEstadisticas: async (idAsignatura) => {
    return await apiClient.get(
      `/asistencias/asignatura/${idAsignatura}/estadisticas`
    );
  },
};
