<?php
// backend/public/index.php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\AuthController;
use App\Core\Response;

// 🌟 CORS
$allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

// cross origin resource sharing 

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// MÉTODO Y RUTA
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefijos
$path = preg_replace('#^/CasaAzul/backend/public#', '', $path);
$path = preg_replace('#^/api#', '', $path);

// RUTEO
try {
    if ($path === '/auth/login' && $method === 'POST') {
        $controller = new AuthController();
        $controller->login();
    } elseif ($path === '/auth/logout' && $method === 'POST') {
        $controller = new AuthController();
        $controller->logout();
    } elseif ($path === '/auth/verify' && $method === 'GET') {
        $controller = new AuthController();
        $controller->verify();
    } elseif ($path === '/test' && $method === 'GET') {
        Response::json([
            'success' => true,
            'message' => 'API funcionando correctamente',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        Response::json([
            'success' => false,
            'message' => 'Ruta no encontrada',
            'path' => $path,
            'method' => $method
        ], 404);
    }
} catch (\Exception $e) {
    Response::json([
        'success' => false,
        'message' => 'Error del servidor',
        'error' => $e->getMessage()
    ], 500);
}
