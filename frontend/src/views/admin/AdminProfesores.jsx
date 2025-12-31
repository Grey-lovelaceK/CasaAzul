// frontend/src/views/admin/AdminProfesores.jsx

import { BookOpen, Edit, FileUp, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi, profesoresApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { ImportarExcel } from "../../components/common/ImportarExcel";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Table } from "../../components/common/Table";
import { ESTADO_COLORS } from "../../utils/constants";
import { formatRut } from "../../utils/formatters";

// Campos para importación Excel
const CAMPOS_IMPORTACION = [
  {
    nombre: "rut",
    label: "RUT",
    requerido: true,
    tipo: "rut",
    ejemplo: "12.345.678-9",
  },
  {
    nombre: "nombres",
    label: "Nombres",
    requerido: true,
    ejemplo: "María Elena",
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
    tipo: "email",
    ejemplo: "maria@colegio.cl",
  },
  {
    nombre: "telefono",
    label: "Teléfono",
    requerido: false,
    ejemplo: "+56912345678",
  },
  {
    nombre: "especialidad",
    label: "Especialidad",
    requerido: false,
    ejemplo: "Matemáticas",
  },
];

export const AdminProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAsignaturasModal, setShowAsignaturasModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [search, setSearch] = useState("");
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    loadProfesores();
    loadEstados();
  }, [search]);

  const loadProfesores = async () => {
    setLoading(true);
    try {
      const response = await profesoresApi.getAll({ search });
      if (response.success) {
        setProfesores(response.data.data || response.data);
      }
    } catch (error) {
      toast.error("Error al cargar profesores");
    } finally {
      setLoading(false);
    }
  };

  const loadEstados = async () => {
    try {
      const response = await dashboardApi.getEstados("profesor");
      if (response.success) setEstados(response.data);
    } catch (error) {
      console.error("Error al cargar estados");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este profesor?")) return;
    try {
      const response = await profesoresApi.delete(id);
      if (response.success) {
        toast.success("Profesor eliminado");
        loadProfesores();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // Importar profesores desde Excel
  const handleImport = async (datos) => {
    try {
      let creados = 0;
      let errores = 0;

      for (const profesor of datos) {
        try {
          const response = await profesoresApi.create({
            ...profesor,
            id_estado:
              estados.find((e) => e.nombre === "Activo")?.id_estado || 4,
          });
          if (response.success) {
            creados++;
          } else {
            errores++;
          }
        } catch {
          errores++;
        }
      }

      loadProfesores();

      return {
        success: true,
        message: `Importación completada`,
        detalles: { creados, errores },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Error al importar profesores",
      };
    }
  };

  const columns = [
    {
      header: "RUT",
      render: (row) => (
        <span className="font-medium">{formatRut(row.rut)}</span>
      ),
    },
    {
      header: "Nombre",
      render: (row) => (
        <div>
          <span className="font-medium text-gray-800">
            {row.nombres} {row.apellido_paterno} {row.apellido_materno}
          </span>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: "Especialidad",
      render: (row) => (
        <span className="text-gray-600">{row.especialidad || "-"}</span>
      ),
    },
    {
      header: "Asignaturas",
      render: (row) => (
        <span className="text-blue-600 font-medium">
          {row.asignaturas_count || 0}
        </span>
      ),
    },
    {
      header: "Estado",
      render: (row) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            ESTADO_COLORS[row.estado?.nombre] || "bg-gray-100"
          }`}
        >
          {row.estado?.nombre || "Sin estado"}
        </span>
      ),
    },
    {
      header: "Acciones",
      cellClassName: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => {
              setProfesorSeleccionado(row);
              setShowAsignaturasModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Ver asignaturas"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditando(row);
              setShowModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id_profesor)}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profesores</h1>
          <p className="text-gray-600 mt-1">
            {profesores.length} profesores registrados
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
          <Button
            icon={Plus}
            onClick={() => {
              setEditando(null);
              setShowModal(true);
            }}
          >
            Nuevo Profesor
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <Card>
        <Input
          icon={Search}
          placeholder="Buscar por nombre, RUT, email o especialidad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Tabla */}
      <Card>
        <Table columns={columns} data={profesores} loading={loading} />
      </Card>

      {/* Modal Crear/Editar */}
      {showModal && (
        <ProfesorModal
          profesor={editando}
          estados={estados}
          onClose={() => {
            setShowModal(false);
            setEditando(null);
          }}
          onSave={() => {
            loadProfesores();
            setShowModal(false);
            setEditando(null);
          }}
        />
      )}

      {/* Modal Importar */}
      <ImportarExcel
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        campos={CAMPOS_IMPORTACION}
        titulo="Importar Profesores desde Excel"
        nombreArchivo="plantilla_profesores"
        plantillaData={[
          {
            RUT: "12.345.678-9",
            Nombres: "María Elena",
            "Apellido Paterno": "González",
            "Apellido Materno": "Pérez",
            Email: "maria@colegio.cl",
            Teléfono: "+56912345678",
            Especialidad: "Matemáticas",
          },
        ]}
      />

      {/* Modal Ver Asignaturas */}
      {showAsignaturasModal && profesorSeleccionado && (
        <AsignaturasProfesorModal
          profesor={profesorSeleccionado}
          onClose={() => {
            setShowAsignaturasModal(false);
            setProfesorSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

// Modal de Profesor
const ProfesorModal = ({ profesor, estados, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    profesor || {
      rut: "",
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      telefono: "",
      especialidad: "",
      id_estado: estados.find((e) => e.nombre === "Activo")?.id_estado || "4",
      crear_usuario: false,
      username: "",
      password: "",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = profesor
        ? await profesoresApi.update(profesor.id_profesor, formData)
        : await profesoresApi.create(formData);

      if (response.success) {
        toast.success(profesor ? "Profesor actualizado" : "Profesor creado");
        onSave();
      } else {
        toast.error(response.message);
      }
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
      title={profesor ? "Editar Profesor" : "Nuevo Profesor"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="RUT"
            name="rut"
            value={formData.rut}
            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
            placeholder="12.345.678-9"
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="profesor@colegio.cl"
            required
          />
        </div>

        <Input
          label="Nombres"
          name="nombres"
          value={formData.nombres}
          onChange={(e) =>
            setFormData({ ...formData, nombres: e.target.value })
          }
          placeholder="María Elena"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Apellido Paterno"
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={(e) =>
              setFormData({ ...formData, apellido_paterno: e.target.value })
            }
            required
          />
          <Input
            label="Apellido Materno"
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={(e) =>
              setFormData({ ...formData, apellido_materno: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={(e) =>
              setFormData({ ...formData, telefono: e.target.value })
            }
            placeholder="+56 9 1234 5678"
          />
          <Input
            label="Especialidad"
            name="especialidad"
            value={formData.especialidad}
            onChange={(e) =>
              setFormData({ ...formData, especialidad: e.target.value })
            }
            placeholder="Ej: Matemáticas, Lenguaje"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.id_estado}
            onChange={(e) =>
              setFormData({ ...formData, id_estado: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            {estados.map((estado) => (
              <option key={estado.id_estado} value={estado.id_estado}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Crear usuario de acceso */}
        {!profesor && (
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.crear_usuario}
                onChange={(e) =>
                  setFormData({ ...formData, crear_usuario: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium">
                Crear usuario de acceso al sistema
              </span>
            </label>

            {formData.crear_usuario && (
              <div className="grid grid-cols-2 gap-4 ml-6 p-4 bg-gray-50 rounded-lg">
                <Input
                  label="Usuario"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="usuario"
                  required={formData.crear_usuario}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required={formData.crear_usuario}
                />
              </div>
            )}
          </div>
        )}

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

// Modal Ver Asignaturas del Profesor
const AsignaturasProfesorModal = ({ profesor, onClose }) => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  const loadAsignaturas = async () => {
    try {
      const response = await profesoresApi.getAsignaturas(profesor.id_profesor);
      if (response.success) {
        setAsignaturas(response.data.asignaturas || response.data);
      }
    } catch (error) {
      toast.error("Error al cargar asignaturas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Asignaturas de ${profesor.nombres}`}
      size="lg"
    >
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {asignaturas.length > 0 ? (
            <div className="space-y-3">
              {asignaturas.map((asig, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {asig.materia?.nombre ||
                        asig.curso?.nombre ||
                        "Sin nombre"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {asig.curso?.nivel?.nombre} • {asig.periodo?.nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {asig.horario || "Sin horario"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Sala: {asig.sala || "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Este profesor no tiene asignaturas asignadas</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
