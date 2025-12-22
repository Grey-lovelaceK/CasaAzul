<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Verificar si el usuario tiene el permiso
        if (!$this->hasPermission($user, $permission)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }

    /**
     * Verificar si el usuario tiene el permiso
     * 
     * @param $user
     * @param string $permission
     * @return bool
     */
    private function hasPermission($user, $permission)
    {
        // Verificar si el rol del usuario tiene el permiso
        return $user->rol->permisos()->where('slug', $permission)->exists();
    }
}
