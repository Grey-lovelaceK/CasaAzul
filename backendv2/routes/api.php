<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\ProfesorController;
use App\Http\Controllers\Api\V1\CursoController;
use App\Http\Controllers\Api\V1\AsignaturaController;
use App\Http\Controllers\Api\V1\MatriculaController;
use App\Http\Controllers\Api\V1\NotasController;
use App\Http\Controllers\Api\V1\AsistenciaController;
use App\Http\Controllers\Api\V1\ReporteController;

/*
|--------------------------------------------------------------------------
| API Routes - Casa Azul Académico
|--------------------------------------------------------------------------
*/

// Rutas públicas (sin autenticación)
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas (requieren autenticación JWT)
Route::prefix('v1')->middleware(['jwt.auth'])->group(function () {

    // ===== AUTENTICACIÓN =====
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // ===== DASHBOARD =====
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);
    Route::get('/dashboard/profesor', [DashboardController::class, 'profesor']);
    Route::get('/dashboard/estados/{tipo}', [DashboardController::class, 'estados']);
    Route::get('/dashboard/roles', [DashboardController::class, 'roles']);
    Route::get('/dashboard/periodos', [DashboardController::class, 'periodos']);

    // ===== ESTUDIANTES =====
    Route::prefix('estudiantes')->group(function () {
        Route::get('/', [EstudianteController::class, 'index']);
        Route::post('/', [EstudianteController::class, 'store']);
        Route::get('/{id}', [EstudianteController::class, 'show']);
        Route::put('/{id}', [EstudianteController::class, 'update']);
        Route::delete('/{id}', [EstudianteController::class, 'destroy']);

        // Información académica del estudiante
        Route::get('/{id}/notas', [EstudianteController::class, 'notas']);
        Route::get('/{id}/asistencias', [EstudianteController::class, 'asistencias']);
        Route::get('/{id}/historial', [EstudianteController::class, 'historial']);
    });

    // ===== PROFESORES =====
    Route::prefix('profesores')->group(function () {
        Route::get('/', [ProfesorController::class, 'index']);
        Route::post('/', [ProfesorController::class, 'store']);
        Route::get('/{id}', [ProfesorController::class, 'show']);
        Route::put('/{id}', [ProfesorController::class, 'update']);
        Route::delete('/{id}', [ProfesorController::class, 'destroy']);
        Route::get('/{id}/asignaturas', [ProfesorController::class, 'asignaturas']);
    });

    // ===== CURSOS =====
    Route::prefix('cursos')->group(function () {
        Route::get('/', [CursoController::class, 'index']);
        Route::post('/', [CursoController::class, 'store']);
        Route::get('/{id}', [CursoController::class, 'show']);
        Route::put('/{id}', [CursoController::class, 'update']);
        Route::delete('/{id}', [CursoController::class, 'destroy']);
    });

    // ===== ASIGNATURAS =====
    Route::prefix('asignaturas')->group(function () {
        Route::get('/', [AsignaturaController::class, 'index']);
        Route::post('/', [AsignaturaController::class, 'store']);
        Route::get('/{id}', [AsignaturaController::class, 'show']);
        Route::put('/{id}', [AsignaturaController::class, 'update']);
        Route::delete('/{id}', [AsignaturaController::class, 'destroy']);

        // Gestión de asignaturas
        Route::post('/{id}/asignar-profesor', [AsignaturaController::class, 'asignarProfesor']);
        Route::get('/{id}/estudiantes', [AsignaturaController::class, 'estudiantes']);
    });

    // ===== MATRÍCULAS =====
    Route::prefix('matriculas')->group(function () {
        Route::get('/', [MatriculaController::class, 'index']);
        Route::post('/', [MatriculaController::class, 'store']); // Matrícula individual
        Route::put('/{id}', [MatriculaController::class, 'update']);
        Route::delete('/{id}', [MatriculaController::class, 'destroy']);

        // Matrícula masiva (método principal)
        Route::post('/matricular-curso', [MatriculaController::class, 'matricularEnCurso']);
        Route::post('/retirar-curso', [MatriculaController::class, 'retirarDeCurso']);
        Route::get('/asignaturas-disponibles', [MatriculaController::class, 'asignaturasDisponibles']);
    });

    // ===== NOTAS =====
    Route::prefix('notas')->group(function () {
        Route::get('/', [NotasController::class, 'index']);
        Route::post('/', [NotasController::class, 'store']);
        Route::put('/{id}', [NotasController::class, 'update']);
        Route::delete('/{id}', [NotasController::class, 'destroy']);

        // Consultas específicas
        Route::get('/asignatura/{id}', [NotasController::class, 'porAsignatura']);
        Route::get('/estudiante/{id}', [NotasController::class, 'notasEstudiante']);
        Route::get('/estudiante/{idEstudiante}/asignatura/{idAsignatura}', [NotasController::class, 'notasEstudianteAsignatura']);

        // Carga masiva
        Route::post('/cargar-masivo', [NotasController::class, 'cargarMasivo']);
    });

    // ===== ASISTENCIA =====
    Route::prefix('asistencias')->group(function () {
        Route::get('/', [AsistenciaController::class, 'index']);
        Route::post('/', [AsistenciaController::class, 'store']);
        Route::put('/{id}', [AsistenciaController::class, 'update']);

        // Toma de asistencia
        Route::post('/tomar-masivo', [AsistenciaController::class, 'tomarMasivo']);
        Route::get('/asignatura/{id}', [AsistenciaController::class, 'porAsignatura']);
        Route::get('/asignatura/{id}/lista-estudiantes', [AsistenciaController::class, 'listaEstudiantes']);
        Route::delete('/eliminar-fecha', [AsistenciaController::class, 'eliminarPorFecha']);
        Route::get('/asignatura/{id}/estadisticas', [AsistenciaController::class, 'estadisticas']);
    });

    // ===== REPORTES =====
    Route::prefix('reportes')->group(function () {
        Route::get('/general', [ReporteController::class, 'general']);
        Route::get('/academico', [ReporteController::class, 'academico']);

        // Reportes de notas
        Route::get('/notas', [ReporteController::class, 'notas']);
        Route::get('/notas/asignatura/{id}', [ReporteController::class, 'notasPorAsignatura']);
        Route::get('/notas/estudiante/{id}', [ReporteController::class, 'notasPorEstudiante']);

        // Reportes de asistencia
        Route::get('/asistencia', [ReporteController::class, 'asistencia']);
        Route::get('/asistencia/asignatura/{id}', [ReporteController::class, 'asistenciaPorAsignatura']);
        Route::get('/asistencia/estudiante/{id}', [ReporteController::class, 'asistenciaPorEstudiante']);

        // Exportaciones (pendientes de implementar en frontend)
        Route::post('/exportar/notas', [ReporteController::class, 'exportNotas']);
        Route::post('/exportar/asistencia', [ReporteController::class, 'exportAsistencia']);
    });
});

// Ruta de prueba
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API Casa Azul Académico funcionando correctamente',
        'version' => '1.0.0',
        'timestamp' => now()->toDateTimeString()
    ]);
});
