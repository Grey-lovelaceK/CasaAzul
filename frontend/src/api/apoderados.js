// frontend/src/api/apoderados.js

import { apiClient } from "./config";

export const apoderadosApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/apoderados${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/apoderados/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/apoderados", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/apoderados/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/apoderados/${id}`);
  },

  // Asignar apoderado a estudiante
  asignarEstudiante: async (idApoderado, data) => {
    return await apiClient.post(
      `/apoderados/${idApoderado}/asignar-estudiante`,
      data
    );
  },

  // Desasignar apoderado de estudiante
  desasignarEstudiante: async (idApoderado, data) => {
    return await apiClient.post(
      `/apoderados/${idApoderado}/desasignar-estudiante`,
      data
    );
  },
};
