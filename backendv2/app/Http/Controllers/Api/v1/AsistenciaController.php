<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Asistencia;
use App\Models\Matricula;
use App\Models\Asignatura;
use Carbon\Carbon;

class AsistenciaController extends Controller
{
    /**
     * Listar asistencias con filtros
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Asistencia::with([
                'matricula.estudiante',
                'matricula.asignatura.curso',
                'matricula.asignatura.periodo'
            ]);

            // Filtro por asignatura
            if ($request->has('id_asignatura')) {
                $query->whereHas('matricula', function ($q) use ($request) {
                    $q->where('id_asignatura', $request->id_asignatura);
                });
            }

            // Filtro por fecha
            if ($request->has('fecha')) {
                $query->whereDate('fecha', $request->fecha);
            }

            // Filtro por rango de fechas
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
            }

            // Filtro por estudiante
            if ($request->has('id_estudiante')) {
                $query->whereHas('matricula', function ($q) use ($request) {
                    $q->where('id_estudiante', $request->id_estudiante);
                });
            }

            // Si es profesor, solo ver sus asignaturas
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                $query->whereHas('matricula.asignatura', function ($q) use ($user) {
                    $q->where('id_profesor', $user->id_profesor);
                });
            }

            $asistencias = $query->orderBy('fecha', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $asistencias
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tomar asistencia individual
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_matricula' => 'required|exists:matriculas,id_matricula',
            'fecha' => 'required|date',
            'presente' => 'required|boolean',
            'justificada' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar que el profesor tenga acceso a la asignatura
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                $matricula = Matricula::with('asignatura')->find($request->id_matricula);
                if ($matricula->asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para tomar asistencia en esta asignatura'
                    ], 403);
                }
            }

            // Verificar si ya existe asistencia para esta fecha
            $existente = Asistencia::where('id_matricula', $request->id_matricula)
                ->whereDate('fecha', $request->fecha)
                ->first();

            if ($existente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe un registro de asistencia para esta fecha'
                ], 400);
            }

            $asistencia = Asistencia::create([
                'id_matricula' => $request->id_matricula,
                'fecha' => $request->fecha,
                'presente' => $request->presente,
                'justificada' => $request->justificada ?? false,
                'observaciones' => $request->observaciones,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asistencia registrada exitosamente',
                'data' => $asistencia->load('matricula.estudiante')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tomar asistencia masiva para toda una asignatura
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function tomarMasivo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_asignatura' => 'required|exists:asignaturas,id_asignatura',
            'fecha' => 'required|date',
            'asistencias' => 'required|array',
            'asistencias.*.id_matricula' => 'required|exists:matriculas,id_matricula',
            'asistencias.*.presente' => 'required|boolean',
            'asistencias.*.justificada' => 'nullable|boolean',
            'asistencias.*.observaciones' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Verificar que el profesor tenga acceso a la asignatura
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                $asignatura = Asignatura::find($request->id_asignatura);
                if ($asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para tomar asistencia en esta asignatura'
                    ], 403);
                }
            }

            // Verificar que no existan registros para esta fecha
            $existentes = Asistencia::whereIn(
                'id_matricula',
                array_column($request->asistencias, 'id_matricula')
            )
                ->whereDate('fecha', $request->fecha)
                ->count();

            if ($existentes > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existen registros de asistencia para esta fecha. Debe eliminarlos primero.'
                ], 400);
            }

            $registradas = 0;
            $errores = [];

            foreach ($request->asistencias as $asistenciaData) {
                try {
                    // Verificar que la matrícula pertenezca a la asignatura
                    $matricula = Matricula::where('id_matricula', $asistenciaData['id_matricula'])
                        ->where('id_asignatura', $request->id_asignatura)
                        ->first();

                    if (!$matricula) {
                        $errores[] = [
                            'id_matricula' => $asistenciaData['id_matricula'],
                            'error' => 'La matrícula no pertenece a esta asignatura'
                        ];
                        continue;
                    }

                    Asistencia::create([
                        'id_matricula' => $asistenciaData['id_matricula'],
                        'fecha' => $request->fecha,
                        'presente' => $asistenciaData['presente'],
                        'justificada' => $asistenciaData['justificada'] ?? false,
                        'observaciones' => $asistenciaData['observaciones'] ?? null,
                    ]);

                    $registradas++;
                } catch (\Exception $e) {
                    $errores[] = [
                        'id_matricula' => $asistenciaData['id_matricula'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Se registraron {$registradas} asistencias exitosamente",
                'data' => [
                    'registradas' => $registradas,
                    'errores' => $errores,
                    'fecha' => $request->fecha
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar asistencias masivas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar asistencia
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'presente' => 'required|boolean',
            'justificada' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $asistencia = Asistencia::findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                if ($asistencia->matricula->asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para modificar esta asistencia'
                    ], 403);
                }
            }

            $asistencia->update([
                'presente' => $request->presente,
                'justificada' => $request->justificada ?? $asistencia->justificada,
                'observaciones' => $request->observaciones,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Asistencia actualizada exitosamente',
                'data' => $asistencia->load('matricula.estudiante')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener asistencias por asignatura y fecha
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function porAsignatura(Request $request, $id)
    {
        try {
            $asignatura = Asignatura::with(['curso', 'periodo', 'profesor'])
                ->findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2 && $asignatura->id_profesor != $user->id_profesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para ver esta asignatura'
                ], 403);
            }

            $query = Asistencia::with(['matricula.estudiante'])
                ->whereHas('matricula', function ($q) use ($id) {
                    $q->where('id_asignatura', $id);
                });

            // Filtros opcionales
            if ($request->has('fecha')) {
                $query->whereDate('fecha', $request->fecha);
            }

            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
            }

            $asistencias = $query->orderBy('fecha', 'desc')->get();

            // Agrupar por estudiante
            $porEstudiante = $asistencias->groupBy('matricula.estudiante.id_estudiante')
                ->map(function ($asistenciasEstudiante) {
                    $estudiante = $asistenciasEstudiante->first()->matricula->estudiante;
                    $totalClases = $asistenciasEstudiante->count();
                    $presentes = $asistenciasEstudiante->where('presente', true)->count();
                    $justificadas = $asistenciasEstudiante->where('justificada', true)->count();

                    return [
                        'estudiante' => [
                            'id' => $estudiante->id_estudiante,
                            'nombre' => $estudiante->nombreCompleto(),
                            'rut' => $estudiante->rut,
                        ],
                        'estadisticas' => [
                            'total_clases' => $totalClases,
                            'presentes' => $presentes,
                            'ausentes' => $totalClases - $presentes,
                            'justificadas' => $justificadas,
                            'porcentaje_asistencia' => $totalClases > 0 ? round(($presentes / $totalClases) * 100, 2) : 0
                        ],
                        'detalle' => $asistenciasEstudiante->map(function ($a) {
                            return [
                                'id' => $a->id_asistencia,
                                'fecha' => $a->fecha,
                                'presente' => $a->presente,
                                'justificada' => $a->justificada,
                                'observaciones' => $a->observaciones,
                            ];
                        })->sortByDesc('fecha')->values()
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'id' => $asignatura->id_asignatura,
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'periodo' => $asignatura->periodo->nombre,
                        'profesor' => $asignatura->profesor ? $asignatura->profesor->nombreCompleto() : null,
                    ],
                    'estudiantes' => $porEstudiante->values()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista de estudiantes para tomar asistencia
     * 
     * @param int $id ID de la asignatura
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listaEstudiantes($id, Request $request)
    {
        try {
            $fecha = $request->get('fecha', now()->format('Y-m-d'));

            $asignatura = Asignatura::with(['curso', 'periodo'])->findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2 && $asignatura->id_profesor != $user->id_profesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para ver esta asignatura'
                ], 403);
            }

            // Obtener estudiantes matriculados
            $matriculas = Matricula::with(['estudiante'])
                ->where('id_asignatura', $id)
                ->get();

            // Verificar si ya hay asistencia tomada para esta fecha
            $asistenciasExistentes = Asistencia::whereIn('id_matricula', $matriculas->pluck('id_matricula'))
                ->whereDate('fecha', $fecha)
                ->get()
                ->keyBy('id_matricula');

            $estudiantes = $matriculas->map(function ($matricula) use ($asistenciasExistentes, $fecha) {
                $asistencia = $asistenciasExistentes->get($matricula->id_matricula);

                return [
                    'id_matricula' => $matricula->id_matricula,
                    'estudiante' => [
                        'id' => $matricula->estudiante->id_estudiante,
                        'nombre' => $matricula->estudiante->nombreCompleto(),
                        'rut' => $matricula->estudiante->rut,
                    ],
                    'asistencia_registrada' => $asistencia ? [
                        'id' => $asistencia->id_asistencia,
                        'presente' => $asistencia->presente,
                        'justificada' => $asistencia->justificada,
                        'observaciones' => $asistencia->observaciones,
                    ] : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'id' => $asignatura->id_asignatura,
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'periodo' => $asignatura->periodo->nombre,
                    ],
                    'fecha' => $fecha,
                    'total_estudiantes' => $estudiantes->count(),
                    'ya_registrada' => $asistenciasExistentes->isNotEmpty(),
                    'estudiantes' => $estudiantes->values()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener lista de estudiantes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar asistencia de una fecha específica (para re-tomar)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function eliminarPorFecha(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_asignatura' => 'required|exists:asignaturas,id_asignatura',
            'fecha' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2) {
                $asignatura = Asignatura::find($request->id_asignatura);
                if ($asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para eliminar asistencias de esta asignatura'
                    ], 403);
                }
            }

            // Obtener matrículas de la asignatura
            $matriculas = Matricula::where('id_asignatura', $request->id_asignatura)
                ->pluck('id_matricula');

            // Eliminar asistencias
            $eliminadas = Asistencia::whereIn('id_matricula', $matriculas)
                ->whereDate('fecha', $request->fecha)
                ->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Se eliminaron {$eliminadas} registros de asistencia",
                'data' => [
                    'eliminadas' => $eliminadas,
                    'fecha' => $request->fecha
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de asistencia por período
     * 
     * @param int $id ID de la asignatura
     * @return \Illuminate\Http\JsonResponse
     */
    public function estadisticas($id)
    {
        try {
            $asignatura = Asignatura::with(['curso', 'periodo', 'profesor'])->findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2 && $asignatura->id_profesor != $user->id_profesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para ver estas estadísticas'
                ], 403);
            }

            $matriculas = Matricula::where('id_asignatura', $id)->pluck('id_matricula');

            $totalClases = Asistencia::whereIn('id_matricula', $matriculas)
                ->distinct('fecha')
                ->count('fecha');

            $totalRegistros = Asistencia::whereIn('id_matricula', $matriculas)->count();

            $presentes = Asistencia::whereIn('id_matricula', $matriculas)
                ->where('presente', true)
                ->count();

            $ausentes = $totalRegistros - $presentes;

            $justificadas = Asistencia::whereIn('id_matricula', $matriculas)
                ->where('justificada', true)
                ->count();

            $porcentajeGlobal = $totalRegistros > 0 ? round(($presentes / $totalRegistros) * 100, 2) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'id' => $asignatura->id_asignatura,
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'periodo' => $asignatura->periodo->nombre,
                    ],
                    'estadisticas' => [
                        'total_clases' => $totalClases,
                        'total_estudiantes' => $matriculas->count(),
                        'total_registros' => $totalRegistros,
                        'presentes' => $presentes,
                        'ausentes' => $ausentes,
                        'justificadas' => $justificadas,
                        'porcentaje_asistencia_global' => $porcentajeGlobal
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
