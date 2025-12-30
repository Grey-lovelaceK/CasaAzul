// frontend/src/views/admin/AdminEstudiantes.jsx

import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { dashboardApi, estudiantesApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Pagination, Table } from "../../components/common/Table";
import { ESTADO_COLORS } from "../../utils/constants";
import { formatRut } from "../../utils/formatters";

export const AdminEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
  });
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    loadEstudiantes();
    loadEstados();
  }, [search, pagination.current_page]);

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const response = await estudiantesApi.getAll({
        search,
        page: pagination.current_page,
        per_page: 15,
      });

      if (response.success) {
        setEstudiantes(response.data.data || response.data);
        if (response.data.current_page) {
          setPagination({
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total,
          });
        }
      }
    } catch (error) {
      toast.error("Error al cargar estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const loadEstados = async () => {
    try {
      const response = await dashboardApi.getEstados("estudiante");
      if (response.success) {
        setEstados(response.data);
      }
    } catch (error) {
      console.error("Error al cargar estados");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;

    try {
      const response = await estudiantesApi.delete(id);
      if (response.success) {
        toast.success("Estudiante eliminado exitosamente");
        loadEstudiantes();
      } else {
        toast.error(response.message || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error al eliminar estudiante");
    }
  };

  const columns = [
    {
      header: "RUT",
      accessor: "rut",
      render: (row) => (
        <span className="font-medium">{formatRut(row.rut)}</span>
      ),
    },
    {
      header: "Nombre Completo",
      render: (row) => (
        <span className="font-medium text-gray-800">
          {row.nombres} {row.apellido_paterno} {row.apellido_materno}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (row) => <span className="text-gray-600">{row.email}</span>,
    },
    {
      header: "Teléfono",
      accessor: "telefono",
      render: (row) => (
        <span className="text-gray-600">{row.telefono || "-"}</span>
      ),
    },
    {
      header: "Estado",
      render: (row) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${
            ESTADO_COLORS[row.estado?.nombre] || "bg-gray-100 text-gray-700"
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
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id_estudiante)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de estudiantes del sistema
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditando(null);
            setShowModal(true);
          }}
        >
          Nuevo Estudiante
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          icon={Search}
          placeholder="Buscar por nombre, RUT o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table columns={columns} data={estudiantes} loading={loading} />

        {!loading && estudiantes.length > 0 && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={(page) =>
              setPagination({ ...pagination, current_page: page })
            }
          />
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <EstudianteModal
          estudiante={editando}
          estados={estados}
          onClose={() => {
            setShowModal(false);
            setEditando(null);
          }}
          onSave={() => {
            loadEstudiantes();
            setShowModal(false);
            setEditando(null);
          }}
        />
      )}
    </div>
  );
};

// Modal de Estudiante
const EstudianteModal = ({ estudiante, estados, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    estudiante || {
      rut: "",
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      direccion: "",
      id_estado: estados[0]?.id_estado || "1",
    }
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = estudiante
        ? await estudiantesApi.update(estudiante.id_estudiante, formData)
        : await estudiantesApi.create(formData);

      if (response.success) {
        toast.success(
          estudiante ? "Estudiante actualizado" : "Estudiante creado"
        );
        onSave();
      } else {
        toast.error(response.message || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar estudiante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={estudiante ? "Editar Estudiante" : "Nuevo Estudiante"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="RUT"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            placeholder="12.345.678-9"
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <Input
          label="Nombres"
          name="nombres"
          value={formData.nombres}
          onChange={handleChange}
          placeholder="Juan Carlos"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Apellido Paterno"
            name="apellido_paterno"
            value={formData.apellido_paterno}
            onChange={handleChange}
            required
          />

          <Input
            label="Apellido Materno"
            name="apellido_materno"
            value={formData.apellido_materno}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Calle 123, Comuna, Ciudad"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="id_estado"
            value={formData.id_estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            {estados.map((estado) => (
              <option key={estado.id_estado} value={estado.id_estado}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
