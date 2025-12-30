// frontend/src/views/admin/AdminProfesores.jsx
// Esta vista es similar a AdminEstudiantes pero para profesores

import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi, profesoresApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Table } from "../../components/common/Table";
import { ESTADO_COLORS } from "../../utils/constants";
import { formatRut } from "../../utils/formatters";

export const AdminProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
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
        <span className="font-medium">
          {row.nombres} {row.apellido_paterno}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Especialidad",
      render: (row) => (
        <span className="text-gray-600">{row.especialidad || "-"}</span>
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
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setEditando(row);
              setShowModal(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id_profesor)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profesores</h1>
          <p className="text-gray-600 mt-1">Gestión de profesores</p>
        </div>
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

      <Card>
        <Input
          icon={Search}
          placeholder="Buscar profesor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <Card>
        <Table columns={columns} data={profesores} loading={loading} />
      </Card>

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
          }}
        />
      )}
    </div>
  );
};

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
      id_estado: estados[0]?.id_estado || "4",
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
          />
          <Input
            label="Especialidad"
            name="especialidad"
            value={formData.especialidad}
            onChange={(e) =>
              setFormData({ ...formData, especialidad: e.target.value })
            }
            placeholder="Ej: Matemáticas"
          />
        </div>

        {!profesor && (
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={formData.crear_usuario}
                onChange={(e) =>
                  setFormData({ ...formData, crear_usuario: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Crear usuario de acceso
              </span>
            </label>
            {formData.crear_usuario && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <Input
                  label="Usuario"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required={formData.crear_usuario}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
