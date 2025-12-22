<?php
// backend/src/Controllers/AuthController.php

namespace App\Controllers;

use App\Core\Response;
use App\Services\AuthService;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * Login de usuario
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    public function login(): void
    {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            // Validar datos requeridos
            if (!isset($data['email']) || !isset($data['password'])) {
                Response::json([
                    'success' => false,
                    'message' => 'Email y contraseña son requeridos'
                ], 400);
                return;
            }

            // Validar email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                Response::json([
                    'success' => false,
                    'message' => 'Email inválido'
                ], 400);
                return;
            }

            // Intentar login
            $result = $this->authService->login(
                $data['email'],
                $data['password']
            );

            if ($result['success']) {
                Response::json([
                    'success' => true,
                    'message' => 'Login exitoso',
                    'data' => [
                        'user' => $result['user'],
                        'token' => $result['token'] ?? null
                    ]
                ], 200);
            } else {
                Response::json([
                    'success' => false,
                    'message' => $result['message']
                ], 401);
            }
        } catch (\Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage()
            ], 500);
        }
    }


    public function logout(): void
    {
        try {
            session_start();
            session_destroy();

            Response::json([
                'success' => true,
                'message' => 'Sesión cerrada correctamente'
            ], 200);
        } catch (\Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Error al cerrar sesión'
            ], 500);
        }
    }

    /**
     * Verificar sesión actual
     * GET /api/auth/verify
     */
    public function verify(): void
    {
        try {
            session_start();

            if (isset($_SESSION['user_id'])) {
                $user = $this->authService->getUserById($_SESSION['user_id']);

                Response::json([
                    'success' => true,
                    'authenticated' => true,
                    'user' => $user
                ], 200);
            } else {
                Response::json([
                    'success' => true,
                    'authenticated' => false
                ], 200);
            }
        } catch (\Exception $e) {
            Response::json([
                'success' => false,
                'message' => 'Error al verificar sesión'
            ], 500);
        }
    }
}
