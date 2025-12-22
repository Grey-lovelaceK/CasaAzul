<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Curso;

class CursoController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Curso::query();

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'like', "%{$search}%")
                        ->orWhere('nombre', 'like', "%{$search}%");
                });
            }

            if ($request->has('nivel')) {
                $query->where('nivel', $request->nivel);
            }

            $cursos = $query->orderBy('nivel')
                ->orderBy('nombre')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $cursos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar cursos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $curso = Curso::with('asignaturas.periodo')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $curso
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener curso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:20|unique:cursos,codigo',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'creditos' => 'required|integer|min:1',
            'horas_semanales' => 'nullable|integer|min:1',
            'nivel' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $curso = Curso::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Curso creado exitosamente',
                'data' => $curso
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear curso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'sometimes|string|max:20|unique:cursos,codigo,' . $id . ',id_curso',
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string',
            'creditos' => 'sometimes|integer|min:1',
            'horas_semanales' => 'nullable|integer|min:1',
            'nivel' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $curso = Curso::findOrFail($id);
            $curso->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Curso actualizado exitosamente',
                'data' => $curso
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar curso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $curso = Curso::findOrFail($id);

            if ($curso->asignaturas()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el curso porque tiene asignaturas asociadas'
                ], 400);
            }

            $curso->delete();

            return response()->json([
                'success' => true,
                'message' => 'Curso eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar curso',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
