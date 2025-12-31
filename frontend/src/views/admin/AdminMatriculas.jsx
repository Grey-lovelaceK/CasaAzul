// frontend/src/views/admin/AdminMatriculas.jsx

import {
  AlertCircle,
  CheckCircle,
  FileUp,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cursosApi, dashboardApi, estudiantesApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { ImportarExcel } from "../../components/common/ImportarExcel";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";

// Campos para importación masiva de matrículas
const CAMPOS_IMPORTACION = [
  {
    nombre: "rut_estudiante",
    label: "RUT Estudiante",
    requerido: true,
    tipo: "rut",
    ejemplo: "12.345.678-9",
  },
  {
    nombre: "codigo_curso",
    label: "Código Curso",
    requerido: true,
    ejemplo: "1B",
  },
];

export const AdminMatriculas = () => {
  const [cursos, setCursos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesSinCurso, setEstudiantesSinCurso] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMatricularModal, setShowMatricularModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMatriculaMasivaModal, setShowMatriculaMasivaModal] =
    useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cursosRes, estudiantesRes, periodosRes] = await Promise.all([
        cursosApi.getAll({ activos: true }),
        estudiantesApi.getAll({ per_page: 1000 }),
        dashboardApi.getPeriodos(),
      ]);

      if (cursosRes.success) setCursos(cursosRes.data.data || cursosRes.data);
      if (estudiantesRes.success) {
        const allEstudiantes = estudiantesRes.data.data || estudiantesRes.data;
        setEstudiantes(allEstudiantes);
        setEstudiantesSinCurso(
          allEstudiantes.filter((e) => !e.id_curso_actual)
        );
      }
      if (periodosRes.success) {
        setPeriodos(periodosRes.data);
        setPeriodoActivo(periodosRes.data.find((p) => p.activo));
      }
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const totalMatriculados = estudiantes.filter((e) => e.id_curso_actual).length;
  const totalSinCurso = estudiantesSinCurso.length;
  const totalCupos = cursos.reduce((sum, c) => sum + (c.cupo_maximo || 0), 0);
  const cuposOcupados = cursos.reduce(
    (sum, c) => sum + (c.estudiantes_count || 0),
    0
  );

  // Importar matrículas desde Excel
  const handleImport = async (datos) => {
    try {
      let exitosos = 0;
      let errores = 0;
      const erroresDetalle = [];

      for (const registro of datos) {
        try {
          // Buscar estudiante por RUT
          const estudiante = estudiantes.find(
            (e) =>
              e.rut.replace(/[^0-9kK]/g, "") ===
              registro.rut_estudiante.replace(/[^0-9kK]/g, "")
          );

          if (!estudiante) {
            erroresDetalle.push(
              `RUT ${registro.rut_estudiante}: Estudiante no encontrado`
            );
            errores++;
            continue;
          }

          // Buscar curso por código
          const curso = cursos.find(
            (c) =>
              c.nivel?.codigo?.toLowerCase() ===
                registro.codigo_curso.toLowerCase() ||
              c.codigo?.toLowerCase() === registro.codigo_curso.toLowerCase()
          );

          if (!curso) {
            erroresDetalle.push(
              `Curso ${registro.codigo_curso}: No encontrado`
            );
            errores++;
            continue;
          }

          // Asignar estudiante al curso
          const response = await estudiantesApi.update(
            estudiante.id_estudiante,
            {
              id_curso_actual: curso.id_curso,
            }
          );

          if (response.success) {
            exitosos++;
          } else {
            errores++;
          }
        } catch {
          errores++;
        }
      }

      loadData();

      return {
        success: true,
        message: `Importación completada`,
        detalles: { creados: exitosos, errores },
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  if (loading) return <Loading text="Cargando matrículas..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Matrículas</h1>
          <p className="text-gray-600 mt-1">
            {periodoActivo
              ? `Período: ${periodoActivo.nombre}`
              : "Sin período activo"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={FileUp}
            onClick={() => setShowImportModal(true)}
          >
            Importar Excel
          </Button>
          <Button icon={UserPlus} onClick={() => setShowMatricularModal(true)}>
            Matricular Estudiante
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total Estudiantes"
          value={estudiantes.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Matriculados"
          value={totalMatriculados}
          subtitle={`${
            Math.round((totalMatriculados / estudiantes.length) * 100) || 0
          }%`}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-8 h-8" />}
          title="Sin Curso"
          value={totalSinCurso}
          subtitle="Pendientes de asignar"
          color={totalSinCurso > 0 ? "orange" : "green"}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Cupos Totales"
          value={`${cuposOcupados}/${totalCupos}`}
          subtitle={`${
            Math.round((cuposOcupados / totalCupos) * 100) || 0
          }% ocupación`}
          color="purple"
        />
      </div>

      {/* Alerta estudiantes sin curso */}
      {totalSinCurso > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                Hay {totalSinCurso} estudiantes sin curso asignado
              </p>
              <p className="text-sm text-yellow-700">
                Puedes asignarlos individualmente o usar la importación masiva
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => setShowMatriculaMasivaModal(true)}
            >
              Matrícula Masiva
            </Button>
          </div>
        </div>
      )}

      {/* Cursos con sus estudiantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cursos.map((curso) => (
          <CursoMatriculaCard
            key={curso.id_curso}
            curso={curso}
            onVerDetalle={() => {
              setCursoSeleccionado(curso);
            }}
            onRefresh={loadData}
          />
        ))}
      </div>

      {/* Modal Matricular Individual */}
      {showMatricularModal && (
        <MatricularEstudianteModal
          estudiantes={estudiantesSinCurso}
          cursos={cursos}
          onClose={() => setShowMatricularModal(false)}
          onSave={() => {
            loadData();
            setShowMatricularModal(false);
          }}
        />
      )}

      {/* Modal Importar */}
      <ImportarExcel
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        campos={CAMPOS_IMPORTACION}
        titulo="Importar Matrículas desde Excel"
        nombreArchivo="plantilla_matriculas"
        plantillaData={[
          { "RUT Estudiante": "12.345.678-9", "Código Curso": "1B" },
          { "RUT Estudiante": "11.222.333-4", "Código Curso": "2M" },
        ]}
      />

      {/* Modal Matrícula Masiva */}
      {showMatriculaMasivaModal && (
        <MatriculaMasivaModal
          estudiantes={estudiantesSinCurso}
          cursos={cursos}
          onClose={() => setShowMatriculaMasivaModal(false)}
          onSave={() => {
            loadData();
            setShowMatriculaMasivaModal(false);
          }}
        />
      )}
    </div>
  );
};

// Card de Curso con Matrícula
const CursoMatriculaCard = ({ curso, onVerDetalle, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);

  const porcentajeOcupacion =
    curso.cupo_maximo > 0
      ? Math.round((curso.estudiantes_count / curso.cupo_maximo) * 100)
      : 0;

  const loadEstudiantes = async () => {
    if (estudiantes.length > 0) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    try {
      const response = await cursosApi.getEstudiantes(curso.id_curso);
      if (response.success) {
        setEstudiantes(response.data.estudiantes || response.data);
      }
    } catch (error) {
      toast.error("Error al cargar estudiantes");
    } finally {
      setLoading(false);
      setExpanded(true);
    }
  };

  const handleQuitarDelCurso = async (idEstudiante) => {
    if (!confirm("¿Quitar este estudiante del curso?")) return;

    try {
      const response = await estudiantesApi.update(idEstudiante, {
        id_curso_actual: null,
      });

      if (response.success) {
        toast.success("Estudiante removido del curso");
        setEstudiantes(
          estudiantes.filter((e) => e.id_estudiante !== idEstudiante)
        );
        onRefresh();
      }
    } catch (error) {
      toast.error("Error al remover estudiante");
    }
  };

  return (
    <Card>
      {/* Header del curso */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={loadEstudiantes}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {curso.nivel?.codigo || curso.codigo}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {curso.nivel?.nombre || curso.nombre}
            </h3>
            <p className="text-sm text-gray-500">{curso.periodo?.nombre}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">
              {curso.estudiantes_count || 0}/{curso.cupo_maximo}
            </p>
            <p className="text-xs text-gray-500">estudiantes</p>
          </div>
          <div
            className={`w-16 h-2 rounded-full ${
              porcentajeOcupacion >= 90
                ? "bg-red-200"
                : porcentajeOcupacion >= 70
                ? "bg-yellow-200"
                : "bg-green-200"
            }`}
          >
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
      </div>

      {/* Lista de estudiantes expandible */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {loading ? (
            <p className="text-center py-4 text-gray-500">Cargando...</p>
          ) : estudiantes.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {estudiantes.map((est) => (
                <div
                  key={est.id_estudiante}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {est.nombre || `${est.nombres} ${est.apellido_paterno}`}
                    </p>
                    <p className="text-xs text-gray-500">{est.rut}</p>
                  </div>
                  <button
                    onClick={() => handleQuitarDelCurso(est.id_estudiante)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Quitar del curso"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No hay estudiantes en este curso
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

// Modal Matricular Estudiante Individual
const MatricularEstudianteModal = ({
  estudiantes,
  cursos,
  onClose,
  onSave,
}) => {
  const [idEstudiante, setIdEstudiante] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await estudiantesApi.update(idEstudiante, {
        id_curso_actual: idCurso,
      });

      if (response.success) {
        toast.success("Estudiante matriculado exitosamente");
        onSave();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error al matricular");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Matricular Estudiante" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Estudiante"
          value={idEstudiante}
          onChange={setIdEstudiante}
          options={estudiantes}
          placeholder="Buscar estudiante..."
          searchable
          required
          getOptionLabel={(e) =>
            `${e.nombres} ${e.apellido_paterno} - ${e.rut}`
          }
          getOptionValue={(e) => e.id_estudiante}
        />

        <Select
          label="Curso"
          value={idCurso}
          onChange={setIdCurso}
          options={cursos}
          placeholder="Seleccionar curso..."
          searchable
          required
          getOptionLabel={(c) =>
            `${c.nivel?.nombre || c.nombre} (${c.estudiantes_count || 0}/${
              c.cupo_maximo
            } cupos)`
          }
          getOptionValue={(c) => c.id_curso}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Al asignar un curso, el estudiante será
            matriculado automáticamente en todas las asignaturas del curso según
            el plan de estudios.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!idEstudiante || !idCurso}
          >
            Matricular
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal Matrícula Masiva
const MatriculaMasivaModal = ({ estudiantes, cursos, onClose, onSave }) => {
  const [idCurso, setIdCurso] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const estudiantesFiltrados = estudiantes.filter(
    (e) =>
      e.nombres?.toLowerCase().includes(search.toLowerCase()) ||
      e.apellido_paterno?.toLowerCase().includes(search.toLowerCase()) ||
      e.rut?.includes(search)
  );

  const handleToggle = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (seleccionados.length === estudiantesFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(estudiantesFiltrados.map((e) => e.id_estudiante));
    }
  };

  const handleSubmit = async () => {
    if (!idCurso || seleccionados.length === 0) {
      toast.error("Selecciona un curso y al menos un estudiante");
      return;
    }

    setLoading(true);
    let exitosos = 0;
    let errores = 0;

    for (const idEst of seleccionados) {
      try {
        const response = await estudiantesApi.update(idEst, {
          id_curso_actual: idCurso,
        });
        if (response.success) exitosos++;
        else errores++;
      } catch {
        errores++;
      }
    }

    toast.success(
      `${exitosos} estudiantes matriculados${
        errores > 0 ? `, ${errores} con errores` : ""
      }`
    );
    setLoading(false);
    onSave();
  };

  return (
    <Modal isOpen onClose={onClose} title="Matrícula Masiva" size="lg">
      <div className="space-y-6">
        {/* Selector de curso */}
        <Select
          label="Curso destino"
          value={idCurso}
          onChange={setIdCurso}
          options={cursos}
          placeholder="Seleccionar curso..."
          searchable
          required
          getOptionLabel={(c) =>
            `${c.nivel?.nombre || c.nombre} (${c.estudiantes_count || 0}/${
              c.cupo_maximo
            })`
          }
          getOptionValue={(c) => c.id_curso}
        />

        {/* Búsqueda */}
        <Input
          icon={Search}
          placeholder="Buscar estudiantes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Lista de estudiantes */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  seleccionados.length === estudiantesFiltrados.length &&
                  estudiantesFiltrados.length > 0
                }
                onChange={handleToggleAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium">
                Seleccionar todos ({estudiantesFiltrados.length})
              </span>
            </label>
            <span className="text-sm text-gray-600">
              {seleccionados.length} seleccionados
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {estudiantesFiltrados.map((est) => (
              <label
                key={est.id_estudiante}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(est.id_estudiante)}
                  onChange={() => handleToggle(est.id_estudiante)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {est.nombres} {est.apellido_paterno}
                  </p>
                  <p className="text-xs text-gray-500">{est.rut}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!idCurso || seleccionados.length === 0}
          >
            Matricular {seleccionados.length} estudiantes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminMatriculas;
