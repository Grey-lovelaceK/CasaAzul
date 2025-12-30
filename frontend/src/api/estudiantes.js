// frontend/src/api/estudiantes.js

import { apiClient } from "./config";

export const estudiantesApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/estudiantes${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/estudiantes/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/estudiantes", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/estudiantes/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/estudiantes/${id}`);
  },

  getNotas: async (id) => {
    return await apiClient.get(`/estudiantes/${id}/notas`);
  },

  getAsistencias: async (id) => {
    return await apiClient.get(`/estudiantes/${id}/asistencias`);
  },

  getHistorial: async (id) => {
    return await apiClient.get(`/estudiantes/${id}/historial`);
  },
};
