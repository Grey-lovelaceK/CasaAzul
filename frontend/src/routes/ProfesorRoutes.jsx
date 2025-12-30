// frontend/src/routes/ProfesorRoutes.jsx

import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileEdit,
  Users,
} from "lucide-react";

export const profesorMenuItems = [
  {
    path: "/profesor/dashboard",
    label: "Mi Dashboard",
    icon: BarChart3,
  },
  {
    path: "/profesor/asignaturas",
    label: "Mis Asignaturas",
    icon: BookOpen,
  },
  {
    path: "/profesor/asistencia",
    label: "Tomar Asistencia",
    icon: ClipboardCheck,
  },
  {
    path: "/profesor/notas",
    label: "Registrar Notas",
    icon: FileEdit,
  },
  {
    path: "/profesor/estudiantes",
    label: "Mis Estudiantes",
    icon: Users,
  },
];
