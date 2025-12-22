<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

/* 
===============================================
INSTRUCCIONES DE INSTALACIÓN
===============================================

1. Instalar paquete CORS:
   composer require fruitcake/laravel-cors

2. El middleware ya está incluido en Laravel 11
   pero verifica en bootstrap/app.php:

   ->withMiddleware(function (Middleware $middleware) {
       $middleware->api(prepend: [
           \Illuminate\Http\Middleware\HandleCors::class,
       ]);
   })

3. Para desarrollo local, esta configuración permite:
   - Todas las origins (allowed_origins: ['*'])
   - Todos los métodos (GET, POST, PUT, DELETE, etc.)
   - Todos los headers

4. Para PRODUCCIÓN, cambia allowed_origins a:
   'allowed_origins' => [
       'https://tu-frontend.com',
       'https://www.tu-frontend.com',
   ],

===============================================
TESTING CORS
===============================================

Desde tu frontend (React, Vue, etc.) puedes probar:

fetch('http://localhost:8000/api/v1/health', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

===============================================
HEADERS REQUERIDOS EN REQUESTS
===============================================

Para requests autenticados:

headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json',
}

*/