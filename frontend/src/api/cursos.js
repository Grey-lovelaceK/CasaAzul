// frontend/src/api/cursos.js

import { apiClient } from "./config";

export const cursosApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/cursos${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id) => {
    return await apiClient.get(`/cursos/${id}`);
  },

  create: async (data) => {
    return await apiClient.post("/cursos", data);
  },

  update: async (id, data) => {
    return await apiClient.put(`/cursos/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/cursos/${id}`);
  },

  // Obtener estudiantes del curso
  getEstudiantes: async (id) => {
    return await apiClient.get(`/cursos/${id}/estudiantes`);
  },

  // Obtener asignaturas del curso
  getAsignaturas: async (id) => {
    return await apiClient.get(`/cursos/${id}/asignaturas`);
  },

  // Crear todos los cursos para un período
  crearCursosPeriodo: async (data) => {
    return await apiClient.post("/cursos/crear-periodo", data);
  },
};
