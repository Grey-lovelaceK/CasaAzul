<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        if (!$this->hasPermission($user, $permission)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para realizar esta acción',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }

    private function hasPermission($user, $permission)
    {
        return $user->rol->permisos()->where('slug', $permission)->exists();
    }
}
