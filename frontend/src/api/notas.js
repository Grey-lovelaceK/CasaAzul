// frontend/src/api/notas.js

import { apiClient } from "./config";

export const notasApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(`/notas${queryString ? `?${queryString}` : ""}`);
  },

  create: async (data) => {
    return await apiClient.post("/notas", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/notas/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/notas/${id}`);
  },

  getPorAsignatura: async (idAsignatura) => {
    return await apiClient.get(`/notas/asignatura/${idAsignatura}`);
  },

  getPorEstudiante: async (idEstudiante) => {
    return await apiClient.get(`/notas/estudiante/${idEstudiante}`);
  },

  cargarMasivo: async (data) => {
    return await apiClient.post("/notas/cargar-masivo", data);
  },
};
