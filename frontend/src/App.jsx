// frontend/src/App.jsx

import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { adminMenuItems } from "./routes/AdminRoutes";
import { profesorMenuItems } from "./routes/ProfesorRoutes";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// Layout Components
import { Header } from "./components/common/Header";
import { Loading } from "./components/common/Loading";
import { Sidebar } from "./components/common/Sidebar";

// Views
import { Login } from "./views/Login";

// Admin Views (importaremos después)
import { AdminAsignaturas } from "./views/admin/AdminAsignaturas";
import { AdminDashboard } from "./views/admin/AdminDashboard";
import { AdminEstudiantes } from "./views/admin/AdminEstudiantes";
import { AdminMatriculas } from "./views/admin/AdminMatriculas";
import { AdminProfesores } from "./views/admin/AdminProfesores";
import { AdminReportes } from "./views/admin/AdminReportes";

// Profesor Views (importaremos después)
import { ProfesorAsignaturas } from "./views/profesor/ProfesorAsignaturas";
import { ProfesorAsistencia } from "./views/profesor/ProfesorAsistencia";
import { ProfesorDashboard } from "./views/profesor/ProfesorDashboard";
import { ProfesorEstudiantes } from "./views/profesor/ProfesorEstudiantes";
import { ProfesorNotas } from "./views/profesor/ProfesorNotas";

// Layout con Sidebar
const MainLayout = ({ children, menuItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        menuItems={menuItems}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Página no autorizada
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800">403</h1>
      <p className="text-xl text-gray-600 mt-4">
        No tienes permisos para acceder a esta página
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Volver
      </button>
    </div>
  </div>
);

// Componente principal
function App() {
  const { isAuthenticated, loading, isAdmin, isProfesor } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Cargando aplicación..." />;
  }

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Rutas del Administrador */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/estudiantes"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminEstudiantes />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesores"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminProfesores />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/asignaturas"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminAsignaturas />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/matriculas"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminMatriculas />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute allowedRoles={["Administrador"]}>
            <MainLayout menuItems={adminMenuItems}>
              <AdminReportes />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas del Profesor */}
      <Route
        path="/profesor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Profesor"]}>
            <MainLayout menuItems={profesorMenuItems}>
              <ProfesorDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesor/asignaturas"
        element={
          <ProtectedRoute allowedRoles={["Profesor"]}>
            <MainLayout menuItems={profesorMenuItems}>
              <ProfesorAsignaturas />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesor/asistencia"
        element={
          <ProtectedRoute allowedRoles={["Profesor"]}>
            <MainLayout menuItems={profesorMenuItems}>
              <ProfesorAsistencia />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesor/notas"
        element={
          <ProtectedRoute allowedRoles={["Profesor"]}>
            <MainLayout menuItems={profesorMenuItems}>
              <ProfesorNotas />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesor/estudiantes"
        element={
          <ProtectedRoute allowedRoles={["Profesor"]}>
            <MainLayout menuItems={profesorMenuItems}>
              <ProfesorEstudiantes />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Rutas especiales */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Redirección por defecto */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin() ? (
              <Navigate to="/dashboard" replace />
            ) : isProfesor() ? (
              <Navigate to="/profesor/dashboard" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800">404</h1>
              <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
              <button
                onClick={() => window.history.back()}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Volver
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
