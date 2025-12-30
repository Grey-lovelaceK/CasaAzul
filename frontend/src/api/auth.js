// frontend/src/api/auth.js

import { apiClient } from "./config";

export const authApi = {
  login: async (username, password) => {
    return await apiClient.post("/login", { username, password });
  },

  logout: async () => {
    return await apiClient.post("/logout");
  },

  me: async () => {
    return await apiClient.get("/me");
  },

  changePassword: async (currentPassword, newPassword) => {
    return await apiClient.post("/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  },

  refreshToken: async () => {
    return await apiClient.post("/refresh");
  },
};
