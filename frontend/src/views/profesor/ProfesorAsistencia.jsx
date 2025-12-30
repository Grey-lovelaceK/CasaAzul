// frontend/src/views/profesor/ProfesorAsistencia.jsx

import {
  CheckCircle,
  ClipboardCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi, asistenciasApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";

export const ProfesorAsistencia = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [asistencias, setAsistencias] = useState({});
  const [yaRegistrada, setYaRegistrada] = useState(false);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  useEffect(() => {
    if (selectedAsignatura) {
      loadEstudiantes();
    }
  }, [selectedAsignatura, fecha]);

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
      const response = await asistenciasApi.getListaEstudiantes(
        selectedAsignatura.id_asignatura,
        fecha
      );

      if (response.success) {
        setEstudiantes(response.data.estudiantes);
        setYaRegistrada(response.data.ya_registrada);

        // Pre-cargar asistencias si ya están registradas
        const asistenciasTemp = {};
        response.data.estudiantes.forEach((est) => {
          if (est.asistencia_registrada) {
            asistenciasTemp[est.id_matricula] = {
              presente: est.asistencia_registrada.presente,
              justificada: est.asistencia_registrada.justificada,
              observaciones: est.asistencia_registrada.observaciones || "",
            };
          } else {
            asistenciasTemp[est.id_matricula] = {
              presente: true,
              justificada: false,
              observaciones: "",
            };
          }
        });
        setAsistencias(asistenciasTemp);
      }
    } catch (error) {
      toast.error("Error al cargar estudiantes");
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const handleTogglePresente = (idMatricula) => {
    setAsistencias({
      ...asistencias,
      [idMatricula]: {
        ...asistencias[idMatricula],
        presente: !asistencias[idMatricula].presente,
        justificada: !asistencias[idMatricula].presente
          ? false
          : asistencias[idMatricula].justificada,
      },
    });
  };

  const handleToggleJustificada = (idMatricula) => {
    setAsistencias({
      ...asistencias,
      [idMatricula]: {
        ...asistencias[idMatricula],
        justificada: !asistencias[idMatricula].justificada,
      },
    });
  };

  const handleMarcarTodos = (presente) => {
    const nuevasAsistencias = {};
    estudiantes.forEach((est) => {
      nuevasAsistencias[est.id_matricula] = {
        presente,
        justificada: false,
        observaciones: asistencias[est.id_matricula]?.observaciones || "",
      };
    });
    setAsistencias(nuevasAsistencias);
  };

  const handleGuardar = async () => {
    if (!selectedAsignatura) {
      toast.error("Selecciona una asignatura");
      return;
    }

    const asistenciasArray = estudiantes.map((est) => ({
      id_matricula: est.id_matricula,
      presente: asistencias[est.id_matricula]?.presente ?? true,
      justificada: asistencias[est.id_matricula]?.justificada ?? false,
      observaciones: asistencias[est.id_matricula]?.observaciones || null,
    }));

    try {
      const response = await asistenciasApi.tomarMasivo({
        id_asignatura: selectedAsignatura.id_asignatura,
        fecha,
        asistencias: asistenciasArray,
      });

      if (response.success) {
        toast.success(`✅ ${response.message}`);
        loadEstudiantes();
      } else {
        toast.error(response.message || "Error al guardar asistencia");
      }
    } catch (error) {
      toast.error("Error al guardar asistencia");
    }
  };

  const handleEliminar = async () => {
    if (
      !confirm(
        "¿Eliminar la asistencia de esta fecha? Podrás volver a tomarla después."
      )
    ) {
      return;
    }

    try {
      const response = await asistenciasApi.eliminarPorFecha(
        selectedAsignatura.id_asignatura,
        fecha
      );

      if (response.success) {
        toast.success("Asistencia eliminada");
        loadEstudiantes();
      }
    } catch (error) {
      toast.error("Error al eliminar asistencia");
    }
  };

  if (loading) {
    return <Loading text="Cargando asignaturas..." />;
  }

  const presentes = Object.values(asistencias).filter((a) => a.presente).length;
  const ausentes = estudiantes.length - presentes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tomar Asistencia</h1>
        <p className="text-gray-600 mt-1">
          Registra la asistencia de tus estudiantes
        </p>
      </div>

      {/* Selección de Asignatura y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asignatura
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
                {asig.curso?.nombre} - Sección {asig.seccion}
              </option>
            ))}
          </select>
        </Card>

        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </Card>
      </div>

      {/* Información de la asignatura seleccionada */}
      {selectedAsignatura && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedAsignatura.curso?.nombre} - Sección{" "}
                {selectedAsignatura.seccion}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedAsignatura.periodo?.nombre} •{" "}
                {selectedAsignatura.horario || "Sin horario"}
              </p>
            </div>

            {yaRegistrada && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Asistencia registrada
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lista de estudiantes */}
      {selectedAsignatura && (
        <>
          {loadingEstudiantes ? (
            <Loading text="Cargando estudiantes..." />
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Estudiantes</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {estudiantes.length}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Presentes</p>
                      <p className="text-2xl font-bold text-green-600">
                        {presentes}
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ausentes</p>
                      <p className="text-2xl font-bold text-red-600">
                        {ausentes}
                      </p>
                    </div>
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                </Card>
              </div>

              {/* Acciones rápidas */}
              <Card>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleMarcarTodos(true)}
                    icon={CheckCircle}
                  >
                    Marcar Todos Presentes
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleMarcarTodos(false)}
                    icon={XCircle}
                  >
                    Marcar Todos Ausentes
                  </Button>
                  {yaRegistrada && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEliminar}
                      icon={Trash2}
                    >
                      Eliminar Asistencia
                    </Button>
                  )}
                </div>
              </Card>

              {/* Tabla de asistencia */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Presente
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Justificada
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Observaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {estudiantes.map((est) => (
                        <tr key={est.id_matricula} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">
                                {est.estudiante.nombre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {est.estudiante.rut}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                handleTogglePresente(est.id_matricula)
                              }
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                asistencias[est.id_matricula]?.presente
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                            >
                              {asistencias[est.id_matricula]?.presente ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <XCircle className="w-6 h-6" />
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  asistencias[est.id_matricula]?.justificada ||
                                  false
                                }
                                onChange={() =>
                                  handleToggleJustificada(est.id_matricula)
                                }
                                disabled={
                                  asistencias[est.id_matricula]?.presente
                                }
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                              />
                            </label>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={
                                asistencias[est.id_matricula]?.observaciones ||
                                ""
                              }
                              onChange={(e) =>
                                setAsistencias({
                                  ...asistencias,
                                  [est.id_matricula]: {
                                    ...asistencias[est.id_matricula],
                                    observaciones: e.target.value,
                                  },
                                })
                              }
                              placeholder="Opcional..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {estudiantes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay estudiantes matriculados en esta asignatura</p>
                  </div>
                )}
              </Card>

              {/* Botón guardar */}
              {estudiantes.length > 0 && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGuardar}
                    icon={ClipboardCheck}
                  >
                    {yaRegistrada
                      ? "Actualizar Asistencia"
                      : "Guardar Asistencia"}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Instrucciones */}
      {!selectedAsignatura && (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Selecciona una asignatura para comenzar
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Elige una de tus asignaturas y la fecha para registrar la
              asistencia de tus estudiantes
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
