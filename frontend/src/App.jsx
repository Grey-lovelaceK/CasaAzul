// frontend/src/App.jsx
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminAsignaturas } from "./views/admin/AdminAsignaturas";
import { AdminCursos } from "./views/admin/AdminCursos";
import { AdminDashboard } from "./views/admin/AdminDashboard";
import { AdminEstudiantes } from "./views/admin/AdminEstudiantes";
import { AdminMatriculas } from "./views/admin/AdminMatriculas";
import { AdminPeriodos } from "./views/admin/AdminPeriodos";
import { AdminProfesores } from "./views/admin/AdminProfesores";
import { AdminReportes } from "./views/admin/AdminReportes";
import { AdminUsuarios } from "./views/admin/AdminUsuarios";
import { Login } from "./views/auth/Login";
// Profesor views
import { ProfesorAsignaturas } from "./views/profesor/ProfesorAsignaturas";
import { ProfesorAsistencia } from "./views/profesor/ProfesorAsistencia";
import { ProfesorDashboard } from "./views/profesor/ProfesorDashboard";
import { ProfesorNotas } from "./views/profesor/ProfesorNotas";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (
    roles.length > 0 &&
    !roles.includes(user?.rol?.nombre) &&
    !roles.includes(user?.id_rol)
  )
    return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.rol?.nombre === "Administrador" || user?.id_rol === 1;
  const isProfesor = user?.rol?.nombre === "Profesor" || user?.id_rol === 2;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rutas Admin */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={isAdmin ? <AdminDashboard /> : <ProfesorDashboard />}
        />

        {/* Solo Admin */}
        <Route
          path="periodos"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminPeriodos />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminCursos />
            </ProtectedRoute>
          }
        />
        <Route
          path="estudiantes"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminEstudiantes />
            </ProtectedRoute>
          }
        />
        <Route
          path="profesores"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminProfesores />
            </ProtectedRoute>
          }
        />
        <Route
          path="asignaturas"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminAsignaturas />
            </ProtectedRoute>
          }
        />
        <Route
          path="matriculas"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminMatriculas />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute roles={[1, "Administrador"]}>
              <AdminReportes />
            </ProtectedRoute>
          }
        />

        {/* Rutas Profesor */}
        <Route
          path="profesor/dashboard"
          element={
            <ProtectedRoute roles={[2, "Profesor"]}>
              <ProfesorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profesor/asignaturas"
          element={
            <ProtectedRoute roles={[2, "Profesor"]}>
              <ProfesorAsignaturas />
            </ProtectedRoute>
          }
        />
        <Route
          path="profesor/asistencia"
          element={
            <ProtectedRoute roles={[2, "Profesor"]}>
              <ProfesorAsistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="profesor/notas"
          element={
            <ProtectedRoute roles={[2, "Profesor"]}>
              <ProfesorNotas />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
