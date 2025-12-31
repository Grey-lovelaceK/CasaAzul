// frontend/src/views/admin/AdminEstudiantes.jsx
import {
  AlertCircle,
  BookOpen,
  Edit,
  Eye,
  FileUp,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apoderadosApi, cursosApi, estudiantesApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { ImportarExcel } from "../../components/common/ImportarExcel";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";
import { Pagination, Table } from "../../components/common/Table";

const CAMPOS_IMPORTACION = [
  { nombre: "rut", label: "RUT", requerido: true, ejemplo: "12.345.678-9" },
  {
    nombre: "nombres",
    label: "Nombres",
    requerido: true,
    ejemplo: "Juan Carlos",
  },
  {
    nombre: "apellido_paterno",
    label: "Apellido Paterno",
    requerido: true,
    ejemplo: "González",
  },
  {
    nombre: "apellido_materno",
    label: "Apellido Materno",
    requerido: true,
    ejemplo: "Pérez",
  },
  {
    nombre: "email",
    label: "Email",
    requerido: true,
    ejemplo: "juan@email.com",
  },
  { nombre: "telefono", label: "Teléfono", ejemplo: "+56912345678" },
  {
    nombre: "fecha_nacimiento",
    label: "Fecha Nacimiento",
    ejemplo: "2010-05-15",
  },
  { nombre: "direccion", label: "Dirección", ejemplo: "Av. Principal 123" },
  { nombre: "genero", label: "Género (M/F)", ejemplo: "M" },
  { nombre: "curso", label: "Código Curso", ejemplo: "1B" },
  { nombre: "apoderado_rut", label: "RUT Apoderado", ejemplo: "11.222.333-4" },
  { nombre: "apoderado_nombres", label: "Nombres Apoderado", ejemplo: "María" },
  {
    nombre: "apoderado_apellido_paterno",
    label: "Ap. Paterno Apoderado",
    ejemplo: "López",
  },
  {
    nombre: "apoderado_apellido_materno",
    label: "Ap. Materno Apoderado",
    ejemplo: "Soto",
  },
  {
    nombre: "apoderado_telefono",
    label: "Teléfono Apoderado",
    ejemplo: "+56998765432",
  },
  {
    nombre: "apoderado_email",
    label: "Email Apoderado",
    ejemplo: "maria@email.com",
  },
  { nombre: "parentesco", label: "Parentesco", ejemplo: "madre" },
];

export const AdminEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtros, setFiltros] = useState({ id_curso: "", sin_curso: false });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showMatricularModal, setShowMatricularModal] = useState(false);
  const [showRematricularModal, setShowRematricularModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    loadData();
  }, [search, filtros, pagination.current_page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estRes, cursosRes] = await Promise.all([
        estudiantesApi.getAll({
          search,
          page: pagination.current_page,
          per_page: 15,
          ...filtros,
        }),
        cursosApi.getAll({ activos: true }),
      ]);
      if (estRes.success) {
        setEstudiantes(estRes.data.data || estRes.data);
        if (estRes.data.current_page) {
          setPagination({
            current_page: estRes.data.current_page,
            last_page: estRes.data.last_page,
            total: estRes.data.total,
          });
        }
      }
      if (cursosRes.success) {
        setCursos(cursosRes.data.data || cursosRes.data);
      }
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (datos) => {
    let creados = 0,
      actualizados = 0,
      errores = 0;

    for (const reg of datos) {
      try {
        let idCurso = null;
        if (reg.curso) {
          const curso = cursos.find(
            (c) => c.nivel?.codigo?.toLowerCase() === reg.curso.toLowerCase()
          );
          if (curso) idCurso = curso.id_curso;
        }

        const data = {
          rut: reg.rut,
          nombres: reg.nombres,
          apellido_paterno: reg.apellido_paterno,
          apellido_materno: reg.apellido_materno,
          email: reg.email,
          telefono: reg.telefono,
          fecha_nacimiento: reg.fecha_nacimiento,
          direccion: reg.direccion,
          genero: reg.genero,
          id_curso_actual: idCurso,
          id_estado: 1,
        };

        const existente = estudiantes.find(
          (e) =>
            e.rut?.replace(/[^0-9kK]/g, "") ===
            reg.rut?.replace(/[^0-9kK]/g, "")
        );

        let response;
        if (existente) {
          response = await estudiantesApi.update(existente.id_estudiante, data);
          if (response.success) actualizados++;
        } else {
          response = await estudiantesApi.create(data);
          if (response.success) {
            creados++;
            // Crear apoderado si viene en los datos
            if (reg.apoderado_rut && reg.apoderado_nombres) {
              try {
                const apodRes = await apoderadosApi.create({
                  rut: reg.apoderado_rut,
                  nombres: reg.apoderado_nombres,
                  apellido_paterno: reg.apoderado_apellido_paterno || "",
                  apellido_materno: reg.apoderado_apellido_materno || "",
                  telefono: reg.apoderado_telefono || "",
                  email: reg.apoderado_email || "",
                });
                if (apodRes.success && response.data?.id_estudiante) {
                  await apoderadosApi.asignarEstudiante(
                    apodRes.data.id_apoderado,
                    response.data.id_estudiante,
                    reg.parentesco || "tutor_legal"
                  );
                }
              } catch (apodError) {
                console.warn("Error creando apoderado:", apodError);
              }
            }
          }
        }
        if (!response.success) errores++;
      } catch (error) {
        errores++;
      }
    }

    loadData();
    return {
      success: true,
      message: "Importación completada",
      detalles: { creados, actualizados, errores },
    };
  };

  const handleDelete = async (est) => {
    if (!confirm(`¿Eliminar a ${est.nombres} ${est.apellido_paterno}?`)) return;
    try {
      const res = await estudiantesApi.delete(est.id_estudiante);
      if (res.success) {
        toast.success("Estudiante eliminado");
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const totalEstudiantes = pagination.total || estudiantes.length;
  const conCurso = estudiantes.filter((e) => e.id_curso_actual).length;
  const sinCurso = estudiantes.filter((e) => !e.id_curso_actual).length;

  const columns = [
    {
      header: "RUT",
      render: (row) => <span className="font-mono text-sm">{row.rut}</span>,
    },
    {
      header: "Nombre Completo",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">
            {row.nombres} {row.apellido_paterno} {row.apellido_materno}
          </p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Curso Actual",
      render: (row) => {
        if (row.id_curso_actual) {
          const curso = cursos.find((c) => c.id_curso === row.id_curso_actual);
          return (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {curso?.nivel?.nombre ||
                row.curso_actual?.nivel?.nombre ||
                "Asignado"}
            </span>
          );
        }
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            Sin curso
          </span>
        );
      },
    },
    {
      header: "Teléfono",
      render: (row) => row.telefono || "-",
    },
    {
      header: "Estado",
      render: (row) => {
        const isActivo = row.id_estado === 1 || row.estado?.nombre === "Activo";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActivo
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {isActivo ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      header: "Acciones",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              setEstudianteSeleccionado(row);
              setShowDetalleModal(true);
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEstudianteSeleccionado(row);
              setShowMatricularModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Matricular"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEstudianteSeleccionado(row);
              setModoEdicion(true);
              setShowFormModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de estudiantes y matrículas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => setShowRematricularModal(true)}
          >
            Rematricular
          </Button>
          <Button
            variant="outline"
            icon={FileUp}
            onClick={() => setShowImportModal(true)}
          >
            Importar Excel
          </Button>
          <Button
            icon={UserPlus}
            onClick={() => {
              setEstudianteSeleccionado(null);
              setModoEdicion(false);
              setShowFormModal(true);
            }}
          >
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total Estudiantes"
          value={totalEstudiantes}
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="w-8 h-8" />}
          title="Con Curso"
          value={conCurso}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-8 h-8" />}
          title="Sin Curso"
          value={sinCurso}
          subtitle="Pendientes"
          color={sinCurso > 0 ? "orange" : "green"}
        />
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Cursos Activos"
          value={cursos.length}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              icon={Search}
              placeholder="Buscar por nombre, RUT o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filtros.id_curso}
            onChange={(e) =>
              setFiltros({ ...filtros, id_curso: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los cursos</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nivel?.nombre || c.nombre}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filtros.sin_curso}
              onChange={(e) =>
                setFiltros({ ...filtros, sin_curso: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Solo sin curso</span>
          </label>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        {loading ? (
          <Loading text="Cargando estudiantes..." />
        ) : (
          <>
            <Table columns={columns} data={estudiantes} />
            {pagination.last_page > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(page) =>
                  setPagination({ ...pagination, current_page: page })
                }
              />
            )}
          </>
        )}
      </Card>

      {/* Modales */}
      {showFormModal && (
        <FormEstudianteModal
          estudiante={estudianteSeleccionado}
          cursos={cursos}
          modoEdicion={modoEdicion}
          onClose={() => {
            setShowFormModal(false);
            setEstudianteSeleccionado(null);
          }}
          onSave={() => {
            loadData();
            setShowFormModal(false);
            setEstudianteSeleccionado(null);
          }}
        />
      )}

      <ImportarExcel
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        campos={CAMPOS_IMPORTACION}
        titulo="Importar Estudiantes desde Excel"
        nombreArchivo="plantilla_estudiantes"
        plantillaData={[
          {
            RUT: "12.345.678-9",
            Nombres: "Juan Carlos",
            "Apellido Paterno": "González",
            "Apellido Materno": "Pérez",
            Email: "juan@email.com",
            Teléfono: "+56912345678",
            "Fecha Nacimiento": "2010-05-15",
            Dirección: "Av. Principal 123",
            "Género (M/F)": "M",
            "Código Curso": "1B",
            "RUT Apoderado": "11.222.333-4",
            "Nombres Apoderado": "María",
            "Ap. Paterno Apoderado": "López",
            "Ap. Materno Apoderado": "Soto",
            "Teléfono Apoderado": "+56998765432",
            "Email Apoderado": "maria@email.com",
            Parentesco: "madre",
          },
        ]}
      />

      {showDetalleModal && estudianteSeleccionado && (
        <DetalleEstudianteModal
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowDetalleModal(false);
            setEstudianteSeleccionado(null);
          }}
          onEditar={() => {
            setShowDetalleModal(false);
            setModoEdicion(true);
            setShowFormModal(true);
          }}
        />
      )}

      {showMatricularModal && estudianteSeleccionado && (
        <MatricularModal
          estudiante={estudianteSeleccionado}
          cursos={cursos}
          onClose={() => {
            setShowMatricularModal(false);
            setEstudianteSeleccionado(null);
          }}
          onSave={() => {
            loadData();
            setShowMatricularModal(false);
            setEstudianteSeleccionado(null);
          }}
        />
      )}

      {showRematricularModal && (
        <RematricularModal
          estudiantes={estudiantes}
          cursos={cursos}
          onClose={() => setShowRematricularModal(false)}
          onSave={() => {
            loadData();
            setShowRematricularModal(false);
          }}
        />
      )}
    </div>
  );
};

// =====================================================
// MODAL: Formulario Crear/Editar Estudiante con Apoderado
// =====================================================
const FormEstudianteModal = ({
  estudiante,
  cursos,
  modoEdicion,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("estudiante");
  const [apoderados, setApoderados] = useState([]);

  const [formData, setFormData] = useState({
    rut: estudiante?.rut || "",
    nombres: estudiante?.nombres || "",
    apellido_paterno: estudiante?.apellido_paterno || "",
    apellido_materno: estudiante?.apellido_materno || "",
    email: estudiante?.email || "",
    telefono: estudiante?.telefono || "",
    fecha_nacimiento: estudiante?.fecha_nacimiento || "",
    genero: estudiante?.genero || "",
    nacionalidad: estudiante?.nacionalidad || "Chilena",
    direccion: estudiante?.direccion || "",
    observaciones_medicas: estudiante?.observaciones_medicas || "",
    id_curso_actual: estudiante?.id_curso_actual || "",
    id_estado: estudiante?.id_estado || 1,
  });

  const [apoderadoData, setApoderadoData] = useState({
    rut: "",
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    telefono_emergencia: "",
    ocupacion: "",
    parentesco: "tutor_legal",
    es_tutor_principal: true,
  });

  useEffect(() => {
    if (modoEdicion && estudiante) {
      loadApoderados();
    }
  }, [estudiante, modoEdicion]);

  const loadApoderados = async () => {
    try {
      const response = await estudiantesApi.getById(estudiante.id_estudiante);
      if (response.success && response.data.apoderados) {
        setApoderados(response.data.apoderados);
      }
    } catch (error) {
      console.error("Error cargando apoderados:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApoderadoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApoderadoData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      let estudianteId = estudiante?.id_estudiante;

      if (modoEdicion) {
        response = await estudiantesApi.update(estudianteId, formData);
      } else {
        response = await estudiantesApi.create(formData);
        if (response.success) {
          estudianteId = response.data.id_estudiante;
        }
      }

      if (!response.success) {
        toast.error(response.message || "Error al guardar estudiante");
        setLoading(false);
        return;
      }

      // Crear apoderado si se llenaron los datos y es nuevo estudiante
      if (apoderadoData.rut && apoderadoData.nombres && !modoEdicion) {
        try {
          const apodRes = await apoderadosApi.create({
            rut: apoderadoData.rut,
            nombres: apoderadoData.nombres,
            apellido_paterno: apoderadoData.apellido_paterno,
            apellido_materno: apoderadoData.apellido_materno,
            email: apoderadoData.email,
            telefono: apoderadoData.telefono,
            telefono_emergencia: apoderadoData.telefono_emergencia,
            ocupacion: apoderadoData.ocupacion,
          });

          if (apodRes.success) {
            await apoderadosApi.asignarEstudiante(
              apodRes.data.id_apoderado,
              estudianteId,
              apoderadoData.parentesco,
              apoderadoData.es_tutor_principal
            );
          }
        } catch (apodError) {
          console.warn("Error creando apoderado:", apodError);
          toast.error("Estudiante creado, pero hubo un error con el apoderado");
        }
      }

      toast.success(
        modoEdicion
          ? "Estudiante actualizado"
          : "Estudiante creado exitosamente"
      );
      onSave();
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={modoEdicion ? "Editar Estudiante" : "Nuevo Estudiante"}
      size="xl"
    >
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("estudiante")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "estudiante"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Datos del Estudiante
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("apoderado")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "apoderado"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Apoderado
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Tab Estudiante */}
        {activeTab === "estudiante" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="RUT *"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12.345.678-9"
                required
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nombres *"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido Paterno *"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido Materno *"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56912345678"
              />
              <Input
                label="Fecha Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nacionalidad"
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso Actual
                </label>
                <select
                  name="id_curso_actual"
                  value={formData.id_curso_actual}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {cursos.map((c) => (
                    <option key={c.id_curso} value={c.id_curso}>
                      {c.nivel?.nombre || c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Av. Principal 123, Santiago"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Médicas
              </label>
              <textarea
                name="observaciones_medicas"
                value={formData.observaciones_medicas}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Alergias, condiciones médicas, etc."
              />
            </div>
          </div>
        )}

        {/* Tab Apoderado */}
        {activeTab === "apoderado" && (
          <div className="space-y-4">
            {/* Lista de apoderados existentes (si está editando) */}
            {modoEdicion && apoderados.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">
                  Apoderados registrados:
                </h4>
                <div className="space-y-2">
                  {apoderados.map((apod) => (
                    <div
                      key={apod.id_apoderado}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {apod.nombres} {apod.apellido_paterno}
                        </p>
                        <p className="text-sm text-gray-500">
                          {apod.parentesco} • {apod.telefono}
                        </p>
                      </div>
                      {apod.es_tutor_principal && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          Tutor Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                {modoEdicion
                  ? "Puedes agregar un nuevo apoderado al estudiante"
                  : "Datos del apoderado o tutor legal (opcional)"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="RUT Apoderado"
                name="rut"
                value={apoderadoData.rut}
                onChange={handleApoderadoChange}
                placeholder="11.222.333-4"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parentesco
                </label>
                <select
                  name="parentesco"
                  value={apoderadoData.parentesco}
                  onChange={handleApoderadoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tutor_legal">Tutor Legal</option>
                  <option value="padre">Padre</option>
                  <option value="madre">Madre</option>
                  <option value="abuelo">Abuelo</option>
                  <option value="abuela">Abuela</option>
                  <option value="tio">Tío</option>
                  <option value="tia">Tía</option>
                  <option value="hermano">Hermano</option>
                  <option value="hermana">Hermana</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nombres"
                name="nombres"
                value={apoderadoData.nombres}
                onChange={handleApoderadoChange}
              />
              <Input
                label="Apellido Paterno"
                name="apellido_paterno"
                value={apoderadoData.apellido_paterno}
                onChange={handleApoderadoChange}
              />
              <Input
                label="Apellido Materno"
                name="apellido_materno"
                value={apoderadoData.apellido_materno}
                onChange={handleApoderadoChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono"
                name="telefono"
                value={apoderadoData.telefono}
                onChange={handleApoderadoChange}
                placeholder="+56912345678"
              />
              <Input
                label="Teléfono Emergencia"
                name="telefono_emergencia"
                value={apoderadoData.telefono_emergencia}
                onChange={handleApoderadoChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={apoderadoData.email}
                onChange={handleApoderadoChange}
              />
              <Input
                label="Ocupación"
                name="ocupacion"
                value={apoderadoData.ocupacion}
                onChange={handleApoderadoChange}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="es_tutor_principal"
                checked={apoderadoData.es_tutor_principal}
                onChange={handleApoderadoChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Es tutor principal</span>
            </label>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {modoEdicion ? "Guardar Cambios" : "Crear Estudiante"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =====================================================
// MODAL: Detalle del Estudiante
// =====================================================
const DetalleEstudianteModal = ({ estudiante, onClose, onEditar }) => {
  const [detalles, setDetalles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetalles();
  }, [estudiante]);

  const loadDetalles = async () => {
    try {
      const response = await estudiantesApi.getById(estudiante.id_estudiante);
      if (response.success) {
        setDetalles(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar detalles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Detalle del Estudiante" size="lg">
      {loading ? (
        <Loading text="Cargando..." />
      ) : (
        <div className="space-y-6">
          {/* Info Principal */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {estudiante.nombres?.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">
                {estudiante.nombres} {estudiante.apellido_paterno}{" "}
                {estudiante.apellido_materno}
              </h3>
              <p className="text-gray-500">{estudiante.rut}</p>
              <p className="text-sm text-gray-500">{estudiante.email}</p>
            </div>
            <Button variant="outline" size="sm" icon={Edit} onClick={onEditar}>
              Editar
            </Button>
          </div>

          {/* Datos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Curso Actual</p>
              <p className="font-medium">
                {detalles?.curso_actual?.nivel?.nombre || "Sin asignar"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Estado</p>
              <p className="font-medium">
                {detalles?.estado?.nombre || "Activo"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium">{estudiante.telefono || "-"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Fecha Nacimiento</p>
              <p className="font-medium">
                {estudiante.fecha_nacimiento || "-"}
              </p>
            </div>
          </div>

          {/* Apoderados */}
          {detalles?.apoderados?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Apoderados</h4>
              <div className="space-y-2">
                {detalles.apoderados.map((apod) => (
                  <div
                    key={apod.id_apoderado}
                    className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {apod.nombres} {apod.apellido_paterno}
                      </p>
                      <p className="text-sm text-gray-500">
                        {apod.parentesco} • {apod.telefono}
                      </p>
                      {apod.email && (
                        <p className="text-sm text-gray-500">{apod.email}</p>
                      )}
                    </div>
                    {apod.es_tutor_principal && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Tutor Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dirección */}
          {estudiante.direccion && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Dirección</h4>
              <p className="text-gray-600">{estudiante.direccion}</p>
            </div>
          )}

          {/* Observaciones médicas */}
          {estudiante.observaciones_medicas && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Observaciones Médicas
              </h4>
              <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">
                {estudiante.observaciones_medicas}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// =====================================================
// MODAL: Matricular en Curso
// =====================================================
const MatricularModal = ({ estudiante, cursos, onClose, onSave }) => {
  const [idCurso, setIdCurso] = useState(estudiante.id_curso_actual || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idCurso) {
      toast.error("Selecciona un curso");
      return;
    }

    setLoading(true);
    try {
      const response = await estudiantesApi.update(estudiante.id_estudiante, {
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-900">
            {estudiante.nombres} {estudiante.apellido_paterno}
          </p>
          <p className="text-sm text-blue-700">{estudiante.rut}</p>
        </div>

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
            })`
          }
          getOptionValue={(c) => c.id_curso}
        />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Nota:</strong> Al asignar un curso, el estudiante quedará
            matriculado automáticamente en todas las asignaturas del curso.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Matricular
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// =====================================================
// MODAL: Rematricular Estudiantes (siguiente año/nivel)
// =====================================================
const RematricularModal = ({ estudiantes, cursos, onClose, onSave }) => {
  const [seleccionados, setSeleccionados] = useState([]);
  const [cursoDestino, setCursoDestino] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("sin_curso");

  const estudiantesSinCurso = estudiantes.filter((e) => !e.id_curso_actual);

  const estudiantesFiltrados = (
    modo === "sin_curso" ? estudiantesSinCurso : estudiantes
  ).filter(
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

  const handleRematricular = async () => {
    if (!cursoDestino || seleccionados.length === 0) {
      toast.error("Selecciona un curso y al menos un estudiante");
      return;
    }

    setLoading(true);
    let exitosos = 0;
    let errores = 0;

    for (const idEst of seleccionados) {
      try {
        const response = await estudiantesApi.update(idEst, {
          id_curso_actual: cursoDestino,
        });
        if (response.success) exitosos++;
        else errores++;
      } catch (error) {
        errores++;
      }
    }

    toast.success(
      `${exitosos} estudiantes rematriculados${
        errores > 0 ? `, ${errores} con errores` : ""
      }`
    );
    setLoading(false);
    onSave();
  };

  return (
    <Modal isOpen onClose={onClose} title="Rematricular Estudiantes" size="lg">
      <div className="space-y-6">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 ¿Qué es rematricular?
          </h4>
          <p className="text-sm text-blue-700">
            Usa esta función para inscribir estudiantes que ya están en el
            sistema en un nuevo curso (por ejemplo, al pasar de año). Sus datos
            personales y de apoderado se mantienen.
          </p>
        </div>

        {/* Selector de modo */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModo("sin_curso")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              modo === "sin_curso"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Sin curso ({estudiantesSinCurso.length})
          </button>
          <button
            type="button"
            onClick={() => setModo("todos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              modo === "todos"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos los estudiantes
          </button>
        </div>

        {/* Curso destino */}
        <Select
          label="Curso destino"
          value={cursoDestino}
          onChange={setCursoDestino}
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

        {/* Lista */}
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
            {estudiantesFiltrados.length > 0 ? (
              estudiantesFiltrados.map((est) => (
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
                      {est.nombres} {est.apellido_paterno}{" "}
                      {est.apellido_materno}
                    </p>
                    <p className="text-xs text-gray-500">{est.rut}</p>
                  </div>
                  {est.id_curso_actual && (
                    <span className="text-xs text-gray-400">
                      Actual:{" "}
                      {cursos.find((c) => c.id_curso === est.id_curso_actual)
                        ?.nivel?.codigo || "N/A"}
                    </span>
                  )}
                </label>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">
                No hay estudiantes para mostrar
              </p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleRematricular}
            loading={loading}
            disabled={!cursoDestino || seleccionados.length === 0}
          >
            Rematricular {seleccionados.length} estudiantes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminEstudiantes;
