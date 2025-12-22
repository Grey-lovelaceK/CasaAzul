<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Matricula;
use App\Models\Estudiante;
use App\Models\Curso;
use App\Models\Asignatura;
use App\Models\PeriodoAcademico;

class MatriculaController extends Controller
{
    /**
     * Listar matrículas con filtros
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Matricula::with([
                'estudiante',
                'asignatura.curso',
                'asignatura.periodo',
                'asignatura.profesor',
                'estado'
            ]);

            // Filtros
            if ($request->has('id_estudiante')) {
                $query->where('id_estudiante', $request->id_estudiante);
            }

            if ($request->has('id_asignatura')) {
                $query->where('id_asignatura', $request->id_asignatura);
            }

            if ($request->has('id_curso')) {
                $query->whereHas('asignatura', function ($q) use ($request) {
                    $q->where('id_curso', $request->id_curso);
                });
            }

            if ($request->has('id_periodo')) {
                $query->whereHas('asignatura', function ($q) use ($request) {
                    $q->where('id_periodo', $request->id_periodo);
                });
            }

            // Si es profesor, solo ver sus asignaturas
            $user = Auth::user();
            if ($user->id_rol == 2) { // Profesor
                $query->whereHas('asignatura', function ($q) use ($user) {
                    $q->where('id_profesor', $user->id_profesor);
                });
            }

            $matriculas = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $matriculas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar matrículas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Matricular estudiante en TODAS las asignaturas de un curso/nivel
     * Este es el método principal para inscribir estudiantes
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function matricularEnCurso(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_estudiante' => 'required|exists:estudiantes,id_estudiante',
            'id_curso' => 'required|exists:cursos,id_curso',
            'id_periodo' => 'required|exists:periodos_academicos,id_periodo',
            'seccion' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $estudiante = Estudiante::findOrFail($request->id_estudiante);
            $curso = Curso::findOrFail($request->id_curso);
            $periodo = PeriodoAcademico::findOrFail($request->id_periodo);

            // Buscar todas las asignaturas del curso en el período
            $queryAsignaturas = Asignatura::where('id_curso', $request->id_curso)
                ->where('id_periodo', $request->id_periodo);

            // Si se especifica sección, solo esa sección
            if ($request->has('seccion')) {
                $queryAsignaturas->where('seccion', $request->seccion);
            }

            $asignaturas = $queryAsignaturas->get();

            if ($asignaturas->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron asignaturas para este curso en el período especificado'
                ], 404);
            }

            $matriculadas = 0;
            $yaExistentes = 0;
            $errores = [];

            foreach ($asignaturas as $asignatura) {
                // Verificar si ya está matriculado
                $existe = Matricula::where('id_estudiante', $request->id_estudiante)
                    ->where('id_asignatura', $asignatura->id_asignatura)
                    ->exists();

                if ($existe) {
                    $yaExistentes++;
                    continue;
                }

                // Verificar cupos
                if ($asignatura->cupo_disponible <= 0) {
                    $errores[] = [
                        'asignatura' => $asignatura->curso->nombre . ' - Sección ' . $asignatura->seccion,
                        'error' => 'Sin cupos disponibles'
                    ];
                    continue;
                }

                try {
                    Matricula::create([
                        'id_estudiante' => $request->id_estudiante,
                        'id_asignatura' => $asignatura->id_asignatura,
                        'fecha' => now(),
                        'id_estado' => 5, // Estado: Matriculado
                    ]);

                    // Actualizar cupo disponible
                    $asignatura->decrement('cupo_disponible');

                    $matriculadas++;
                } catch (\Exception $e) {
                    $errores[] = [
                        'asignatura' => $asignatura->curso->nombre . ' - Sección ' . $asignatura->seccion,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Estudiante matriculado exitosamente",
                'data' => [
                    'estudiante' => $estudiante->nombreCompleto(),
                    'curso' => $curso->nombre,
                    'periodo' => $periodo->nombre,
                    'matriculadas' => $matriculadas,
                    'ya_existentes' => $yaExistentes,
                    'errores' => $errores,
                    'total_asignaturas' => $asignaturas->count()
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al matricular estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Matricular en una asignatura específica (casos especiales)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_estudiante' => 'required|exists:estudiantes,id_estudiante',
            'id_asignatura' => 'required|exists:asignaturas,id_asignatura',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar si ya está matriculado
            $existe = Matricula::where('id_estudiante', $request->id_estudiante)
                ->where('id_asignatura', $request->id_asignatura)
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'El estudiante ya está matriculado en esta asignatura'
                ], 400);
            }

            // Verificar cupos
            $asignatura = Asignatura::find($request->id_asignatura);
            if ($asignatura->cupo_disponible <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay cupos disponibles en esta asignatura'
                ], 400);
            }

            DB::beginTransaction();

            $matricula = Matricula::create([
                'id_estudiante' => $request->id_estudiante,
                'id_asignatura' => $request->id_asignatura,
                'fecha' => now(),
                'id_estado' => 5, // Matriculado
            ]);

            // Actualizar cupo
            $asignatura->decrement('cupo_disponible');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Matrícula creada exitosamente',
                'data' => $matricula->load('estudiante', 'asignatura.curso')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear matrícula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar estado de matrícula
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'id_estado' => 'required|exists:estados,id_estado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $matricula = Matricula::findOrFail($id);
            $matricula->update(['id_estado' => $request->id_estado]);

            return response()->json([
                'success' => true,
                'message' => 'Matrícula actualizada exitosamente',
                'data' => $matricula->load('estado')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar matrícula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar matrícula (retirar estudiante)
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $matricula = Matricula::findOrFail($id);
            $asignatura = $matricula->asignatura;

            // Devolver el cupo
            $asignatura->increment('cupo_disponible');

            $matricula->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Matrícula eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar matrícula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retirar estudiante de TODAS las asignaturas de un curso
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function retirarDeCurso(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_estudiante' => 'required|exists:estudiantes,id_estudiante',
            'id_curso' => 'required|exists:cursos,id_curso',
            'id_periodo' => 'required|exists:periodos_academicos,id_periodo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Buscar todas las matrículas del estudiante en ese curso/período
            $matriculas = Matricula::where('id_estudiante', $request->id_estudiante)
                ->whereHas('asignatura', function ($q) use ($request) {
                    $q->where('id_curso', $request->id_curso)
                        ->where('id_periodo', $request->id_periodo);
                })
                ->get();

            $eliminadas = 0;
            foreach ($matriculas as $matricula) {
                // Devolver cupo
                $matricula->asignatura->increment('cupo_disponible');
                $matricula->delete();
                $eliminadas++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Estudiante retirado de {$eliminadas} asignaturas exitosamente",
                'data' => [
                    'eliminadas' => $eliminadas
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al retirar estudiante',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ver asignaturas disponibles para matrícula
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function asignaturasDisponibles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_curso' => 'required|exists:cursos,id_curso',
            'id_periodo' => 'required|exists:periodos_academicos,id_periodo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $asignaturas = Asignatura::with(['curso', 'periodo', 'profesor', 'estado'])
                ->where('id_curso', $request->id_curso)
                ->where('id_periodo', $request->id_periodo)
                ->where('id_estado', 9) // Abierta
                ->get()
                ->map(function ($asignatura) {
                    return [
                        'id' => $asignatura->id_asignatura,
                        'curso' => $asignatura->curso->nombre,
                        'seccion' => $asignatura->seccion,
                        'profesor' => $asignatura->profesor ? $asignatura->profesor->nombreCompleto() : 'Sin asignar',
                        'horario' => $asignatura->horario,
                        'sala' => $asignatura->sala,
                        'cupo_maximo' => $asignatura->cupo_maximo,
                        'cupo_disponible' => $asignatura->cupo_disponible,
                        'tiene_cupos' => $asignatura->cupo_disponible > 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $asignaturas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asignaturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
