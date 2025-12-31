// frontend/src/api/catalogos.js

import { apiClient } from "./config";

export const catalogosApi = {
  // ===== NIVELES =====
  getNiveles: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/catalogos/niveles${queryString ? `?${queryString}` : ""}`
    );
  },

  getNivelDetalle: async (id) => {
    return await apiClient.get(`/catalogos/niveles/${id}`);
  },

  // ===== MATERIAS =====
  getMaterias: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/catalogos/materias${queryString ? `?${queryString}` : ""}`
    );
  },

  getMateriaDetalle: async (id) => {
    return await apiClient.get(`/catalogos/materias/${id}`);
  },

  createMateria: async (data) => {
    return await apiClient.post("/catalogos/materias", data);
  },

  // ===== PLAN DE ESTUDIOS =====
  getPlanEstudios: async () => {
    return await apiClient.get("/catalogos/plan-estudios");
  },

  agregarMateriaAPlan: async (data) => {
    return await apiClient.post("/catalogos/plan-estudios", data);
  },

  actualizarPlan: async (id, data) => {
    return await apiClient.put(`/catalogos/plan-estudios/${id}`, data);
  },

  eliminarDePlan: async (id) => {
    return await apiClient.delete(`/catalogos/plan-estudios/${id}`);
  },
};
