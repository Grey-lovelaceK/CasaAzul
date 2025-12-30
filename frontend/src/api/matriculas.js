// frontend/src/api/matriculas.js

import { apiClient } from "./config";

export const matriculasApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiClient.get(
      `/matriculas${queryString ? `?${queryString}` : ""}`
    );
  },

  create: async (data) => {
    return await apiClient.post("/matriculas", data);
  },

  matricularEnCurso: async (data) => {
    return await apiClient.post("/matriculas/matricular-curso", data);
  },

  retirarDeCurso: async (data) => {
    return await apiClient.post("/matriculas/retirar-curso", data);
  },

  getAsignaturasDisponibles: async (idCurso, idPeriodo) => {
    return await apiClient.get(
      `/matriculas/asignaturas-disponibles?id_curso=${idCurso}&id_periodo=${idPeriodo}`
    );
  },

  update: async (id, data) => {
    return await apiClient.put(`/matriculas/${id}`, data);
  },

  delete: async (id) => {
    return await apiClient.delete(`/matriculas/${id}`);
  },
};
