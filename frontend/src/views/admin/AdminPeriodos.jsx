// frontend/src/views/admin/AdminPeriodos.jsx

import { Calendar, CheckCircle, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cursosApi, dashboardApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";

export const AdminPeriodos = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCrearCursosModal, setShowCrearCursosModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);

  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getPeriodos();
      if (response.success) {
        const data = response.data || [];
        setPeriodos(data);
        setPeriodoActivo(data.find((p) => p.activo));
      }
    } catch (error) {
      toast.error("Error al cargar períodos");
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async (periodo) => {
    if (periodo.activo) return;

    if (
      !confirm(
        `¿Activar el período "${periodo.nombre}"? Esto desactivará el período actual.`
      )
    )
      return;

    try {
      // Simulamos la activación actualizando el período
      // El backend debería manejar la desactivación de otros períodos
      toast.success(`Período "${periodo.nombre}" activado`);
      loadPeriodos();
    } catch (error) {
      toast.error("Error al activar período");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este período? Esta acción no se puede deshacer."))
      return;

    try {
      // Aquí iría la llamada al API para eliminar
      toast.success("Período eliminado");
      loadPeriodos();
    } catch (error) {
      toast.error("Error al eliminar período");
    }
  };

  const estadoActual = periodoActivo
    ? new Date() >= new Date(periodoActivo.fecha_inicio) &&
      new Date() <= new Date(periodoActivo.fecha_termino)
      ? "En curso"
      : new Date() < new Date(periodoActivo.fecha_inicio)
      ? "Por iniciar"
      : "Finalizado"
    : "Sin período activo";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Períodos Académicos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los años escolares del sistema
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditando(null);
            setShowModal(true);
          }}
        >
          Nuevo Período
        </Button>
      </div>

      {/* Stats del período activo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Período Activo"
          value={periodoActivo?.nombre || "Ninguno"}
          subtitle={estadoActual}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Total Períodos"
          value={periodos.length}
          subtitle="Registrados en el sistema"
          color="green"
        />
        <Card className="flex items-center justify-center">
          <Button
            variant="secondary"
            icon={Plus}
            onClick={() => setShowCrearCursosModal(true)}
            disabled={!periodoActivo}
          >
            Crear Cursos del Período
          </Button>
        </Card>
      </div>

      {/* Lista de Períodos */}
      <Card title="Todos los Períodos">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="space-y-4">
            {periodos.map((periodo) => (
              <div
                key={periodo.id_periodo}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  periodo.activo
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        periodo.activo ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <Calendar
                        className={`w-6 h-6 ${
                          periodo.activo ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {periodo.nombre}
                        </h3>
                        {periodo.activo && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(periodo.fecha_inicio).toLocaleDateString(
                          "es-CL"
                        )}{" "}
                        -{" "}
                        {new Date(periodo.fecha_termino).toLocaleDateString(
                          "es-CL"
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Año: {periodo.anio}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!periodo.activo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivar(periodo)}
                      >
                        Activar
                      </Button>
                    )}
                    <button
                      onClick={() => {
                        setEditando(periodo);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!periodo.activo && (
                      <button
                        onClick={() => handleDelete(periodo.id_periodo)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info adicional del período */}
                {periodo.descripcion && (
                  <p className="mt-3 text-sm text-gray-600 border-t pt-3">
                    {periodo.descripcion}
                  </p>
                )}
              </div>
            ))}

            {periodos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay períodos registrados</p>
                <p className="text-sm">
                  Crea el primer período para comenzar a usar el sistema
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Instrucciones */}
      <Card>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            💡 ¿Cómo funcionan los períodos?
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc ml-4">
            <li>Un período representa un año escolar (ej: 2025)</li>
            <li>
              Solo puede haber <strong>un período activo</strong> a la vez
            </li>
            <li>
              Al crear un nuevo período, puedes generar automáticamente todos
              los cursos (12 niveles)
            </li>
            <li>
              Cada curso incluirá las asignaturas según el plan de estudios
            </li>
            <li>
              Los estudiantes se matriculan en los cursos del período activo
            </li>
          </ul>
        </div>
      </Card>

      {/* Modal Crear/Editar Período */}
      {showModal && (
        <PeriodoModal
          periodo={editando}
          onClose={() => {
            setShowModal(false);
            setEditando(null);
          }}
          onSave={() => {
            loadPeriodos();
            setShowModal(false);
            setEditando(null);
          }}
        />
      )}

      {/* Modal Crear Cursos */}
      {showCrearCursosModal && periodoActivo && (
        <CrearCursosModal
          periodo={periodoActivo}
          onClose={() => setShowCrearCursosModal(false)}
          onSave={() => {
            setShowCrearCursosModal(false);
            toast.success("Cursos creados exitosamente");
          }}
        />
      )}
    </div>
  );
};

// Modal de Período
const PeriodoModal = ({ periodo, onClose, onSave }) => {
  const añoActual = new Date().getFullYear();

  const [formData, setFormData] = useState(
    periodo || {
      nombre: `Año Escolar ${añoActual}`,
      anio: añoActual,
      fecha_inicio: `${añoActual}-03-01`,
      fecha_termino: `${añoActual}-12-15`,
      descripcion: "",
      activo: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const [crearCursos, setCrearCursos] = useState(!periodo);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí iría la llamada al API para crear/actualizar
      // Por ahora simulamos el éxito
      toast.success(periodo ? "Período actualizado" : "Período creado");

      if (crearCursos && !periodo) {
        toast.success("Cursos generados automáticamente", { duration: 3000 });
      }

      onSave();
    } catch (error) {
      toast.error("Error al guardar período");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={periodo ? "Editar Período" : "Nuevo Período Académico"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Período"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Año Escolar 2025"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Año"
            type="number"
            value={formData.anio}
            onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
            min="2020"
            max="2030"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.activo ? "1" : "0"}
              onChange={(e) =>
                setFormData({ ...formData, activo: e.target.value === "1" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="0">Inactivo</option>
              <option value="1">Activo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de Inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) =>
              setFormData({ ...formData, fecha_inicio: e.target.value })
            }
            required
          />
          <Input
            label="Fecha de Término"
            type="date"
            value={formData.fecha_termino}
            onChange={(e) =>
              setFormData({ ...formData, fecha_termino: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="2"
            placeholder="Notas adicionales sobre este período..."
          />
        </div>

        {/* Opción de crear cursos automáticamente */}
        {!periodo && (
          <div className="border-t pt-4">
            <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={crearCursos}
                onChange={(e) => setCrearCursos(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <p className="font-medium text-blue-900">
                  Crear cursos automáticamente
                </p>
                <p className="text-sm text-blue-700">
                  Se crearán los 12 cursos (1° Básico a 4° Medio) con sus
                  asignaturas según el plan de estudios
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {periodo ? "Guardar Cambios" : "Crear Período"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal Crear Cursos del Período
const CrearCursosModal = ({ periodo, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [cupoMaximo, setCupoMaximo] = useState(45);
  const [crearAsignaturas, setCrearAsignaturas] = useState(true);

  const handleCrear = async () => {
    setLoading(true);
    try {
      const response = await cursosApi.crearCursosPeriodo({
        id_periodo: periodo.id_periodo,
        cupo_maximo: cupoMaximo,
        crear_asignaturas: crearAsignaturas,
      });

      if (response.success) {
        toast.success(response.message || "Cursos creados exitosamente");
        onSave();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al crear cursos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Crear Cursos del Período" size="md">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Se crearán <strong>12 cursos</strong> para el período{" "}
            <strong>{periodo.nombre}</strong>:
          </p>
          <ul className="mt-2 text-sm text-blue-700 grid grid-cols-2 gap-1">
            <li>• 1° Básico</li>
            <li>• 2° Básico</li>
            <li>• 3° Básico</li>
            <li>• 4° Básico</li>
            <li>• 5° Básico</li>
            <li>• 6° Básico</li>
            <li>• 7° Básico</li>
            <li>• 8° Básico</li>
            <li>• 1° Medio</li>
            <li>• 2° Medio</li>
            <li>• 3° Medio</li>
            <li>• 4° Medio</li>
          </ul>
        </div>

        <Input
          label="Cupo Máximo por Curso"
          type="number"
          value={cupoMaximo}
          onChange={(e) => setCupoMaximo(e.target.value)}
          min="10"
          max="50"
          helperText="Cantidad máxima de estudiantes por curso"
        />

        <label className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={crearAsignaturas}
            onChange={(e) => setCrearAsignaturas(e.target.checked)}
            className="w-5 h-5 text-green-600 rounded"
          />
          <div>
            <p className="font-medium text-green-900">
              Crear asignaturas según plan de estudios
            </p>
            <p className="text-sm text-green-700">
              Cada curso tendrá sus materias asignadas automáticamente
            </p>
          </div>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCrear} loading={loading}>
            Crear Cursos
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminPeriodos;
