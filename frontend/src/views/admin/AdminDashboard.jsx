// frontend/src/views/admin/AdminDashboard.jsx

import { BookOpen, FileText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi } from "../../api";
import { StatCard } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.getAdmin();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error("Error al cargar el dashboard");
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
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema académico
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Estudiantes"
          value={stats?.estadisticas?.estudiantes?.total || 0}
          subtitle={`${stats?.estadisticas?.estudiantes?.activos || 0} activos`}
          color="blue"
        />

        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Profesores"
          value={stats?.estadisticas?.profesores?.total || 0}
          subtitle={`${stats?.estadisticas?.profesores?.activos || 0} activos`}
          color="green"
        />

        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Asignaturas"
          value={stats?.estadisticas?.asignaturas?.total || 0}
          subtitle={`${stats?.estadisticas?.asignaturas?.activas || 0} activas`}
          color="purple"
        />

        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Matrículas"
          value={stats?.estadisticas?.matriculas?.total || 0}
          subtitle={`${stats?.estadisticas?.matriculas?.activas || 0} activas`}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendimiento Académico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Rendimiento Académico
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Promedio General</span>
              <span className="text-3xl font-bold text-blue-600">
                {stats?.estadisticas?.academico?.promedio_general || "0.0"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Asistencia General</span>
              <span className="text-3xl font-bold text-green-600">
                {stats?.estadisticas?.academico?.porcentaje_asistencia || "0"}%
              </span>
            </div>
          </div>
        </div>

        {/* Período Activo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Período Académico Activo
          </h3>

          {stats?.periodo_activo ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Período</p>
                <p className="text-xl font-semibold text-gray-800">
                  {stats.periodo_activo.nombre}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inicio</p>
                  <p className="font-medium text-gray-800">
                    {new Date(
                      stats.periodo_activo.fecha_inicio
                    ).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Término</p>
                  <p className="font-medium text-gray-800">
                    {new Date(
                      stats.periodo_activo.fecha_termino
                    ).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Asignaturas activas
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats?.estadisticas?.asignaturas?.periodo_actual || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay período activo</p>
            </div>
          )}
        </div>
      </div>

      {/* Últimas Matrículas */}
      {stats?.ultimas_matriculas && stats.ultimas_matriculas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Últimas Matrículas
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Curso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sección
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.ultimas_matriculas.map((matricula, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {matricula.estudiante}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {matricula.curso}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {matricula.seccion}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(matricula.fecha).toLocaleDateString("es-CL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribución por Estado */}
      {stats?.estudiantes_por_estado &&
        stats.estudiantes_por_estado.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Estudiantes por Estado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.estudiantes_por_estado.map((estado, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{estado.estado}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {estado.total}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
