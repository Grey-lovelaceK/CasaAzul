<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Nota;
use App\Models\Matricula;

class NotasController extends Controller
{
    /**
     * Listar todas las notas (Admin/Profesor)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Nota::with([
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

            // Filtro por estudiante
            if ($request->has('id_estudiante')) {
                $query->whereHas('matricula', function ($q) use ($request) {
                    $q->where('id_estudiante', $request->id_estudiante);
                });
            }

            // Filtro por fecha
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
            }

            // Si es profesor, solo ver sus asignaturas
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                $query->whereHas('matricula.asignatura', function ($q) use ($user) {
                    $q->where('id_profesor', $user->id_profesor);
                });
            }

            $notas = $query->orderBy('fecha', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $notas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar notas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva nota
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_matricula' => 'required|exists:matriculas,id_matricula',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'fecha' => 'required|date',
            'nota' => 'required|numeric|min:1.0|max:7.0',
            'observaciones' => 'nullable|string',
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
                        'message' => 'No tiene permisos para calificar esta asignatura'
                    ], 403);
                }
            }

            $nota = Nota::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Nota registrada exitosamente',
                'data' => $nota->load('matricula.estudiante')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar nota',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar nota
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string',
            'nota' => 'required|numeric|min:1.0|max:7.0',
            'observaciones' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $nota = Nota::findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                if ($nota->matricula->asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para modificar esta nota'
                    ], 403);
                }
            }

            $nota->update($request->only(['nombre', 'descripcion', 'nota', 'observaciones']));

            return response()->json([
                'success' => true,
                'message' => 'Nota actualizada exitosamente',
                'data' => $nota
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar nota',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar nota
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $nota = Nota::findOrFail($id);

            // Verificar permisos
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                if ($nota->matricula->asignatura->id_profesor != $user->id_profesor) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tiene permisos para eliminar esta nota'
                    ], 403);
                }
            }

            $nota->delete();

            return response()->json([
                'success' => true,
                'message' => 'Nota eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar nota',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notas por asignatura con promedios
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function porAsignatura($id)
    {
        try {
            $notas = Nota::with(['matricula.estudiante'])
                ->whereHas('matricula', function ($q) use ($id) {
                    $q->where('id_asignatura', $id);
                })
                ->orderBy('fecha', 'desc')
                ->get()
                ->groupBy('matricula.estudiante.id_estudiante')
                ->map(function ($notasEstudiante) {
                    $estudiante = $notasEstudiante->first()->matricula->estudiante;
                    $promedio = round($notasEstudiante->avg('nota'), 1);

                    return [
                        'estudiante' => [
                            'id' => $estudiante->id_estudiante,
                            'nombre' => $estudiante->nombreCompleto(),
                            'rut' => $estudiante->rut,
                        ],
                        'notas' => $notasEstudiante->map(function ($n) {
                            return [
                                'id' => $n->id_nota,
                                'nombre' => $n->nombre,
                                'nota' => $n->nota,
                                'fecha' => $n->fecha,
                                'observaciones' => $n->observaciones,
                            ];
                        })->sortByDesc('fecha')->values(),
                        'total_notas' => $notasEstudiante->count(),
                        'promedio' => $promedio,
                        'estado' => $promedio >= 4.0 ? 'Aprobado' : 'Reprobado'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $notas->values()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener notas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cargar notas masivas
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cargarMasivo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_asignatura' => 'required|exists:asignaturas,id_asignatura',
            'nombre' => 'required|string',
            'descripcion' => 'nullable|string',
            'fecha' => 'required|date',
            'notas' => 'required|array',
            'notas.*.id_matricula' => 'required|exists:matriculas,id_matricula',
            'notas.*.nota' => 'required|numeric|min:1.0|max:7.0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $creadas = 0;
            $errores = [];

            foreach ($request->notas as $notaData) {
                try {
                    // Verificar que la matrícula pertenezca a la asignatura
                    $matricula = Matricula::where('id_matricula', $notaData['id_matricula'])
                        ->where('id_asignatura', $request->id_asignatura)
                        ->first();

                    if (!$matricula) {
                        $errores[] = [
                            'id_matricula' => $notaData['id_matricula'],
                            'error' => 'La matrícula no pertenece a esta asignatura'
                        ];
                        continue;
                    }

                    Nota::create([
                        'id_matricula' => $notaData['id_matricula'],
                        'nombre' => $request->nombre,
                        'descripcion' => $request->descripcion,
                        'fecha' => $request->fecha,
                        'nota' => $notaData['nota'],
                        'observaciones' => $notaData['observaciones'] ?? null,
                    ]);

                    $creadas++;
                } catch (\Exception $e) {
                    $errores[] = [
                        'id_matricula' => $notaData['id_matricula'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Se cargaron {$creadas} notas exitosamente",
                'data' => [
                    'creadas' => $creadas,
                    'errores' => $errores
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar notas masivas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener notas de un estudiante por asignatura
     * 
     * @param int $idEstudiante
     * @param int $idAsignatura
     * @return \Illuminate\Http\JsonResponse
     */
    public function notasEstudianteAsignatura($idEstudiante, $idAsignatura)
    {
        try {
            $matricula = Matricula::where('id_estudiante', $idEstudiante)
                ->where('id_asignatura', $idAsignatura)
                ->with(['asignatura.curso', 'asignatura.periodo', 'estudiante'])
                ->first();

            if (!$matricula) {
                return response()->json([
                    'success' => false,
                    'message' => 'El estudiante no está matriculado en esta asignatura'
                ], 404);
            }

            $notas = Nota::where('id_matricula', $matricula->id_matricula)
                ->orderBy('fecha', 'desc')
                ->get();

            $promedio = $notas->count() > 0 ? round($notas->avg('nota'), 1) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => [
                        'id' => $matricula->estudiante->id_estudiante,
                        'nombre' => $matricula->estudiante->nombreCompleto(),
                        'rut' => $matricula->estudiante->rut,
                    ],
                    'asignatura' => [
                        'id' => $matricula->asignatura->id_asignatura,
                        'curso' => $matricula->asignatura->curso->nombre,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'notas' => $notas->map(function ($n) {
                        return [
                            'id' => $n->id_nota,
                            'nombre' => $n->nombre,
                            'descripcion' => $n->descripcion,
                            'nota' => $n->nota,
                            'fecha' => $n->fecha,
                            'observaciones' => $n->observaciones,
                        ];
                    }),
                    'total_notas' => $notas->count(),
                    'promedio' => $promedio,
                    'estado' => $promedio >= 4.0 ? 'Aprobado' : 'Reprobado'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener notas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todas las notas de un estudiante
     * 
     * @param int $idEstudiante
     * @return \Illuminate\Http\JsonResponse
     */
    public function notasEstudiante($idEstudiante)
    {
        try {
            $matriculas = Matricula::where('id_estudiante', $idEstudiante)
                ->with(['asignatura.curso', 'asignatura.periodo'])
                ->get();

            $notasPorAsignatura = $matriculas->map(function ($matricula) {
                $notas = Nota::where('id_matricula', $matricula->id_matricula)
                    ->orderBy('fecha', 'desc')
                    ->get();

                $promedio = $notas->count() > 0 ? round($notas->avg('nota'), 1) : 0;

                return [
                    'asignatura' => [
                        'id' => $matricula->asignatura->id_asignatura,
                        'curso' => $matricula->asignatura->curso->nombre,
                        'codigo' => $matricula->asignatura->curso->codigo,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'notas' => $notas->map(function ($n) {
                        return [
                            'id' => $n->id_nota,
                            'nombre' => $n->nombre,
                            'nota' => $n->nota,
                            'fecha' => $n->fecha,
                        ];
                    }),
                    'total_notas' => $notas->count(),
                    'promedio' => $promedio,
                    'estado' => $promedio >= 4.0 ? 'Aprobado' : 'Reprobado'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $notasPorAsignatura
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener notas del estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
