// frontend/src/api/__config.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const getToken = () => localStorage.getItem("token");

const api = {
  request: async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return {
          success: false,
          message: data.message || data.error || "Error en la solicitud",
          errors: data.errors || {},
          status: response.status,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || "Operación exitosa",
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        message: error.message || "Error de conexión con el servidor",
        errors: {},
      };
    }
  },

  get: (endpoint) => api.request(endpoint, { method: "GET" }),
  post: (endpoint, data) =>
    api.request(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    api.request(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint) => api.request(endpoint, { method: "DELETE" }),
};

export default api;
