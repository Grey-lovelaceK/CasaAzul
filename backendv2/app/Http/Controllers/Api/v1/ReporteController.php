<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Estudiante;
use App\Models\Profesor;
use App\Models\Asignatura;
use App\Models\Matricula;
use App\Models\Nota;
use App\Models\Asistencia;

class ReporteController extends Controller
{
    /**
     * Reporte general del sistema
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function general()
    {
        try {
            $data = [
                'estudiantes' => [
                    'total' => Estudiante::count(),
                    'activos' => Estudiante::whereHas('estado', function ($q) {
                        $q->where('nombre', 'Activo');
                    })->count(),
                ],
                'profesores' => [
                    'total' => Profesor::count(),
                    'activos' => Profesor::whereHas('estado', function ($q) {
                        $q->where('nombre', 'Activo');
                    })->count(),
                ],
                'asignaturas' => [
                    'total' => Asignatura::count(),
                    'activas' => Asignatura::whereHas('periodo', function ($q) {
                        $q->where('activo', true);
                    })->count(),
                ],
                'matriculas' => [
                    'total' => Matricula::count(),
                ],
                'promedio_general' => round(Nota::avg('nota'), 1) ?? 0,
                'porcentaje_asistencia_general' => $this->calcularAsistenciaGeneral(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte general',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de notas
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function notas(Request $request)
    {
        try {
            $query = Nota::with([
                'matricula.estudiante',
                'matricula.asignatura.curso'
            ]);

            if ($request->has('id_asignatura')) {
                $query->whereHas('matricula', function ($q) use ($request) {
                    $q->where('id_asignatura', $request->id_asignatura);
                });
            }

            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
            }

            $notas = $query->get();

            $resumen = [
                'total_notas' => $notas->count(),
                'promedio_general' => round($notas->avg('nota'), 1),
                'nota_maxima' => $notas->max('nota'),
                'nota_minima' => $notas->min('nota'),
                'aprobados' => $notas->where('nota', '>=', 4.0)->count(),
                'reprobados' => $notas->where('nota', '<', 4.0)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'resumen' => $resumen,
                    'notas' => $notas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de notas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de notas por asignatura
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function notasPorAsignatura($id)
    {
        try {
            $asignatura = Asignatura::with('curso', 'periodo')->findOrFail($id);

            $notas = Nota::with('matricula.estudiante')
                ->whereHas('matricula', function ($q) use ($id) {
                    $q->where('id_asignatura', $id);
                })
                ->get()
                ->groupBy('matricula.estudiante.id_estudiante')
                ->map(function ($notasEstudiante) {
                    $estudiante = $notasEstudiante->first()->matricula->estudiante;
                    $promedio = round($notasEstudiante->avg('nota'), 1);

                    return [
                        'estudiante' => $estudiante->nombreCompleto(),
                        'rut' => $estudiante->rut,
                        'total_notas' => $notasEstudiante->count(),
                        'promedio' => $promedio,
                        'estado' => $promedio >= 4.0 ? 'Aprobado' : 'Reprobado',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'periodo' => $asignatura->periodo->nombre,
                    ],
                    'estadisticas' => [
                        'total_estudiantes' => $notas->count(),
                        'promedio_curso' => round($notas->avg('promedio'), 1),
                        'aprobados' => $notas->where('estado', 'Aprobado')->count(),
                        'reprobados' => $notas->where('estado', 'Reprobado')->count(),
                    ],
                    'estudiantes' => $notas->values()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de notas por estudiante
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function notasPorEstudiante($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);

            $matriculas = Matricula::where('id_estudiante', $id)
                ->with(['asignatura.curso', 'asignatura.periodo', 'notas'])
                ->get();

            $asignaturas = $matriculas->map(function ($matricula) {
                $promedio = $matricula->promedio();
                return [
                    'asignatura' => [
                        'curso' => $matricula->asignatura->curso->nombre,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'total_notas' => $matricula->notas->count(),
                    'promedio' => $promedio,
                    'estado' => $promedio >= 4.0 ? 'Aprobado' : 'Reprobado',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => [
                        'nombre' => $estudiante->nombreCompleto(),
                        'rut' => $estudiante->rut,
                    ],
                    'promedio_general' => round($asignaturas->avg('promedio'), 1),
                    'asignaturas' => $asignaturas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de asistencia
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function asistencia(Request $request)
    {
        try {
            $query = Asistencia::with([
                'matricula.estudiante',
                'matricula.asignatura.curso'
            ]);

            if ($request->has('id_asignatura')) {
                $query->whereHas('matricula', function ($q) use ($request) {
                    $q->where('id_asignatura', $request->id_asignatura);
                });
            }

            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
            }

            $asistencias = $query->get();

            $resumen = [
                'total_registros' => $asistencias->count(),
                'presentes' => $asistencias->where('presente', true)->count(),
                'ausentes' => $asistencias->where('presente', false)->count(),
                'justificadas' => $asistencias->where('justificada', true)->count(),
                'porcentaje_asistencia' => $asistencias->count() > 0
                    ? round(($asistencias->where('presente', true)->count() / $asistencias->count()) * 100, 2)
                    : 0,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'resumen' => $resumen,
                    'asistencias' => $asistencias
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte de asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de asistencia por asignatura
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function asistenciaPorAsignatura($id)
    {
        try {
            $asignatura = Asignatura::with('curso', 'periodo')->findOrFail($id);

            $asistencias = Asistencia::with('matricula.estudiante')
                ->whereHas('matricula', function ($q) use ($id) {
                    $q->where('id_asignatura', $id);
                })
                ->get()
                ->groupBy('matricula.estudiante.id_estudiante')
                ->map(function ($asistenciasEstudiante) {
                    $estudiante = $asistenciasEstudiante->first()->matricula->estudiante;
                    $total = $asistenciasEstudiante->count();
                    $presentes = $asistenciasEstudiante->where('presente', true)->count();

                    return [
                        'estudiante' => $estudiante->nombreCompleto(),
                        'rut' => $estudiante->rut,
                        'total_clases' => $total,
                        'presentes' => $presentes,
                        'ausentes' => $total - $presentes,
                        'porcentaje' => $total > 0 ? round(($presentes / $total) * 100, 2) : 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'periodo' => $asignatura->periodo->nombre,
                    ],
                    'estudiantes' => $asistencias->values()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte de asistencia por estudiante
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function asistenciaPorEstudiante($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);

            $matriculas = Matricula::where('id_estudiante', $id)
                ->with(['asignatura.curso', 'asignatura.periodo', 'asistencias'])
                ->get();

            $asignaturas = $matriculas->map(function ($matricula) {
                $total = $matricula->asistencias->count();
                $presentes = $matricula->asistencias->where('presente', true)->count();

                return [
                    'asignatura' => [
                        'curso' => $matricula->asignatura->curso->nombre,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'total_clases' => $total,
                    'presentes' => $presentes,
                    'ausentes' => $total - $presentes,
                    'porcentaje' => $matricula->porcentajeAsistencia(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => [
                        'nombre' => $estudiante->nombreCompleto(),
                        'rut' => $estudiante->rut,
                    ],
                    'asignaturas' => $asignaturas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reporte académico completo
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function academico()
    {
        try {
            $data = [
                'resumen_notas' => [
                    'promedio_general' => round(Nota::avg('nota'), 1) ?? 0,
                    'total_evaluaciones' => Nota::count(),
                ],
                'resumen_asistencia' => [
                    'porcentaje_general' => $this->calcularAsistenciaGeneral(),
                    'total_registros' => Asistencia::count(),
                ],
                'por_asignatura' => $this->reportePorAsignaturas(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar reporte académico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular porcentaje de asistencia general
     * 
     * @return float
     */
    private function calcularAsistenciaGeneral()
    {
        $total = Asistencia::count();
        if ($total == 0) return 0;

        $presentes = Asistencia::where('presente', true)->count();
        return round(($presentes / $total) * 100, 2);
    }

