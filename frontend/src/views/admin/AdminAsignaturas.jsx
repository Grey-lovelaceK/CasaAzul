// frontend/src/views/admin/AdminAsignaturas.jsx
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { asignaturasApi, cursosApi, profesoresApi } from "../../api";
import { Button } from "../../components/common/Button";
import { Card, StatCard } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";

export const AdminAsignaturas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaAgrupada, setVistaAgrupada] = useState("materia");
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showAsignarMasivoModal, setShowAsignarMasivoModal] = useState(false);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asigRes, cursosRes, profesoresRes] = await Promise.all([
        asignaturasApi.getAll({ per_page: 500 }),
        cursosApi.getAll({ activos: true }),
        profesoresApi.getAll(),
      ]);
      if (asigRes.success) setAsignaturas(asigRes.data.data || asigRes.data);
      if (cursosRes.success) setCursos(cursosRes.data.data || cursosRes.data);
      if (profesoresRes.success)
        setProfesores(profesoresRes.data.data || profesoresRes.data);
    } catch {
      toast.error("Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por materia
  const asignaturasPorMateria = asignaturas.reduce((acc, asig) => {
    const materiaId = asig.id_materia || asig.materia?.id_materia || "sin";
    const materiaNombre = asig.materia?.nombre || "Sin materia";
    const materiaCodigo = asig.materia?.codigo || "";
    if (!acc[materiaId])
      acc[materiaId] = {
        id: materiaId,
        nombre: materiaNombre,
        codigo: materiaCodigo,
        asignaturas: [],
        conProfesor: 0,
        sinProfesor: 0,
      };
    acc[materiaId].asignaturas.push(asig);
    if (asig.profesor || asig.id_profesor) acc[materiaId].conProfesor++;
    else acc[materiaId].sinProfesor++;
    return acc;
  }, {});

  // Agrupar por curso
  const asignaturasPorCurso = asignaturas.reduce((acc, asig) => {
    const cursoId = asig.id_curso || "sin";
    const cursoNombre =
      asig.curso?.nivel?.nombre || asig.curso?.nombre || "Sin curso";
    if (!acc[cursoId])
      acc[cursoId] = {
        id: cursoId,
        nombre: cursoNombre,
        asignaturas: [],
        conProfesor: 0,
        sinProfesor: 0,
      };
    acc[cursoId].asignaturas.push(asig);
    if (asig.profesor || asig.id_profesor) acc[cursoId].conProfesor++;
    else acc[cursoId].sinProfesor++;
    return acc;
  }, {});

  const sinProfesor = asignaturas.filter(
    (a) => !a.profesor && !a.id_profesor
  ).length;
  const conProfesor = asignaturas.length - sinProfesor;

  if (loading) return <Loading text="Cargando asignaturas..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Asignaturas</h1>
        <p className="text-gray-600 mt-1">
          Asigna profesores a las asignaturas de cada curso
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 ¿Cómo funciona?</h4>
        <p className="text-sm text-blue-700">
          Las asignaturas se crean automáticamente al crear los cursos del
          período. Aquí solo asignas profesores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          title="Total Asignaturas"
          value={asignaturas.length}
          color="blue"
        />
        <StatCard
          icon={<UserCheck className="w-8 h-8" />}
          title="Con Profesor"
          value={conProfesor}
          subtitle={`${Math.round(
            (conProfesor / (asignaturas.length || 1)) * 100
          )}%`}
          color="green"
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Sin Profesor"
          value={sinProfesor}
          subtitle="Pendientes"
          color={sinProfesor > 0 ? "orange" : "green"}
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Profesores"
          value={profesores.length}
          color="purple"
        />
      </div>

      {sinProfesor > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                Hay {sinProfesor} asignaturas sin profesor
              </p>
              <p className="text-sm text-yellow-700">
                Usa "Asignar a todos" en cada materia para asignar rápidamente
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setVistaAgrupada("materia")}
            className={`px-4 py-2 rounded-lg font-medium ${
              vistaAgrupada === "materia"
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            📚 Por Materia
          </button>
          <button
            onClick={() => setVistaAgrupada("curso")}
            className={`px-4 py-2 rounded-lg font-medium ${
              vistaAgrupada === "curso"
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            🎓 Por Curso
          </button>
        </div>

        {vistaAgrupada === "materia" &&
          Object.values(asignaturasPorMateria).map((grupo) => (
            <MateriaCard
              key={grupo.id}
              grupo={grupo}
              profesores={profesores}
              onAsignarIndividual={(a) => {
                setAsignaturaSeleccionada(a);
                setShowAsignarModal(true);
              }}
              onAsignarMasivo={() => {
                setMateriaSeleccionada(grupo);
                setShowAsignarMasivoModal(true);
              }}
            />
          ))}

        {vistaAgrupada === "curso" &&
          Object.values(asignaturasPorCurso).map((grupo) => (
            <CursoCard
              key={grupo.id}
              grupo={grupo}
              onAsignarIndividual={(a) => {
                setAsignaturaSeleccionada(a);
                setShowAsignarModal(true);
              }}
            />
          ))}

        {asignaturas.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No hay asignaturas</h3>
            <p className="text-gray-600">
              Ve a Períodos → Crear Cursos del Período
            </p>
          </div>
        )}
      </Card>

      {showAsignarModal && asignaturaSeleccionada && (
        <AsignarProfesorModal
          asignatura={asignaturaSeleccionada}
          profesores={profesores}
          onClose={() => {
            setShowAsignarModal(false);
            setAsignaturaSeleccionada(null);
          }}
          onSave={() => {
            loadData();
            setShowAsignarModal(false);
          }}
        />
      )}
      {showAsignarMasivoModal && materiaSeleccionada && (
        <AsignarMasivoModal
          materia={materiaSeleccionada}
          profesores={profesores}
          onClose={() => {
            setShowAsignarMasivoModal(false);
            setMateriaSeleccionada(null);
          }}
          onSave={() => {
            loadData();
            setShowAsignarMasivoModal(false);
          }}
        />
      )}
    </div>
  );
};

const MateriaCard = ({
  grupo,
  profesores,
  onAsignarIndividual,
  onAsignarMasivo,
}) => {
  const [expanded, setExpanded] = useState(false);
  const porcentaje = Math.round(
    (grupo.conProfesor / grupo.asignaturas.length) * 100
  );

  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {grupo.codigo || grupo.nombre.substring(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{grupo.nombre}</h3>
            <p className="text-sm text-gray-500">
              {grupo.asignaturas.length} cursos • {grupo.conProfesor} con
              profesor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Asignados</span>
              <span>{porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  porcentaje === 100
                    ? "bg-green-500"
                    : porcentaje >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
          {grupo.sinProfesor > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAsignarMasivo();
              }}
            >
              Asignar a todos
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {grupo.asignaturas.map((asig) => (
              <div
                key={asig.id_asignatura}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div>
                  <p className="font-medium">
                    {asig.curso?.nivel?.nombre || asig.curso?.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {asig.horario || "Sin horario"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {asig.profesor || asig.id_profesor ? (
                    <span className="text-sm text-green-600">
                      {asig.profesor?.nombres || "Asignado"}
                    </span>
                  ) : (
                    <span className="text-sm text-orange-600">Sin asignar</span>
                  )}
                  <button
                    onClick={() => onAsignarIndividual(asig)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CursoCard = ({ grupo, onAsignarIndividual }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <div>
            <h3 className="font-semibold">{grupo.nombre}</h3>
            <p className="text-sm text-gray-500">
              {grupo.asignaturas.length} materias
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            grupo.sinProfesor === 0
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {grupo.sinProfesor === 0
            ? "✓ Completo"
            : `${grupo.sinProfesor} pendientes`}
        </span>
      </div>
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left pb-2">Materia</th>
                <th className="text-left pb-2">Profesor</th>
                <th className="text-right pb-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {grupo.asignaturas.map((asig) => (
                <tr
                  key={asig.id_asignatura}
                  className="border-b border-gray-100"
                >
                  <td className="py-2 font-medium">{asig.materia?.nombre}</td>
                  <td className="py-2">
                    {asig.profesor ? (
                      `${asig.profesor.nombres} ${asig.profesor.apellido_paterno}`
                    ) : (
                      <span className="text-orange-600">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => onAsignarIndividual(asig)}
                      className="text-blue-600 text-sm"
                    >
                      {asig.profesor ? "Cambiar" : "Asignar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AsignarProfesorModal = ({ asignatura, profesores, onClose, onSave }) => {
  const [idProfesor, setIdProfesor] = useState(
    asignatura.id_profesor || asignatura.profesor?.id_profesor || ""
  );
  const [horario, setHorario] = useState(asignatura.horario || "");
  const [sala, setSala] = useState(asignatura.sala || "");
  const [loading, setLoading] = useState(false);

  const nombreMateria = asignatura.materia?.nombre || "Asignatura";
  const nombreCurso = asignatura.curso?.nivel?.nombre || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await asignaturasApi.update(asignatura.id_asignatura, {
        id_profesor: idProfesor || null,
        horario,
        sala,
      });
      toast.success("Asignatura actualizada");
      onSave();
    } catch {
      toast.error("Error");
    } finally {
      setLoading(false);
    }
  };

  // Profesores sugeridos por especialidad
  const sugeridos = profesores
    .filter((p) => {
      const esp = (p.especialidad || "").toLowerCase();
      const mat = nombreMateria.toLowerCase();
      return (
        esp.includes(mat.substring(0, 4)) || mat.includes(esp.substring(0, 4))
      );
    })
    .slice(0, 5);

  return (
    <Modal isOpen onClose={onClose} title="Asignar Profesor" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-semibold text-blue-900">{nombreMateria}</p>
          <p className="text-sm text-blue-700">{nombreCurso}</p>
        </div>

        <Select
          label="Profesor"
          value={idProfesor}
          onChange={setIdProfesor}
          options={profesores}
          placeholder="Buscar profesor..."
          searchable
          clearable
          getOptionLabel={(p) =>
            `${p.nombres} ${p.apellido_paterno} (${
              p.especialidad || "Sin esp."
            })`
          }
          getOptionValue={(p) => p.id_profesor}
        />

        {sugeridos.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              💡 Sugeridos por especialidad:
            </p>
            <div className="flex flex-wrap gap-2">
              {sugeridos.map((p) => (
                <button
                  key={p.id_profesor}
                  type="button"
                  onClick={() => setIdProfesor(p.id_profesor)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    idProfesor === p.id_profesor
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {p.nombres} {p.apellido_paterno?.charAt(0)}.
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            placeholder="Lun-Mié 08:00"
          />
          <Input
            label="Sala"
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            placeholder="Sala 101"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
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

const AsignarMasivoModal = ({ materia, profesores, onClose, onSave }) => {
  const [idProfesor, setIdProfesor] = useState("");
  const [seleccionados, setSeleccionados] = useState(
    materia.asignaturas
      .filter((a) => !a.profesor && !a.id_profesor)
      .map((a) => a.id_asignatura)
  );
  const [loading, setLoading] = useState(false);

  const handleToggle = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async () => {
    if (!idProfesor || seleccionados.length === 0) {
      toast.error("Selecciona profesor y asignaturas");
      return;
    }
    setLoading(true);
    let exitosos = 0;
    for (const id of seleccionados) {
      try {
        const res = await asignaturasApi.update(id, {
          id_profesor: idProfesor,
        });
        if (res.success) exitosos++;
      } catch {}
    }
    toast.success(`Profesor asignado a ${exitosos} asignaturas`);
    setLoading(false);
    onSave();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Asignar Profesor a ${materia.nombre}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            Asigna un mismo profesor a todos los cursos de{" "}
            <strong>{materia.nombre}</strong>
          </p>
        </div>

        <Select
          label="Profesor"
          value={idProfesor}
          onChange={setIdProfesor}
          options={profesores}
          placeholder="Buscar..."
          searchable
          getOptionLabel={(p) =>
            `${p.nombres} ${p.apellido_paterno} (${
              p.especialidad || "Sin esp."
            })`
          }
          getOptionValue={(p) => p.id_profesor}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Cursos a asignar ({seleccionados.length})
          </label>
          <div className="border rounded-lg max-h-64 overflow-y-auto">
            {materia.asignaturas.map((asig) => {
              const yaAsignado = asig.profesor || asig.id_profesor;
              return (
                <label
                  key={asig.id_asignatura}
                  className={`flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    yaAsignado ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(asig.id_asignatura)}
                      onChange={() => handleToggle(asig.id_asignatura)}
                      disabled={yaAsignado}
                      className="w-4 h-4"
                    />
                    <span>
                      {asig.curso?.nivel?.nombre || asig.curso?.nombre}
                    </span>
                  </div>
                  {yaAsignado && (
                    <span className="text-sm text-gray-500">Ya asignado</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={!idProfesor || seleccionados.length === 0}
          >
            Asignar a {seleccionados.length} cursos
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminAsignaturas;
