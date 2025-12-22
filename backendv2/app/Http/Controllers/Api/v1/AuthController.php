<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Login de usuario
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('username', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            $user = Auth::user();

            // Verificar si el usuario está activo
            if (!$user->activo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario inactivo'
                ], 403);
            }

            // Actualizar último acceso
            User::where('id_usuario', $user->id_usuario)
                ->update(['ultimo_acceso' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60,
                    'user' => [
                        'id' => $user->id_usuario,
                        'username' => $user->username,
                        'email' => $user->email,
                        'rol' => $user->rol->nombre,
                        'nombre_completo' => $user->nombreCompleto(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información del usuario autenticado
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        try {
            $user = Auth::user();

            $userData = [
                'id' => $user->id_usuario,
                'username' => $user->username,
                'email' => $user->email,
                'rol' => $user->rol->nombre,
                'permisos' => $user->rol->permisos->pluck('slug'),
                'ultimo_acceso' => $user->ultimo_acceso,
            ];

            // Agregar información adicional según el rol
            if ($user->id_profesor) {
                $profesor = $user->profesor;
                $userData['profesor'] = [
                    'id' => $profesor->id_profesor,
                    'nombre_completo' => "{$profesor->nombres} {$profesor->apellido_paterno} {$profesor->apellido_materno}",
                    'rut' => $profesor->rut,
                    'especialidad' => $profesor->especialidad,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información del usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout del usuario
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refrescar token
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => config('jwt.ttl') * 60
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al refrescar token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cambiar contraseña
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            // Verificar contraseña actual
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual es incorrecta'
                ], 400);
            }

            // Actualizar contraseña
            User::where('id_usuario', $user->id_usuario)
                ->update(['password' => Hash::make($request->new_password)]);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar contraseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
