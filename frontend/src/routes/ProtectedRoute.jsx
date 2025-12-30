// frontend/src/routes/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { Loading } from "../components/common/Loading";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Verificando acceso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
