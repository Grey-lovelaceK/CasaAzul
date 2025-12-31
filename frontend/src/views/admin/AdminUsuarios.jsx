// frontend/src/views/admin/AdminUsuarios.jsx
import { Edit, Key, Plus, Search, Shield, Trash2, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usuariosApi, profesoresApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";
import { Pagination, Table } from "../../components/common/Table";

const ROLES = [
  { id: 1, nombre: "Administrador", descripcion: "Acceso total al sistema" },
  { id: 2, nombre: "Profesor", descripcion: "Gestión de cursos y calificaciones" },
  { id: 3, nombre: "Estudiante", descripcion: "Consulta de información académica" },
];

export const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => { loadData(); }, [search, filtroRol, pagination.current_page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usuariosRes, profesoresRes] = await Promise.all([
        usuariosApi.getAll({ search, id_rol: filtroRol, page: pagination.current_page, per_page: 15 }),
        profesoresApi.getAll(),
      ]);
      if (usuariosRes.success) {
        setUsuarios(usuariosRes.data.data || usuariosRes.data);
        if (usuariosRes.data.current_page) setPagination({ current_page: usuariosRes.data.current_page, last_page: usuariosRes.data.last_page });
      }
      if (profesoresRes.success) setProfesores(profesoresRes.data.data || profesoresRes.data);
    } catch { toast.error("Error al cargar datos"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (usuario) => {
    if (usuario.id_rol === 1 && usuarios.filter(u => u.id_rol === 1).length <= 1) {
      toast.error("No puedes eliminar el único administrador"); return;
    }
    if (!confirm(`¿Eliminar usuario ${usuario.username}?`)) return;
    try {
      const response = await usuariosApi.delete(usuario.id_usuario);
      if (response.success) { toast.success("Usuario eliminado"); loadData(); }
      else toast.error(response.message);
    } catch { toast.error("Error"); }
  };

  const handleToggleActivo = async (usuario) => {
    try {
      const response = await usuariosApi.update(usuario.id_usuario, { activo: !usuario.activo });
      if (response.success) { toast.success(usuario.activo ? "Usuario desactivado" : "Usuario activado"); loadData(); }
    } catch { toast.error("Error"); }
  };

  const admins = usuarios.filter(u => u.id_rol === 1).length;
  const profesoresCount = usuarios.filter(u => u.id_rol === 2).length;
  const activos = usuarios.filter(u => u.activo).length;

  const columns = [
    { header: "Usuario", render: (row) => (
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${row.id_rol === 1 ? "bg-purple-100" : row.id_rol === 2 ? "bg-blue-100" : "bg-gray-100"}`}>
          <span className={`text-sm font-bold ${row.id_rol === 1 ? "text-purple-600" : row.id_rol === 2 ? "text-blue-600" : "text-gray-600"}`}>{row.username?.charAt(0).toUpperCase()}</span>
        </div>
        <div><p className="font-medium">{row.username}</p><p className="text-xs text-gray-500">{row.email}</p></div>
      </div>
    )},
    { header: "Rol", render: (row) => {
      const rol = ROLES.find(r => r.id === row.id_rol);
      const colors = { 1: "bg-purple-100 text-purple-700", 2: "bg-blue-100 text-blue-700", 3: "bg-green-100 text-green-700" };
      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[row.id_rol] || "bg-gray-100"}`}>{rol?.nombre || "Desconocido"}</span>;
    }},
    { header: "Vinculado a", render: (row) => {
      if (row.profesor) return <span className="text-sm">Prof. {row.profesor.nombres} {row.profesor.apellido_paterno}</span>;
      if (row.estudiante) return <span className="text-sm">Est. {row.estudiante.nombres}</span>;
      return <span className="text-gray-400 text-sm">-</span>;
    }},
    { header: "Último Acceso", render: (row) => row.ultimo_acceso ? new Date(row.ultimo_acceso).toLocaleString() : <span className="text-gray-400">Nunca</span> },
    { header: "Estado", render: (row) => (
      <button onClick={() => handleToggleActivo(row)} className={`px-2 py-1 rounded-full text-xs font-medium ${row.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {row.activo ? "Activo" : "Inactivo"}
      </button>
    )},
    { header: "Acciones", cellClassName: "text-right", render: (row) => (
      <div className="flex justify-end gap-1">
        <button onClick={() => { setUsuarioSeleccionado(row); setShowPasswordModal(true); }} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Cambiar contraseña"><Key className="w-4 h-4" /></button>
        <button onClick={() => { setUsuarioSeleccionado(row); setModoEdicion(true); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(row)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-800">Usuarios</h1><p className="text-gray-600 mt-1">Gestión de usuarios del sistema</p></div>
        <Button icon={Plus} onClick={() => { setUsuarioSeleccionado(null); setModoEdicion(false); setShowModal(true); }}>Nuevo Usuario</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-8 h-8" />} title="Total Usuarios" value={usuarios.length} color="blue" />
        <StatCard icon={<Shield className="w-8 h-8" />} title="Administradores" value={admins} color="purple" />
        <StatCard icon={<UserCheck className="w-8 h-8" />} title="Profesores" value={profesoresCount} color="green" />
        <StatCard icon={<UserCheck className="w-8 h-8" />} title="Activos" value={activos} subtitle={`${Math.round((activos/usuarios.length)*100) || 0}%`} color="blue" />
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2"><Input icon={Search} placeholder="Buscar por usuario o email..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? <Loading text="Cargando usuarios..." /> : (
          <>
            <Table columns={columns} data={usuarios} />
            {pagination.last_page > 1 && <Pagination currentPage={pagination.current_page} totalPages={pagination.last_page} onPageChange={(p) => setPagination({ ...pagination, current_page: p })} />}
          </>
        )}
      </Card>

      {showModal && <FormUsuarioModal usuario={usuarioSeleccionado} profesores={profesores} modoEdicion={modoEdicion} onClose={() => { setShowModal(false); setUsuarioSeleccionado(null); }} onSave={() => { loadData(); setShowModal(false); }} />}
      {showPasswordModal && usuarioSeleccionado && <CambiarPasswordModal usuario={usuarioSeleccionado} onClose={() => { setShowPasswordModal(false); setUsuarioSeleccionado(null); }} />}
    </div>
  );
};

const FormUsuarioModal = ({ usuario, profesores, modoEdicion, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: usuario?.username || "",
    email: usuario?.email || "",
    password: "",
    password_confirmation: "",
    id_rol: usuario?.id_rol || 1,
    id_profesor: usuario?.id_profesor || "",
    activo: usuario?.activo ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modoEdicion && formData.password !== formData.password_confirmation) {
      toast.error("Las contraseñas no coinciden"); return;
    }
    if (!modoEdicion && formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres"); return;
    }

    setLoading(true);
    try {
      const data = { ...formData };
      if (modoEdicion && !data.password) { delete data.password; delete data.password_confirmation; }
      
      const response = modoEdicion 
        ? await usuariosApi.update(usuario.id_usuario, data)
        : await usuariosApi.create(data);

      if (response.success) { toast.success(modoEdicion ? "Usuario actualizado" : "Usuario creado"); onSave(); }
      else toast.error(response.message);
    } catch { toast.error("Error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={modoEdicion ? "Editar Usuario" : "Nuevo Usuario"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre de usuario *" name="username" value={formData.username} onChange={handleChange} required />
        <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
          <select name="id_rol" value={formData.id_rol} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre} - {r.descripcion}</option>)}
          </select>
        </div>

        {formData.id_rol == 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vincular a Profesor</label>
            <select name="id_profesor" value={formData.id_profesor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Sin vincular</option>
              {profesores.map(p => <option key={p.id_profesor} value={p.id_profesor}>{p.nombres} {p.apellido_paterno} ({p.rut})</option>)}
            </select>
          </div>
        )}

        {!modoEdicion && (
          <>
            <Input label="Contraseña *" name="password" type="password" value={formData.password} onChange={handleChange} required />
            <Input label="Confirmar Contraseña *" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required />
          </>
        )}

        <label className="flex items-center gap-2">
          <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm">Usuario activo</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" loading={loading}>{modoEdicion ? "Guardar" : "Crear Usuario"}</Button>
        </div>
      </form>
    </Modal>
  );
};

const CambiarPasswordModal = ({ usuario, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { toast.error("Mínimo 6 caracteres"); return; }

    setLoading(true);
    try {
      const response = await usuariosApi.cambiarPassword(usuario.id_usuario, password);
      if (response.success) { toast.success("Contraseña actualizada"); onClose(); }
      else toast.error(response.message);
    } catch { toast.error("Error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title="Cambiar Contraseña" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">Usuario: <strong>{usuario.username}</strong></p>
        </div>
        <Input label="Nueva Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Input label="Confirmar Contraseña" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" loading={loading}>Cambiar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminUsuarios;
