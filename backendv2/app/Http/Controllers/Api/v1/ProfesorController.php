<?php

// ===============================================
// ProfesorController.php
// ===============================================

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Profesor;
use App\Models\User;

class ProfesorController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Profesor::with('estado');

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('rut', 'like', "%{$search}%")
                        ->orWhere('nombres', 'like', "%{$search}%")
                        ->orWhere('apellido_paterno', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('id_estado')) {
                $query->where('id_estado', $request->id_estado);
            }

            $profesores = $query->orderBy('apellido_paterno')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $profesores
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar profesores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $profesor = Profesor::with(['estado', 'asignaturas.curso', 'asignaturas.periodo'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $profesor
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rut' => 'required|string|max:12|unique:profesores,rut',
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:50',
            'apellido_materno' => 'required|string|max:50',
            'email' => 'required|email|max:100|unique:profesores,email',
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:100',
            'id_estado' => 'nullable|exists:estados,id_estado',
            'fecha_contratacion' => 'nullable|date',
            'crear_usuario' => 'nullable|boolean',
            'username' => 'required_if:crear_usuario,true|string|max:50|unique:usuarios,username',
            'password' => 'required_if:crear_usuario,true|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $profesor = Profesor::create($request->only([
                'rut',
                'nombres',
                'apellido_paterno',
                'apellido_materno',
                'email',
                'telefono',
                'especialidad',
                'id_estado',
                'fecha_contratacion'
            ]));

            // Crear usuario si se solicita
            if ($request->crear_usuario) {
                User::create([
                    'username' => $request->username,
                    'email' => $profesor->email,
                    'password' => Hash::make($request->password),
                    'id_rol' => 2, // Profesor
                    'id_profesor' => $profesor->id_profesor,
                    'activo' => true,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Profesor creado exitosamente',
                'data' => $profesor
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rut' => 'sometimes|string|max:12|unique:profesores,rut,' . $id . ',id_profesor',
            'nombres' => 'sometimes|string|max:100',
            'apellido_paterno' => 'sometimes|string|max:50',
            'apellido_materno' => 'sometimes|string|max:50',
            'email' => 'sometimes|email|max:100|unique:profesores,email,' . $id . ',id_profesor',
            'telefono' => 'nullable|string|max:20',
            'especialidad' => 'nullable|string|max:100',
            'id_estado' => 'nullable|exists:estados,id_estado',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $profesor = Profesor::findOrFail($id);
            $profesor->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Profesor actualizado exitosamente',
                'data' => $profesor
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $profesor = Profesor::findOrFail($id);

            if ($profesor->asignaturas()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el profesor porque tiene asignaturas asignadas'
                ], 400);
            }

            $profesor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Profesor eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function asignaturas($id)
    {
        try {
            $profesor = Profesor::findOrFail($id);
            $asignaturas = $profesor->asignaturas()
                ->with(['curso', 'periodo', 'estado'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'profesor' => $profesor->nombreCompleto(),
                    'asignaturas' => $asignaturas
                ]
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
