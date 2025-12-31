// frontend/src/api/usuarios.js
import api from "./__config";

export const usuariosApi = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.request(`/usuarios${queryString ? `?${queryString}` : ""}`);
  },

  getById: async (id) => {
    return api.request(`/usuarios/${id}`);
  },

  create: async (data) => {
    return api.request("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return api.request(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return api.request(`/usuarios/${id}`, {
      method: "DELETE",
    });
  },

  cambiarPassword: async (id, password) => {
    return api.request(`/usuarios/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password, password_confirmation: password }),
    });
  },
};

export default usuariosApi;
