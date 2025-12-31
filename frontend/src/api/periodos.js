// frontend/src/api/periodos.js

import { apiClient } from "./config";

export const periodosApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/periodos${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/periodos/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/periodos", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/periodos/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/periodos/${id}`);
  },

  // Activar un período (desactiva los demás)
  activar: async (id) => {
    return await apiClient.post(`/periodos/${id}/activar`);
  },

  // Obtener el período activo
  getActivo: async () => {
    return await apiClient.get("/periodos/activo");
  },
};
