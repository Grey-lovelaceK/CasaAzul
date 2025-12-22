<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Asignatura;
use App\Models\AsignacionProfesor;

class AsignaturaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Asignatura::with(['curso', 'periodo', 'profesor', 'estado']);

            if ($request->has('id_curso')) {
                $query->where('id_curso', $request->id_curso);
            }

            if ($request->has('id_periodo')) {
                $query->where('id_periodo', $request->id_periodo);
            }

            if ($request->has('id_profesor')) {
                $query->where('id_profesor', $request->id_profesor);
            }

            if ($request->has('id_estado')) {
                $query->where('id_estado', $request->id_estado);
            }

            $asignaturas = $query->orderBy('id_periodo', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $asignaturas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar asignaturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $asignatura = Asignatura::with([
                'curso',
                'periodo',
                'profesor',
                'estado',
                'matriculas.estudiante'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $asignatura
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asignatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_curso' => 'required|exists:cursos,id_curso',
            'id_periodo' => 'required|exists:periodos_academicos,id_periodo',
            'id_profesor' => 'nullable|exists:profesores,id_profesor',
            'seccion' => 'required|string|max:10',
            'cupo_maximo' => 'nullable|integer|min:1',
            'cupo_disponible' => 'nullable|integer|min:0',
            'horario' => 'nullable|string',
            'sala' => 'nullable|string|max:20',
            'id_estado' => 'nullable|exists:estados,id_estado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar que no exista la misma asignatura
            $existe = Asignatura::where('id_curso', $request->id_curso)
                ->where('id_periodo', $request->id_periodo)
                ->where('seccion', $request->seccion)
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una asignatura con ese curso, período y sección'
                ], 400);
            }

            $asignatura = Asignatura::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Asignatura creada exitosamente',
                'data' => $asignatura->load('curso', 'periodo', 'profesor')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear asignatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_profesor' => 'nullable|exists:profesores,id_profesor',
            'seccion' => 'sometimes|string|max:10',
            'cupo_maximo' => 'nullable|integer|min:1',
            'cupo_disponible' => 'nullable|integer|min:0',
            'horario' => 'nullable|string',
            'sala' => 'nullable|string|max:20',
            'id_estado' => 'nullable|exists:estados,id_estado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $asignatura = Asignatura::findOrFail($id);
            $asignatura->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Asignatura actualizada exitosamente',
                'data' => $asignatura
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar asignatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $asignatura = Asignatura::findOrFail($id);

            if ($asignatura->matriculas()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar la asignatura porque tiene estudiantes matriculados'
                ], 400);
            }

            $asignatura->delete();

            return response()->json([
                'success' => true,
                'message' => 'Asignatura eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar asignatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function asignarProfesor(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_profesor' => 'required|exists:profesores,id_profesor',
            'es_titular' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $asignatura = Asignatura::findOrFail($id);

            // Actualizar profesor principal
            $asignatura->update(['id_profesor' => $request->id_profesor]);

            // También crear registro en asignaciones_profesores para suplencias
            DB::table('asignaciones_profesores')->updateOrInsert(
                [
                    'id_asignatura' => $id,
                    'id_profesor' => $request->id_profesor
                ],
                [
                    'es_titular' => $request->es_titular ?? true,
                    'fecha_asignacion' => now(),
                    'created_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Profesor asignado exitosamente',
                'data' => $asignatura->load('profesor')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asignar profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function estudiantes($id)
    {
        try {
            $asignatura = Asignatura::with([
                'curso',
                'matriculas.estudiante',
                'matriculas.estado'
            ])->findOrFail($id);

            $estudiantes = $asignatura->matriculas->map(function ($matricula) {
                return [
                    'id_matricula' => $matricula->id_matricula,
                    'estudiante' => [
                        'id' => $matricula->estudiante->id_estudiante,
                        'nombre' => $matricula->estudiante->nombreCompleto(),
                        'rut' => $matricula->estudiante->rut,
                        'email' => $matricula->estudiante->email,
                    ],
                    'promedio' => $matricula->promedio(),
                    'asistencia' => $matricula->porcentajeAsistencia(),
                    'estado' => $matricula->estado->nombre ?? null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'asignatura' => [
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                    ],
                    'total_estudiantes' => $estudiantes->count(),
                    'estudiantes' => $estudiantes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estudiantes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
