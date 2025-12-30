// frontend/src/context/AuthContext.jsx

import { createContext, useEffect, useState } from "react";
import { authApi } from "../api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password);

      if (response.success) {
        const { token: newToken, user: newUser } = response.data;

        setToken(newToken);
        setUser(newUser);

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error de conexión con el servidor",
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const updateUser = async () => {
    try {
      const response = await authApi.me();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const isAdmin = () => user?.rol === "Administrador";
  const isProfesor = () => user?.rol === "Profesor";
  const isEstudiante = () => user?.rol === "Estudiante";

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isAdmin,
    isProfesor,
    isEstudiante,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
