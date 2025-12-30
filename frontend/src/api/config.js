// frontend/src/api/config.js

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Cliente HTTP base
class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  getToken() {
    return localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la petición");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
