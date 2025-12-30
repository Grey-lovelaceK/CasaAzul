// frontend/src/views/profesor/ProfesorEstudiantes.jsx

import { Search, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi } from "../../api";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { formatRut } from "../../utils/formatters";

export const ProfesorEstudiantes = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  useEffect(() => {
    if (selectedAsignatura) {
      loadEstudiantes();
    }
  }, [selectedAsignatura]);

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

  const loadEstudiantes = async () => {
    setLoadingEstudiantes(true);
    try {
      const response = await asignaturasApi.getEstudiantes(
        selectedAsignatura.id_asignatura
      );
      if (response.success) {
        setEstudiantes(response.data.estudiantes);
      }
    } catch (error) {
      toast.error("Error al cargar estudiantes");
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando información..." />;
  }

  const filteredEstudiantes = estudiantes.filter(
    (est) =>
      est.estudiante?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      est.estudiante?.rut?.includes(search)
  );

  // Calcular estadísticas
  const promedioGeneral =
    estudiantes.length > 0
      ? (
          estudiantes.reduce((sum, est) => sum + (est.promedio || 0), 0) /
          estudiantes.length
        ).toFixed(1)
      : "0.0";

  const asistenciaGeneral =
    estudiantes.length > 0
      ? (
          estudiantes.reduce((sum, est) => sum + (est.asistencia || 0), 0) /
          estudiantes.length
        ).toFixed(1)
      : "0.0";

  const aprobados = estudiantes.filter(
    (est) => (est.promedio || 0) >= 4.0
  ).length;
  const reprobados = estudiantes.length - aprobados;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Mis Estudiantes</h1>
        <p className="text-gray-600 mt-1">
          Vista consolidada de tus estudiantes por asignatura
        </p>
      </div>

      {/* Selección de Asignatura */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona una asignatura
        </label>
        <select
          value={selectedAsignatura?.id_asignatura || ""}
          onChange={(e) => {
            const asig = asignaturas.find(
              (a) => a.id_asignatura == e.target.value
            );
            setSelectedAsignatura(asig);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar asignatura...</option>
          {asignaturas.map((asig) => (
            <option key={asig.id_asignatura} value={asig.id_asignatura}>
              {asig.curso?.nombre} - Sección {asig.seccion} (
              {asig.periodo?.nombre})
            </option>
          ))}
        </select>
      </Card>

      {/* Contenido */}
      {selectedAsignatura && (
        <>
          {loadingEstudiantes ? (
            <Loading text="Cargando estudiantes..." />
          ) : (
            <>
              {/* Estadísticas Generales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Estudiantes</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {estudiantes.length}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      Promedio General
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        parseFloat(promedioGeneral) >= 4.0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {promedioGeneral}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Aprobados</p>
                      <p className="text-2xl font-bold text-green-600">
                        {aprobados}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-600" />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Reprobados</p>
                      <p className="text-2xl font-bold text-red-600">
                        {reprobados}
                      </p>
                    </div>
                    <TrendingDown className="w-10 h-10 text-red-600" />
                  </div>
                </Card>
              </div>

              {/* Búsqueda */}
              <Card>
                <Input
                  icon={Search}
                  placeholder="Buscar estudiante por nombre o RUT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Card>

              {/* Tabla de Estudiantes */}
              <Card
                title={`Estudiantes de ${selectedAsignatura.curso?.nombre} - Sección ${selectedAsignatura.seccion}`}
              >
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
                          Estado Académico
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEstudiantes.map((est, index) => {
                        const promedio = est.promedio || 0;
                        const asistencia = est.asistencia || 0;
                        const aprobado = promedio >= 4.0 && asistencia >= 75;

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {est.estudiante?.nombre || "Sin nombre"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-600">
                                {formatRut(est.estudiante?.rut) || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-600">
                                {est.estudiante?.email || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-2xl font-bold ${
                                    promedio >= 4.0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {promedio.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {promedio >= 4.0
                                    ? "✓ Aprobado"
                                    : "✗ Reprobado"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-2xl font-bold ${
                                    asistencia >= 75
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {asistencia.toFixed(0)}%
                                </span>
                                <span className="text-xs text-gray-500">
                                  {asistencia >= 75
                                    ? "✓ Cumple"
                                    : "✗ No cumple"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  aprobado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {aprobado ? "Aprobado" : "Reprobado"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredEstudiantes.length === 0 &&
                    estudiantes.length > 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>
                          No se encontraron estudiantes con ese criterio de
                          búsqueda
                        </p>
                      </div>
                    )}

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
        </>
      )}

      {/* Sin selección */}
      {!selectedAsignatura && (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Selecciona una asignatura
            </h3>
            <p className="text-gray-600">
              Elige una asignatura para ver la lista completa de estudiantes con
              sus promedios y asistencia
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
