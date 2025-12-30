// frontend/src/views/admin/AdminMatriculas.jsx

import { Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi, estudiantesApi } from "../../api";
import { apiClient } from "../../api/config";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";

export const AdminMatriculas = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estRes, periodosRes] = await Promise.all([
        estudiantesApi.getAll(),
        dashboardApi.getPeriodos(),
      ]);

      if (estRes.success) setEstudiantes(estRes.data.data || estRes.data);
      if (periodosRes.success) setPeriodos(periodosRes.data);

      // Cargar cursos
      const cursosRes = await apiClient.get("/cursos");
      if (cursosRes.success) setCursos(cursosRes.data.data || cursosRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const filteredEstudiantes = estudiantes.filter(
    (e) =>
      e.nombres?.toLowerCase().includes(search.toLowerCase()) ||
      e.apellido_paterno?.toLowerCase().includes(search.toLowerCase()) ||
      e.rut?.includes(search)
  );

  if (loading) return <Loading text="Cargando matrículas..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Matrículas</h1>
          <p className="text-gray-600 mt-1">Inscribir estudiantes en cursos</p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowModal(true)}>
          Matricular Estudiante
        </Button>
      </div>

      {/* Información */}
      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Cómo funciona la matrícula
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>Selecciona un estudiante y un curso (nivel académico)</li>
            <li>
              El estudiante será inscrito automáticamente en TODAS las
              asignaturas de ese curso
            </li>
            <li>
              Puedes especificar una sección específica o matricular en todas
              las secciones disponibles
            </li>
            <li>El sistema verificará cupos disponibles antes de matricular</li>
          </ul>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Estudiantes</p>
            <p className="text-3xl font-bold text-blue-600">
              {estudiantes.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Cursos Disponibles</p>
            <p className="text-3xl font-bold text-green-600">{cursos.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Período Activo</p>
            <p className="text-lg font-bold text-purple-600">
              {periodos.find((p) => p.activo)?.nombre || "Ninguno"}
            </p>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <MatriculaModal
          estudiantes={estudiantes}
          cursos={cursos}
          periodos={periodos}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Modal de Matrícula
const MatriculaModal = ({ estudiantes, cursos, periodos, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [formData, setFormData] = useState({
    id_estudiante: "",
    id_curso: "",
    id_periodo: "",
    seccion: "",
  });
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [search, setSearch] = useState("");

  // Filtrar estudiantes
  const filteredEstudiantes = estudiantes.filter(
    (e) =>
      e.nombres?.toLowerCase().includes(search.toLowerCase()) ||
      e.apellido_paterno?.toLowerCase().includes(search.toLowerCase()) ||
      e.rut?.includes(search)
  );

  // Cuando selecciona estudiante
  const handleSelectEstudiante = (estudiante) => {
    setSelectedEstudiante(estudiante);
    setFormData({ ...formData, id_estudiante: estudiante.id_estudiante });
    setStep(2);
  };

  // Cuando cambia curso o período
  useEffect(() => {
    if (formData.id_curso && formData.id_periodo) {
      loadAsignaturasDisponibles();
    }
  }, [formData.id_curso, formData.id_periodo]);

  const loadAsignaturasDisponibles = async () => {
    setLoadingAsignaturas(true);
    try {
      const response = await apiClient.get(
        `/matriculas/asignaturas-disponibles?id_curso=${formData.id_curso}&id_periodo=${formData.id_periodo}`
      );
      if (response.success) {
        setAsignaturasDisponibles(response.data);
      }
    } catch (error) {
      console.error("Error al cargar asignaturas:", error);
    } finally {
      setLoadingAsignaturas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post(
        "/matriculas/matricular-curso",
        formData
      );

      if (response.success) {
        toast.success(
          `✅ ${response.message}\nMatriculadas: ${response.data.matriculadas} asignaturas`,
          { duration: 5000 }
        );
        onSave();
      } else {
        toast.error(response.message || "Error al matricular");
      }
    } catch (error) {
      toast.error("Error al matricular estudiante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Matricular Estudiante" size="lg">
      <div className="space-y-6">
        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 pb-6 border-b">
          <div
            className={`flex items-center gap-2 ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">Estudiante</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div
            className={`flex items-center gap-2 ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Curso y Período</span>
          </div>
        </div>

        {/* Step 1: Seleccionar Estudiante */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Selecciona un estudiante
            </h3>

            <Input
              icon={Search}
              placeholder="Buscar por nombre o RUT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredEstudiantes.map((estudiante) => (
                <button
                  key={estudiante.id_estudiante}
                  onClick={() => handleSelectEstudiante(estudiante)}
                  className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-800">
                    {estudiante.nombres} {estudiante.apellido_paterno}{" "}
                    {estudiante.apellido_materno}
                  </p>
                  <p className="text-sm text-gray-600">RUT: {estudiante.rut}</p>
                  <p className="text-sm text-gray-500">{estudiante.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Seleccionar Curso y Período */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {/* Estudiante seleccionado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Estudiante seleccionado:
                  </p>
                  <p className="font-semibold text-blue-900">
                    {selectedEstudiante?.nombres}{" "}
                    {selectedEstudiante?.apellido_paterno}
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedEstudiante?.rut}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Cambiar
                </button>
              </div>
            </div>

            {/* Selección de curso */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curso (Nivel Académico) *
                </label>
                <select
                  value={formData.id_curso}
                  onChange={(e) =>
                    setFormData({ ...formData, id_curso: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar curso...</option>
                  {cursos.map((curso) => (
                    <option key={curso.id_curso} value={curso.id_curso}>
                      {curso.codigo} - {curso.nombre} ({curso.creditos}{" "}
                      créditos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período Académico *
                </label>
                <select
                  value={formData.id_periodo}
                  onChange={(e) =>
                    setFormData({ ...formData, id_periodo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar período...</option>
                  {periodos.map((periodo) => (
                    <option key={periodo.id_periodo} value={periodo.id_periodo}>
                      {periodo.nombre} {periodo.activo && "(Activo)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sección (opcional)
                </label>
                <input
                  type="text"
                  value={formData.seccion}
                  onChange={(e) =>
                    setFormData({ ...formData, seccion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dejar vacío para todas las secciones"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si se especifica una sección, solo se matriculará en
                  asignaturas de esa sección
                </p>
              </div>

              {/* Asignaturas disponibles */}
              {formData.id_curso && formData.id_periodo && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Asignaturas disponibles
                  </h4>

                  {loadingAsignaturas ? (
                    <p className="text-sm text-gray-600">
                      Cargando asignaturas...
                    </p>
                  ) : asignaturasDisponibles.length > 0 ? (
                    <div className="space-y-2">
                      {asignaturasDisponibles.map((asig, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">
                            • {asig.curso} - Sección {asig.seccion}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              asig.tiene_cupos
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {asig.cupo_disponible}/{asig.cupo_maximo} cupos
                          </span>
                        </div>
                      ))}
                      <p className="text-xs text-gray-600 mt-3 pt-3 border-t">
                        ℹ️ El estudiante será matriculado en{" "}
                        {asignaturasDisponibles.length} asignatura(s)
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">
                      No hay asignaturas disponibles para este curso y período
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-between gap-3 pt-6 mt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                type="button"
              >
                ← Volver
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={
                    !formData.id_curso ||
                    !formData.id_periodo ||
                    asignaturasDisponibles.length === 0
                  }
                >
                  Matricular
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
