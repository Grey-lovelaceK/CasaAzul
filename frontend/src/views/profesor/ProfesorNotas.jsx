// frontend/src/views/profesor/ProfesorNotas.jsx

import {
  Edit,
  FileEdit,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi, notasApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { ESCALA_NOTAS } from "../../utils/constants";
import { formatDate, formatNota } from "../../utils/formatters";

export const ProfesorNotas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMasivoModal, setShowMasivoModal] = useState(false);
  const [editandoNota, setEditandoNota] = useState(null);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  useEffect(() => {
    if (selectedAsignatura) {
      loadNotas();
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

  const loadNotas = async () => {
    setLoadingNotas(true);
    try {
      const response = await notasApi.getPorAsignatura(
        selectedAsignatura.id_asignatura
      );
      if (response.success) {
        setNotas(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar notas");
    } finally {
      setLoadingNotas(false);
    }
  };

  const handleDelete = async (idNota) => {
    if (!confirm("¿Eliminar esta nota?")) return;

    try {
      const response = await notasApi.delete(idNota);
      if (response.success) {
        toast.success("Nota eliminada");
        loadNotas();
      }
    } catch (error) {
      toast.error("Error al eliminar nota");
    }
  };

  if (loading) {
    return <Loading text="Cargando asignaturas..." />;
  }

  // Calcular estadísticas
  const totalEstudiantes = notas.length;
  const promedioGeneral =
    notas.length > 0
      ? (notas.reduce((sum, n) => sum + n.promedio, 0) / notas.length).toFixed(
          1
        )
      : "0.0";
  const aprobados = notas.filter(
    (n) => n.promedio >= ESCALA_NOTAS.APROBACION
  ).length;
  const reprobados = totalEstudiantes - aprobados;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Registrar Notas</h1>
          <p className="text-gray-600 mt-1">
            Ingresa las evaluaciones de tus estudiantes
          </p>
        </div>
        {selectedAsignatura && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setShowMasivoModal(true)}
            >
              Carga Masiva
            </Button>
            <Button
              icon={Plus}
              onClick={() => {
                setEditandoNota(null);
                setShowModal(true);
              }}
            >
              Nueva Nota
            </Button>
          </div>
        )}
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
          {loadingNotas ? (
            <Loading text="Cargando notas..." />
          ) : (
            <>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Estudiantes</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalEstudiantes}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Promedio Curso</p>
                    <p className="text-3xl font-bold text-purple-600">
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

              {/* Tabla de notas */}
              <Card title="Notas por Estudiante">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Estudiante
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Notas Registradas
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Promedio
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {notas.map((estudiante) => (
                        <React.Fragment key={estudiante.estudiante.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {estudiante.estudiante.nombre}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {estudiante.estudiante.rut}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-lg font-semibold text-gray-800">
                                {estudiante.total_notas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-2xl font-bold ${
                                  estudiante.promedio >= ESCALA_NOTAS.APROBACION
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatNota(estudiante.promedio)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                  estudiante.estado === "Aprobado"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {estudiante.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Aquí podrías abrir un modal con las notas del estudiante
                                  console.log(
                                    "Ver notas de",
                                    estudiante.estudiante.nombre
                                  );
                                }}
                              >
                                Ver Notas
                              </Button>
                            </td>
                          </tr>

                          {/* Detalle de notas (expandible) */}
                          <tr className="bg-gray-50">
                            <td colSpan="5" className="px-4 py-2">
                              <div className="flex flex-wrap gap-2">
                                {estudiante.notas.map((nota) => (
                                  <div
                                    key={nota.id}
                                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">
                                        {nota.nombre}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {formatDate(nota.fecha)}
                                      </p>
                                    </div>
                                    <span
                                      className={`text-lg font-bold ${
                                        nota.nota >= ESCALA_NOTAS.APROBACION
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {formatNota(nota.nota)}
                                    </span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditandoNota(nota);
                                          setShowModal(true);
                                        }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(nota.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>

                  {notas.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileEdit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay notas registradas para esta asignatura</p>
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
            <FileEdit className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Selecciona una asignatura para comenzar
            </h3>
            <p className="text-gray-600">
              Elige una asignatura para ver y registrar las notas de tus
              estudiantes
            </p>
          </div>
        </Card>
      )}

      {/* Modales */}
      {showModal && (
        <NotaModal
          nota={editandoNota}
          asignaturaId={selectedAsignatura?.id_asignatura}
          estudiantes={notas}
          onClose={() => {
            setShowModal(false);
            setEditandoNota(null);
          }}
          onSave={() => {
            loadNotas();
            setShowModal(false);
            setEditandoNota(null);
          }}
        />
      )}

      {showMasivoModal && (
        <NotaMasivaModal
          asignatura={selectedAsignatura}
          estudiantes={notas}
          onClose={() => setShowMasivoModal(false)}
          onSave={() => {
            loadNotas();
            setShowMasivoModal(false);
          }}
        />
      )}
    </div>
  );
};

// Modal para nota individual
const NotaModal = ({ nota, asignaturaId, estudiantes, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    nota || {
      id_matricula: "",
      nombre: "",
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
      nota: "",
      observaciones: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = nota
        ? await notasApi.update(nota.id, formData)
        : await notasApi.create(formData);

      if (response.success) {
        toast.success(nota ? "Nota actualizada" : "Nota registrada");
        onSave();
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={nota ? "Editar Nota" : "Nueva Nota"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!nota && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <select
              value={formData.id_matricula}
              onChange={(e) =>
                setFormData({ ...formData, id_matricula: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Seleccionar...</option>
              {estudiantes.map((est) => (
                <option key={est.estudiante.id} value={est.estudiante.id}>
                  {est.estudiante.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Nombre de la Evaluación"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Prueba 1, Control, Trabajo Final"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nota"
            type="number"
            step="0.1"
            min={ESCALA_NOTAS.MIN}
            max={ESCALA_NOTAS.MAX}
            value={formData.nota}
            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
            placeholder="1.0 - 7.0"
            required
          />
          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
        </div>

        <Input
          label="Descripción"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          placeholder="Opcional"
        />

        <Input
          label="Observaciones"
          value={formData.observaciones}
          onChange={(e) =>
            setFormData({ ...formData, observaciones: e.target.value })
          }
          placeholder="Opcional"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal para carga masiva
const NotaMasivaModal = ({ asignatura, estudiantes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [notas, setNotas] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const notasIniciales = {};
    estudiantes.forEach((est) => {
      notasIniciales[est.estudiante.id] = "";
    });
    setNotas(notasIniciales);
  }, [estudiantes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const notasArray = Object.entries(notas)
      .filter(([_, nota]) => nota !== "")
      .map(([idMatricula, nota]) => ({
        id_matricula: parseInt(idMatricula),
        nota: parseFloat(nota),
      }));

    try {
      const response = await notasApi.cargarMasivo({
        id_asignatura: asignatura.id_asignatura,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        notas: notasArray,
      });

      if (response.success) {
        toast.success(
          `${response.message}\nNotas cargadas: ${response.data.creadas}`
        );
        onSave();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Carga Masiva de Notas" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre de la Evaluación"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            required
          />
        </div>

        <Input
          label="Descripción"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
        />

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">
            Ingresa las notas por estudiante:
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {estudiantes.map((est) => (
              <div key={est.estudiante.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{est.estudiante.nombre}</span>
                <input
                  type="number"
                  step="0.1"
                  min={ESCALA_NOTAS.MIN}
                  max={ESCALA_NOTAS.MAX}
                  value={notas[est.estudiante.id] || ""}
                  onChange={(e) =>
                    setNotas({ ...notas, [est.estudiante.id]: e.target.value })
                  }
                  className="w-24 px-2 py-1 border rounded"
                  placeholder="1.0-7.0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar Todas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
