// frontend/src/views/admin/AdminAsignaturas.jsx

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi, dashboardApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Table } from "../../components/common/Table";

export const AdminAsignaturas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asigRes, periodosRes] = await Promise.all([
        asignaturasApi.getAll(),
        dashboardApi.getPeriodos(),
      ]);

      if (asigRes.success) setAsignaturas(asigRes.data.data || asigRes.data);
      if (periodosRes.success) setPeriodos(periodosRes.data);

      // Cargar cursos y profesores desde el backend
      const cursosRes = await fetch("http://localhost:8000/api/v1/cursos", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json());
      if (cursosRes.success) setCursos(cursosRes.data.data || cursosRes.data);

      const profRes = await fetch("http://localhost:8000/api/v1/profesores", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((r) => r.json());
      if (profRes.success) setProfesores(profRes.data.data || profRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Curso",
      render: (row) => (
        <span className="font-medium">{row.curso?.nombre || "-"}</span>
      ),
    },
    {
      header: "Sección",
      accessor: "seccion",
    },
    {
      header: "Período",
      render: (row) => row.periodo?.nombre || "-",
    },
    {
      header: "Profesor",
      render: (row) =>
        row.profesor
          ? `${row.profesor.nombres} ${row.profesor.apellido_paterno}`
          : "Sin asignar",
    },
    {
      header: "Cupos",
      render: (row) => `${row.cupo_disponible}/${row.cupo_maximo}`,
    },
    {
      header: "Estado",
      render: (row) => (
        <span className="badge badge-success">
          {row.estado?.nombre || "Activa"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Asignaturas</h1>
          <p className="text-gray-600 mt-1">
            Gestión de asignaturas y secciones
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          Nueva Asignatura
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={asignaturas} loading={loading} />
      </Card>

      {showModal && (
        <AsignaturaModal
          cursos={cursos}
          periodos={periodos}
          profesores={profesores}
          onClose={() => setShowModal(false)}
          onSave={() => {
            loadData();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

const AsignaturaModal = ({ cursos, periodos, profesores, onClose, onSave }) => {
  const [form, setForm] = useState({
    id_curso: "",
    id_periodo: "",
    id_profesor: "",
    seccion: "",
    cupo_maximo: 30,
    horario: "",
    sala: "",
    id_estado: "9",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, cupo_disponible: form.cupo_maximo };
      const response = await asignaturasApi.create(data);
      if (response.success) {
        toast.success("Asignatura creada");
        onSave();
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Nueva Asignatura" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Curso</label>
            <select
              value={form.id_curso}
              onChange={(e) => setForm({ ...form, id_curso: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Seleccionar...</option>
              {cursos.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.codigo} - {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Período</label>
            <select
              value={form.id_periodo}
              onChange={(e) => setForm({ ...form, id_periodo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Seleccionar...</option>
              {periodos.map((p) => (
                <option key={p.id_periodo} value={p.id_periodo}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sección"
            value={form.seccion}
            onChange={(e) => setForm({ ...form, seccion: e.target.value })}
            placeholder="Ej: A, B"
            required
          />
          <Input
            label="Cupo Máximo"
            type="number"
            value={form.cupo_maximo}
            onChange={(e) => setForm({ ...form, cupo_maximo: e.target.value })}
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profesor</label>
          <select
            value={form.id_profesor}
            onChange={(e) => setForm({ ...form, id_profesor: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Sin asignar</option>
            {profesores.map((p) => (
              <option key={p.id_profesor} value={p.id_profesor}>
                {p.nombres} {p.apellido_paterno} - {p.especialidad}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Horario"
            value={form.horario}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
            placeholder="Lunes 8:00-10:00"
          />
          <Input
            label="Sala"
            value={form.sala}
            onChange={(e) => setForm({ ...form, sala: e.target.value })}
            placeholder="Sala 101"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Crear Asignatura
          </Button>
        </div>
      </form>
    </Modal>
  );
};
