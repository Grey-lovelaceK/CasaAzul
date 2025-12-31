// frontend/src/routes/AdminRoutes.jsx
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react";

export const adminMenuItems = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/periodos", label: "Períodos Académicos", icon: Calendar },
  { path: "/cursos", label: "Cursos", icon: LayoutGrid },
  { path: "/asignaturas", label: "Asignaturas", icon: BookOpen },
  { path: "/estudiantes", label: "Estudiantes", icon: Users },
  { path: "/profesores", label: "Profesores", icon: GraduationCap },
  { path: "/matriculas", label: "Matrículas", icon: ClipboardList },
  { path: "/usuarios", label: "Usuarios", icon: Settings },
  { path: "/reportes", label: "Reportes", icon: FileText },
];

export default adminMenuItems;
