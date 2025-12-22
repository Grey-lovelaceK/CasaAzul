<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Estudiante;
use App\Models\Profesor;
use App\Models\Asignatura;
use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Nota;
use App\Models\Asistencia;
use App\Models\Estado;
use App\Models\Rol;
use App\Models\PeriodoAcademico;

class DashboardController extends Controller
{
    /**
     * Dashboard para Profesor
     * Ver MIS asignaturas y estadísticas
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function profesor()
    {
        try {
            $user = Auth::user();

            if ($user->id_rol != 2 || !$user->id_profesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es profesor'
                ], 403);
            }

            $profesor = Profesor::with('estado')->find($user->id_profesor);

            // Obtener MIS asignaturas activas
            $misAsignaturas = Asignatura::with(['curso', 'periodo', 'estado'])
                ->where('id_profesor', $user->id_profesor)
                ->whereHas('periodo', function ($q) {
                    $q->where('activo', true);
                })
                ->get()
                ->map(function ($asignatura) {
                    $totalEstudiantes = $asignatura->matriculas()->count();
                    $totalNotas = Nota::whereHas('matricula', function ($q) use ($asignatura) {
                        $q->where('id_asignatura', $asignatura->id_asignatura);
                    })->count();

                    $totalClases = Asistencia::whereHas('matricula', function ($q) use ($asignatura) {
                        $q->where('id_asignatura', $asignatura->id_asignatura);
                    })->distinct('fecha')->count('fecha');

                    return [
                        'id' => $asignatura->id_asignatura,
                        'curso' => [
                            'id' => $asignatura->curso->id_curso,
                            'nombre' => $asignatura->curso->nombre,
                            'codigo' => $asignatura->curso->codigo,
                        ],
                        'seccion' => $asignatura->seccion,
                        'periodo' => [
                            'id' => $asignatura->periodo->id_periodo,
                            'nombre' => $asignatura->periodo->nombre,
                        ],
                        'horario' => $asignatura->horario,
                        'sala' => $asignatura->sala,
                        'estado' => $asignatura->estado->nombre ?? null,
                        'estadisticas' => [
                            'total_estudiantes' => $totalEstudiantes,
                            'cupo_maximo' => $asignatura->cupo_maximo,
                            'cupo_disponible' => $asignatura->cupo_disponible,
                            'total_notas_registradas' => $totalNotas,
                            'clases_realizadas' => $totalClases,
                        ]
                    ];
                });

            // Estadísticas generales del profesor
            $totalEstudiantesProfesor = Matricula::whereHas('asignatura', function ($q) use ($user) {
                $q->where('id_profesor', $user->id_profesor);
            })->distinct('id_estudiante')->count('id_estudiante');

            $totalNotasRegistradas = Nota::whereHas('matricula.asignatura', function ($q) use ($user) {
                $q->where('id_profesor', $user->id_profesor);
            })->count();

            $totalAsistenciasRegistradas = Asistencia::whereHas('matricula.asignatura', function ($q) use ($user) {
                $q->where('id_profesor', $user->id_profesor);
            })->count();

            // Asignaturas con clases pendientes de asistencia (hoy)
            $hoy = now()->format('Y-m-d');
            $asignaturasPendientes = $misAsignaturas->filter(function ($asignatura) use ($hoy) {
                $yaRegistrada = Asistencia::whereHas('matricula', function ($q) use ($asignatura) {
                    $q->where('id_asignatura', $asignatura['id']);
                })->whereDate('fecha', $hoy)->exists();

                return !$yaRegistrada;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'profesor' => [
                        'id' => $profesor->id_profesor,
                        'nombre' => $profesor->nombreCompleto(),
                        'email' => $profesor->email,
                        'especialidad' => $profesor->especialidad,
                        'estado' => $profesor->estado->nombre ?? null,
                    ],
                    'estadisticas_generales' => [
                        'total_asignaturas' => $misAsignaturas->count(),
                        'total_estudiantes' => $totalEstudiantesProfesor,
                        'notas_registradas' => $totalNotasRegistradas,
                        'asistencias_registradas' => $totalAsistenciasRegistradas,
                    ],
                    'mis_asignaturas' => $misAsignaturas,
                    'pendientes_hoy' => [
                        'fecha' => $hoy,
                        'asignaturas_sin_asistencia' => $asignaturasPendientes->values(),
                        'total' => $asignaturasPendientes->count(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener dashboard del profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dashboard para Administrador
     * Vista general del sistema
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function admin()
    {
        try {
            // Estadísticas generales
            $totalEstudiantes = Estudiante::count();
            $estudiantesActivos = Estudiante::whereHas('estado', function ($q) {
                $q->where('nombre', 'Activo')->where('tipo', 'estudiante');
            })->count();

            $totalProfesores = Profesor::count();
            $profesoresActivos = Profesor::whereHas('estado', function ($q) {
                $q->where('nombre', 'Activo')->where('tipo', 'profesor');
            })->count();

            $totalCursos = Curso::count();
            $totalAsignaturas = Asignatura::count();
            $asignaturasActivas = Asignatura::whereHas('periodo', function ($q) {
                $q->where('activo', true);
            })->count();

            $totalMatriculas = Matricula::count();
            $matriculasActivas = Matricula::whereHas('estado', function ($q) {
                $q->where('nombre', 'Matriculado')->where('tipo', 'matricula');
            })->count();

            // Estudiantes por estado
            $estudiantesPorEstado = DB::table('estudiantes')
                ->join('estados', 'estudiantes.id_estado', '=', 'estados.id_estado')
                ->select('estados.nombre as estado', DB::raw('count(*) as total'))
                ->where('estados.tipo', 'estudiante')
                ->groupBy('estados.nombre')
                ->get();

            // Asignaturas por período activo
            $periodoActivo = PeriodoAcademico::where('activo', true)
                ->orderBy('anio', 'desc')
                ->orderBy('semestre', 'desc')
                ->first();

            $asignaturasPeriodoActivo = 0;
            if ($periodoActivo) {
                $asignaturasPeriodoActivo = Asignatura::where('id_periodo', $periodoActivo->id_periodo)->count();
            }

            // Promedios generales
            $promedioGeneral = DB::table('notas')
                ->join('matriculas', 'notas.id_matricula', '=', 'matriculas.id_matricula')
                ->select(DB::raw('AVG(notas.nota) as promedio'))
                ->first();

            // Porcentaje de asistencia general
            $totalAsistencias = Asistencia::count();
            $asistenciasPresentes = Asistencia::where('presente', true)->count();
            $porcentajeAsistenciaGeneral = $totalAsistencias > 0
                ? round(($asistenciasPresentes / $totalAsistencias) * 100, 2)
                : 0;

            // Últimas matrículas
            $ultimasMatriculas = Matricula::with(['estudiante', 'asignatura.curso'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($m) {
                    return [
                        'estudiante' => $m->estudiante->nombreCompleto(),
                        'curso' => $m->asignatura->curso->nombre,
                        'seccion' => $m->asignatura->seccion,
                        'fecha' => $m->fecha,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'estadisticas' => [
                        'estudiantes' => [
                            'total' => $totalEstudiantes,
                            'activos' => $estudiantesActivos,
                            'inactivos' => $totalEstudiantes - $estudiantesActivos,
                        ],
                        'profesores' => [
                            'total' => $totalProfesores,
                            'activos' => $profesoresActivos,
                            'inactivos' => $totalProfesores - $profesoresActivos,
                        ],
                        'cursos' => [
                            'total' => $totalCursos,
                        ],
                        'asignaturas' => [
                            'total' => $totalAsignaturas,
                            'activas' => $asignaturasActivas,
                            'periodo_actual' => $asignaturasPeriodoActivo,
                        ],
                        'matriculas' => [
                            'total' => $totalMatriculas,
                            'activas' => $matriculasActivas,
                        ],
                        'academico' => [
                            'promedio_general' => round($promedioGeneral->promedio ?? 0, 1),
                            'porcentaje_asistencia' => $porcentajeAsistenciaGeneral,
                        ]
                    ],
                    'estudiantes_por_estado' => $estudiantesPorEstado,
                    'periodo_activo' => $periodoActivo ? [
                        'id' => $periodoActivo->id_periodo,
                        'nombre' => $periodoActivo->nombre,
                        'fecha_inicio' => $periodoActivo->fecha_inicio,
                        'fecha_termino' => $periodoActivo->fecha_termino,
                    ] : null,
                    'ultimas_matriculas' => $ultimasMatriculas,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener dashboard del administrador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estados por tipo
     * 
     * @param string $tipo
     * @return \Illuminate\Http\JsonResponse
     */
    public function estados($tipo)
    {
        try {
            $estados = Estado::where('tipo', $tipo)
                ->where('activo', true)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $estados
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener roles
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function roles()
    {
        try {
            $roles = Rol::where('activo', true)->get();

            return response()->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener períodos académicos
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function periodos()
    {
        try {
            $periodos = PeriodoAcademico::orderBy('anio', 'desc')
                ->orderBy('semestre', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $periodos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener períodos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
