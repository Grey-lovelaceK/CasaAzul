// frontend/src/api/dashboard.js

import { apiClient } from "./config";

export const dashboardApi = {
  getAdmin: async () => {
    return await apiClient.get("/dashboard/admin");
  },

  getProfesor: async () => {
    return await apiClient.get("/dashboard/profesor");
  },

  getEstados: async (tipo) => {
    return await apiClient.get(`/dashboard/estados/${tipo}`);
  },

  getRoles: async () => {
    return await apiClient.get("/dashboard/roles");
  },

  getPeriodos: async () => {
    return await apiClient.get("/dashboard/periodos");
  },
};
