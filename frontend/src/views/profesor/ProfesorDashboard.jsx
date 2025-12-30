// frontend/src/views/profesor/ProfesorDashboard.jsx

import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  FileEdit,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "../../api";
import { Card, StatCard } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";

export const ProfesorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.getProfesor();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error("Error al cargar dashboard");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {stats?.profesor?.nombre}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Mis Asignaturas"
          value={stats?.estadisticas_generales?.total_asignaturas || 0}
          subtitle="Asignaturas activas"
          color="blue"
        />

        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Estudiantes"
          value={stats?.estadisticas_generales?.total_estudiantes || 0}
          subtitle="Total de estudiantes"
          color="green"
        />

        <StatCard
          icon={<FileEdit className="w-8 h-8" />}
          title="Notas Registradas"
          value={stats?.estadisticas_generales?.notas_registradas || 0}
          subtitle="Evaluaciones ingresadas"
          color="purple"
        />

        <StatCard
          icon={<ClipboardCheck className="w-8 h-8" />}
          title="Asistencias"
          value={stats?.estadisticas_generales?.asistencias_registradas || 0}
          subtitle="Registros de asistencia"
          color="orange"
        />
      </div>

      {/* Pendientes hoy */}
      {stats?.pendientes_hoy?.total > 0 && (
        <Card>
          <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Asistencias pendientes para hoy
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Tienes {stats.pendientes_hoy.total} asignatura(s) sin asistencia
                registrada
              </p>
              <div className="space-y-2">
                {stats.pendientes_hoy.asignaturas_sin_asistencia.map(
                  (asig, index) => (
                    <div key={index} className="text-sm text-yellow-800">
                      • {asig.curso.nombre} - Sección {asig.seccion}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Mis Asignaturas */}
      <Card title="Mis Asignaturas Activas">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.mis_asignaturas?.map((asignatura, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {asignatura.curso.nombre}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Sección {asignatura.seccion} • {asignatura.periodo.nombre}
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {asignatura.estado}
                </span>
              </div>

              {asignatura.horario && (
                <div className="text-sm text-gray-600 mb-2">
                  📅 {asignatura.horario}
                </div>
              )}

              {asignatura.sala && (
                <div className="text-sm text-gray-600 mb-3">
                  🚪 {asignatura.sala}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Estudiantes</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {asignatura.estadisticas.total_estudiantes}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cupos</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {asignatura.estadisticas.cupo_disponible}/
                    {asignatura.estadisticas.cupo_maximo}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notas</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {asignatura.estadisticas.total_notas_registradas}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clases</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {asignatura.estadisticas.clases_realizadas}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!stats?.mis_asignaturas || stats.mis_asignaturas.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes asignaturas asignadas</p>
          </div>
        )}
      </Card>
    </div>
  );
};
