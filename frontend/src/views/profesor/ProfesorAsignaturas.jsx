// frontend/src/views/profesor/ProfesorAsignaturas.jsx

import {
  BookOpen,
  Calendar,
  FileText,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi, asistenciasApi } from "../../api";
import { Card, StatCard } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";

export const ProfesorAsignaturas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      const response = await asignaturasApi.getAll();
      if (response.success) {
        setAsignaturas(response.data.data || response.data);
      }
    } catch (error) {
      toast.error("Error al cargar asignaturas");
    } finally {
      setLoading(false);
    }
  };

  const loadDetalleAsignatura = async (asignatura) => {
    setSelectedAsignatura(asignatura);
    setLoadingDetalle(true);

    try {
      const [estudiantesRes, estadisticasRes] = await Promise.all([
        asignaturasApi.getEstudiantes(asignatura.id_asignatura),
        asistenciasApi.getEstadisticas(asignatura.id_asignatura),
      ]);

      if (estudiantesRes.success) {
        setEstudiantes(estudiantesRes.data.estudiantes);
      }

      if (estadisticasRes.success) {
        setEstadisticas(estadisticasRes.data.estadisticas);
      }
    } catch (error) {
      toast.error("Error al cargar detalle");
    } finally {
      setLoadingDetalle(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando asignaturas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mis Asignaturas</h1>
        <p className="text-gray-600 mt-1">Vista detallada de tus asignaturas</p>
      </div>

      {/* Lista de Asignaturas */}
      {!selectedAsignatura ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignaturas.map((asignatura) => (
            <Card
              key={asignatura.id_asignatura}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadDetalleAsignatura(asignatura)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {asignatura.estado?.nombre || "Activa"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {asignatura.curso?.nombre}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Sección {asignatura.seccion}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{asignatura.periodo?.nombre}</span>
                  </div>

                  {asignatura.horario && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{asignatura.horario}</span>
                    </div>
                  )}

                  {asignatura.sala && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{asignatura.sala}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estudiantes</span>
                    <span className="font-semibold text-gray-800">
                      {asignatura.cupo_maximo - asignatura.cupo_disponible}/
                      {asignatura.cupo_maximo}
                    </span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Ver Detalle
                </button>
              </div>
            </Card>
          ))}

          {asignaturas.length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No tienes asignaturas asignadas
              </h3>
              <p className="text-gray-600">
                Contacta al administrador para que te asigne asignaturas
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Detalle de Asignatura */
        <div className="space-y-6">
          {/* Botón Volver */}
          <button
            onClick={() => setSelectedAsignatura(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver a mis asignaturas
          </button>

          {/* Información de la Asignatura */}
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedAsignatura.curso?.nombre}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Sección {selectedAsignatura.seccion}</span>
                    <span>•</span>
                    <span>{selectedAsignatura.periodo?.nombre}</span>
                    {selectedAsignatura.horario && (
                      <>
                        <span>•</span>
                        <span>{selectedAsignatura.horario}</span>
                      </>
                    )}
                    {selectedAsignatura.sala && (
                      <>
                        <span>•</span>
                        <span>Sala {selectedAsignatura.sala}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  {selectedAsignatura.estado?.nombre || "Activa"}
                </span>
              </div>

              {/* Descripción del curso */}
              {selectedAsignatura.curso?.descripcion && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {selectedAsignatura.curso.descripcion}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {loadingDetalle ? (
            <Loading text="Cargando información..." />
          ) : (
            <>
              {/* Estadísticas */}
              {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Users className="w-8 h-8" />}
                    title="Estudiantes"
                    value={estadisticas.total_estudiantes}
                    subtitle={`de ${selectedAsignatura.cupo_maximo} cupos`}
                    color="blue"
                  />
                  <StatCard
                    icon={<Calendar className="w-8 h-8" />}
                    title="Clases Realizadas"
                    value={estadisticas.total_clases}
                    color="green"
                  />
                  <StatCard
                    icon={<TrendingUp className="w-8 h-8" />}
                    title="Asistencia General"
                    value={`${estadisticas.porcentaje_asistencia_global}%`}
                    color="purple"
                  />
                  <StatCard
                    icon={<FileText className="w-8 h-8" />}
                    title="Total Registros"
                    value={estadisticas.total_registros}
                    subtitle="asistencias"
                    color="orange"
                  />
                </div>
              )}

              {/* Lista de Estudiantes */}
              <Card title="Estudiantes Inscritos">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          RUT
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Promedio
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Asistencia
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estudiantes.map((est, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">
                              {est.estudiante?.nombre || "Sin nombre"}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {est.estudiante?.rut || "-"}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {est.estudiante?.email || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-lg font-bold ${
                                (est.promedio || 0) >= 4.0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {est.promedio ? est.promedio.toFixed(1) : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-lg font-bold ${
                                (est.asistencia || 0) >= 75
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {est.asistencia ? `${est.asistencia}%` : "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                est.estado === "Matriculado"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {est.estado || "Sin estado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {estudiantes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay estudiantes inscritos en esta asignatura</p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};
