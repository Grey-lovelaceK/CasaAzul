// frontend/src/api/asignaturas.js

import { apiClient } from "./config";

export const asignaturasApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/asignaturas${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/asignaturas/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/asignaturas", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/asignaturas/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/asignaturas/${id}`);
  },

  asignarProfesor: async (id, idProfesor, esTitular = true) => {
    return await apiClient.post(`/asignaturas/${id}/asignar-profesor`, {
      id_profesor: idProfesor,
      es_titular: esTitular,
    });
  },

  getEstudiantes: async (id) => {
    return await apiClient.get(`/asignaturas/${id}/estudiantes`);
  },
};
