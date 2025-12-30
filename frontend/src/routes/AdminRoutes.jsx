// frontend/src/routes/AdminRoutes.jsx

import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";

export const adminMenuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    path: "/estudiantes",
    label: "Estudiantes",
    icon: Users,
  },
  {
    path: "/profesores",
    label: "Profesores",
    icon: GraduationCap,
  },
  {
    path: "/asignaturas",
    label: "Asignaturas",
    icon: BookOpen,
  },
  {
    path: "/matriculas",
    label: "Matrículas",
    icon: ClipboardList,
  },
  {
    path: "/reportes",
    label: "Reportes",
    icon: FileText,
  },
];
