// frontend/src/api/profesores.js

import { apiClient } from "./config";

export const profesoresApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/profesores${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/profesores/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/profesores", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/profesores/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/profesores/${id}`);
  },

  getAsignaturas: async (id) => {
    return await apiClient.get(`/profesores/${id}/asignaturas`);
  },
};