    /**
     * Reporte por asignaturas
     * 
     * @return array
     */
    private function reportePorAsignaturas()
    {
        return Asignatura::with(['curso', 'periodo'])
            ->whereHas('periodo', function ($q) {
                $q->where('activo', true);
            })
            ->get()
            ->map(function ($asignatura) {
                $notas = Nota::whereHas('matricula', function ($q) use ($asignatura) {
                    $q->where('id_asignatura', $asignatura->id_asignatura);
                })->get();

                $asistencias = Asistencia::whereHas('matricula', function ($q) use ($asignatura) {
                    $q->where('id_asignatura', $asignatura->id_asignatura);
                })->get();

                return [
                    'curso' => $asignatura->curso->nombre,
                    'seccion' => $asignatura->seccion,
                    'periodo' => $asignatura->periodo->nombre,
                    'promedio' => round($notas->avg('nota'), 1) ?? 0,
                    'porcentaje_asistencia' => $asistencias->count() > 0
                        ? round(($asistencias->where('presente', true)->count() / $asistencias->count()) * 100, 2)
                        : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Exportar reportes (placeholder)
     */
    public function exportNotas(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Funcionalidad de exportación no implementada. Usar datos JSON para implementar en frontend.'
        ], 501);
    }

    public function exportAsistencia(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Funcionalidad de exportación no implementada. Usar datos JSON para implementar en frontend.'
        ], 501);
    }
}
