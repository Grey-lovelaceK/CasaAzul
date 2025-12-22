<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Estudiante;
use App\Models\Matricula;

class EstudianteController extends Controller
{
    /**
     * Listar estudiantes
     */
    public function index(Request $request)
    {
        try {
            $query = Estudiante::with('estado');

            // Búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('rut', 'like', "%{$search}%")
                        ->orWhere('nombres', 'like', "%{$search}%")
                        ->orWhere('apellido_paterno', 'like', "%{$search}%")
                        ->orWhere('apellido_materno', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filtro por estado
            if ($request->has('id_estado')) {
                $query->where('id_estado', $request->id_estado);
            }

            $estudiantes = $query->orderBy('apellido_paterno')
                ->orderBy('apellido_materno')
                ->orderBy('nombres')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $estudiantes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar estudiantes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver estudiante
     */
    public function show($id)
    {
        try {
            $estudiante = Estudiante::with([
                'estado',
                'matriculas.asignatura.curso',
                'matriculas.asignatura.periodo'
            ])->findOrFail($id);

            // Calcular estadísticas
            $totalAsignaturas = $estudiante->matriculas->count();

            $promedios = $estudiante->matriculas->map(function ($matricula) {
                return [
                    'asignatura' => $matricula->asignatura->curso->nombre,
                    'seccion' => $matricula->asignatura->seccion,
                    'promedio' => $matricula->promedio(),
                    'asistencia' => $matricula->porcentajeAsistencia(),
                ];
            });

            $promedioGeneral = $promedios->avg('promedio');

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => $estudiante,
                    'estadisticas' => [
                        'total_asignaturas' => $totalAsignaturas,
                        'promedio_general' => round($promedioGeneral, 1),
                    ],
                    'asignaturas' => $promedios
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear estudiante
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rut' => 'required|string|max:12|unique:estudiantes,rut',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:50',
            'apellido_materno' => 'required|string|max:50',
            'email' => 'required|email|max:100|unique:estudiantes,email',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string',
            'id_estado' => 'nullable|exists:estados,id_estado',
            'fecha_ingreso' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $estudiante = Estudiante::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Estudiante creado exitosamente',
                'data' => $estudiante
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estudiante
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rut' => 'sometimes|string|max:12|unique:estudiantes,rut,' . $id . ',id_estudiante',
            'nombres' => 'sometimes|string|max:100',
            'apellido_paterno' => 'sometimes|string|max:50',
            'apellido_materno' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|max:100|unique:estudiantes,email,' . $id . ',id_estudiante',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string',
            'id_estado' => 'nullable|exists:estados,id_estado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $estudiante = Estudiante::findOrFail($id);
            $estudiante->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Estudiante actualizado exitosamente',
                'data' => $estudiante
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar estudiante
     */
    public function destroy($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);

            // Verificar si tiene matrículas
            if ($estudiante->matriculas()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el estudiante porque tiene matrículas registradas'
                ], 400);
            }

            $estudiante->delete();

            return response()->json([
                'success' => true,
                'message' => 'Estudiante eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver notas del estudiante
     */
    public function notas($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);

            $matriculas = Matricula::where('id_estudiante', $id)
                ->with(['asignatura.curso', 'asignatura.periodo', 'notas'])
                ->get();

            $notasPorAsignatura = $matriculas->map(function ($matricula) {
                return [
                    'asignatura' => [
                        'id' => $matricula->asignatura->id_asignatura,
                        'curso' => $matricula->asignatura->curso->nombre,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'notas' => $matricula->notas->map(function ($nota) {
                        return [
                            'id' => $nota->id_nota,
                            'nombre' => $nota->nombre,
                            'nota' => $nota->nota,
                            'fecha' => $nota->fecha,
                        ];
                    }),
                    'promedio' => $matricula->promedio(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => $estudiante->nombreCompleto(),
                    'asignaturas' => $notasPorAsignatura
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
     * Ver asistencias del estudiante
     */
    public function asistencias($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);

            $matriculas = Matricula::where('id_estudiante', $id)
                ->with(['asignatura.curso', 'asignatura.periodo', 'asistencias'])
                ->get();

            $asistenciasPorAsignatura = $matriculas->map(function ($matricula) {
                return [
                    'asignatura' => [
                        'id' => $matricula->asignatura->id_asignatura,
                        'curso' => $matricula->asignatura->curso->nombre,
                        'seccion' => $matricula->asignatura->seccion,
                        'periodo' => $matricula->asignatura->periodo->nombre,
                    ],
                    'estadisticas' => [
                        'total_clases' => $matricula->asistencias->count(),
                        'presentes' => $matricula->asistencias->where('presente', true)->count(),
                        'ausentes' => $matricula->asistencias->where('presente', false)->count(),
                        'porcentaje' => $matricula->porcentajeAsistencia(),
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => $estudiante->nombreCompleto(),
                    'asignaturas' => $asistenciasPorAsignatura
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
     * Historial académico
     */
    public function historial($id)
    {
        try {
            $estudiante = Estudiante::with([
                'matriculas.asignatura.curso',
                'matriculas.asignatura.periodo',
                'matriculas.estado'
            ])->findOrFail($id);

            $historial = $estudiante->matriculas
                ->groupBy('asignatura.periodo.nombre')
                ->map(function ($matriculasPeriodo) {
                    return $matriculasPeriodo->map(function ($matricula) {
                        return [
                            'curso' => $matricula->asignatura->curso->nombre,
                            'seccion' => $matricula->asignatura->seccion,
                            'promedio' => $matricula->promedio(),
                            'asistencia' => $matricula->porcentajeAsistencia(),
                            'estado' => $matricula->estado->nombre ?? null,
                        ];
                    });
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'estudiante' => $estudiante->nombreCompleto(),
                    'rut' => $estudiante->rut,
                    'historial' => $historial
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener historial',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
