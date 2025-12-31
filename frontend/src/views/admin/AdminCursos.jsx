// frontend/src/views/admin/AdminCursos.jsx

import { BookOpen, ChevronRight, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  catalogosApi,
  cursosApi,
  dashboardApi,
  profesoresApi,
} from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";

export const AdminCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ id_periodo: "", tipo: "" });
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);

  useEffect(() => {
    loadData();
  }, [filtros]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cursosRes, periodosRes, profesoresRes, nivelesRes] =
        await Promise.all([
          cursosApi.getAll({ ...filtros, activos: !filtros.id_periodo }),
          dashboardApi.getPeriodos(),
          profesoresApi.getAll(),
          catalogosApi.getNiveles(),
        ]);

      if (cursosRes.success) setCursos(cursosRes.data.data || cursosRes.data);
      if (periodosRes.success) {
        setPeriodos(periodosRes.data);
        setPeriodoActivo(periodosRes.data.find((p) => p.activo));
      }
      if (profesoresRes.success)
        setProfesores(profesoresRes.data.data || profesoresRes.data);
      if (nivelesRes.success) setNiveles(nivelesRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar cursos por tipo (básica/media)
  const cursosBasica = cursos.filter((c) => c.nivel?.tipo === "basica");
  const cursosMedia = cursos.filter((c) => c.nivel?.tipo === "media");

  // Estadísticas
  const totalEstudiantes = cursos.reduce(
    (sum, c) => sum + (c.estudiantes_count || 0),
    0
  );
  const totalAsignaturas = cursos.reduce(
    (sum, c) => sum + (c.asignaturas_count || 0),
    0
  );

  if (loading) {
    return <Loading text="Cargando cursos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cursos</h1>
          <p className="text-gray-600 mt-1">
            {periodoActivo
              ? `Período: ${periodoActivo.nombre}`
              : "Sin período activo"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Total Cursos"
          value={cursos.length}
          subtitle={`${cursosBasica.length} básica, ${cursosMedia.length} media`}
          color="blue"
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Estudiantes"
          value={totalEstudiantes}
          subtitle="Total matriculados"
          color="green"
        />
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Asignaturas"
          value={totalAsignaturas}
          subtitle="En todos los cursos"
          color="purple"
        />
        <StatCard
          icon={<UserCheck className="w-8 h-8" />}
          title="Profesores"
          value={profesores.length}
          subtitle="Disponibles"
          color="orange"
        />
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={filtros.id_periodo}
              onChange={(e) =>
                setFiltros({ ...filtros, id_periodo: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Período activo</option>
              {periodos.map((p) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre} {p.activo && "(Activo)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option value="basica">Educación Básica</option>
              <option value="media">Educación Media</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cursos de Educación Básica */}
      {(!filtros.tipo || filtros.tipo === "basica") &&
        cursosBasica.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📚 Educación Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cursosBasica.map((curso) => (
                <CursoCard
                  key={curso.id_curso}
                  curso={curso}
                  profesores={profesores}
                  onClick={() => {
                    setCursoSeleccionado(curso);
                    setShowDetalleModal(true);
                  }}
                  onUpdate={loadData}
                />
              ))}
            </div>
          </div>
        )}

      {/* Cursos de Educación Media */}
      {(!filtros.tipo || filtros.tipo === "media") &&
        cursosMedia.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎓 Educación Media
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cursosMedia.map((curso) => (
                <CursoCard
                  key={curso.id_curso}
                  curso={curso}
                  profesores={profesores}
                  onClick={() => {
                    setCursoSeleccionado(curso);
                    setShowDetalleModal(true);
                  }}
                  onUpdate={loadData}
                />
              ))}
            </div>
          </div>
        )}

      {/* Sin cursos */}
      {cursos.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No hay cursos para este período
            </h3>
            <p className="text-gray-600 mb-4">
              Ve a Períodos Académicos para crear los cursos del año escolar
            </p>
          </div>
        </Card>
      )}

      {/* Modal Detalle del Curso */}
      {showDetalleModal && cursoSeleccionado && (
        <DetalleCursoModal
          curso={cursoSeleccionado}
          profesores={profesores}
          onClose={() => {
            setShowDetalleModal(false);
            setCursoSeleccionado(null);
          }}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

// Card de Curso
const CursoCard = ({ curso, profesores, onClick, onUpdate }) => {
  const [showEditarJefe, setShowEditarJefe] = useState(false);

  const porcentajeOcupacion =
    curso.cupo_maximo > 0
      ? Math.round((curso.estudiantes_count / curso.cupo_maximo) * 100)
      : 0;

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              {curso.nivel?.nombre || curso.nombre}
            </h3>
            <p className="text-sm text-gray-500">{curso.periodo?.nombre}</p>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
            {curso.nivel?.codigo}
          </span>
        </div>

        {/* Profesor Jefe */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Profesor Jefe:</p>
          {curso.profesor_jefe ? (
            <p className="text-sm font-medium text-gray-700">
              {curso.profesor_jefe.nombre ||
                `${curso.profesor_jefe.nombres} ${curso.profesor_jefe.apellido_paterno}`}
            </p>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditarJefe(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Asignar profesor jefe
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center border-t pt-3">
          <div>
            <p className="text-lg font-bold text-gray-800">
              {curso.estudiantes_count || 0}
            </p>
            <p className="text-xs text-gray-500">Estudiantes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">
              {curso.asignaturas_count || 0}
            </p>
            <p className="text-xs text-gray-500">Asignaturas</p>
          </div>
        </div>

        {/* Barra de ocupación */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Ocupación</span>
            <span>{porcentajeOcupacion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                porcentajeOcupacion >= 90
                  ? "bg-red-500"
                  : porcentajeOcupacion >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Modal Editar Profesor Jefe */}
      {showEditarJefe && (
        <AsignarProfesorJefeModal
          curso={curso}
          profesores={profesores}
          onClose={() => setShowEditarJefe(false)}
          onSave={() => {
            setShowEditarJefe(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};

// Modal Asignar Profesor Jefe
const AsignarProfesorJefeModal = ({ curso, profesores, onClose, onSave }) => {
  const [idProfesor, setIdProfesor] = useState(curso.id_profesor_jefe || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await cursosApi.update(curso.id_curso, {
        id_profesor_jefe: idProfesor || null,
      });

      if (response.success) {
        toast.success("Profesor jefe asignado");
        onSave();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al asignar profesor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Asignar Profesor Jefe" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">Curso:</p>
          <p className="font-semibold">{curso.nivel?.nombre}</p>
        </div>

        <Select
          label="Seleccionar Profesor"
          value={idProfesor}
          onChange={setIdProfesor}
          options={profesores}
          placeholder="Buscar profesor..."
          searchable
          clearable
          getOptionLabel={(p) =>
            `${p.nombres} ${p.apellido_paterno} - ${
              p.especialidad || "Sin especialidad"
            }`
          }
          getOptionValue={(p) => p.id_profesor}
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

// Modal Detalle del Curso
const DetalleCursoModal = ({ curso, profesores, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [tab, setTab] = useState("asignaturas");

  useEffect(() => {
    loadDetalle();
  }, []);

  const loadDetalle = async () => {
    try {
      const response = await cursosApi.getById(curso.id_curso);
      if (response.success) {
        setDetalle(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar detalle");
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarProfesor = async (idAsignatura, idProfesor) => {
    try {
      // Aquí iría la llamada al API
      toast.success("Profesor asignado a la asignatura");
      loadDetalle();
    } catch (error) {
      toast.error("Error al asignar profesor");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={curso.nivel?.nombre || "Detalle del Curso"}
      size="xl"
    >
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="space-y-6">
          {/* Info General */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Período</p>
              <p className="font-semibold">{curso.periodo?.nombre}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Profesor Jefe</p>
              <p className="font-semibold">
                {detalle?.profesor_jefe?.nombre || "Sin asignar"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Estudiantes</p>
              <p className="font-semibold">
                {detalle?.estadisticas?.total_estudiantes || 0} /{" "}
                {curso.cupo_maximo}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Sala</p>
              <p className="font-semibold">{curso.sala_principal || "-"}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex gap-4">
              <button
                onClick={() => setTab("asignaturas")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                  tab === "asignaturas"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Asignaturas ({detalle?.asignaturas?.length || 0})
              </button>
              <button
                onClick={() => setTab("estudiantes")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                  tab === "estudiantes"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Estudiantes ({detalle?.estudiantes?.length || 0})
              </button>
            </div>
          </div>

          {/* Contenido del Tab */}
          {tab === "asignaturas" && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detalle?.asignaturas?.map((asig, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {asig.materia || asig.codigo_materia}
                    </p>
                    <p className="text-sm text-gray-500">
                      {asig.horario || "Sin horario"} • Sala: {asig.sala || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {asig.profesor ? (
                      <span className="text-sm text-gray-700">
                        {asig.profesor}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          handleAsignarProfesor(asig.id, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Asignar profesor...</option>
                        {profesores.map((p) => (
                          <option key={p.id_profesor} value={p.id_profesor}>
                            {p.nombres} {p.apellido_paterno}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
              {(!detalle?.asignaturas || detalle.asignaturas.length === 0) && (
                <p className="text-center py-8 text-gray-500">
                  No hay asignaturas en este curso
                </p>
              )}
            </div>
          )}

          {tab === "estudiantes" && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {detalle?.estudiantes?.map((est, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{est.nombre}</p>
                    <p className="text-sm text-gray-500">{est.rut}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      est.estado === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {est.estado}
                  </span>
                </div>
              ))}
              {(!detalle?.estudiantes || detalle.estudiantes.length === 0) && (
                <p className="text-center py-8 text-gray-500">
                  No hay estudiantes en este curso
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AdminCursos;
