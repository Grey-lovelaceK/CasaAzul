<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\ProfesorController;
use App\Http\Controllers\Api\V1\CursoController;
use App\Http\Controllers\Api\V1\AsignaturaController;
use App\Http\Controllers\Api\V1\MatriculaController;
use App\Http\Controllers\Api\V1\NotasController;
use App\Http\Controllers\Api\V1\AsistenciaController;
use App\Http\Controllers\Api\V1\ReporteController;
use App\Http\Controllers\Api\V1\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema Académico Casa Azul
|--------------------------------------------------------------------------
| Versión: 1.0
| Prefix: /api/v1
|
*/

// Rutas públicas
Route::prefix('v1')->group(function () {

    // ==================== AUTENTICACIÓN ====================
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        // Rutas protegidas de auth
        Route::middleware(['jwt.auth'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/change-password', [AuthController::class, 'changePassword']);
        });
    });

    // ==================== RUTAS PROTEGIDAS ====================
    Route::middleware(['jwt.auth'])->group(function () {

        // ==================== DASHBOARD ====================
        Route::prefix('dashboard')->group(function () {
            Route::get('/admin', [DashboardController::class, 'admin'])
                ->middleware('permission:reportes.index');
            Route::get('/profesor', [DashboardController::class, 'profesor'])
                ->middleware('permission:asignaturas.index');
            Route::get('/estudiante', [DashboardController::class, 'estudiante']);
        });

        // ==================== ESTUDIANTES ====================
        Route::prefix('estudiantes')->group(function () {
            Route::get('/', [EstudianteController::class, 'index'])
                ->middleware('permission:estudiantes.index');
            Route::get('/{id}', [EstudianteController::class, 'show'])
                ->middleware('permission:estudiantes.show');
            Route::post('/', [EstudianteController::class, 'store'])
                ->middleware('permission:estudiantes.create');
            Route::put('/{id}', [EstudianteController::class, 'update'])
                ->middleware('permission:estudiantes.update');
            Route::delete('/{id}', [EstudianteController::class, 'destroy'])
                ->middleware('permission:estudiantes.delete');

            // Rutas adicionales
            Route::get('/{id}/notas', [EstudianteController::class, 'notas'])
                ->middleware('permission:notas.index');
            Route::get('/{id}/asistencias', [EstudianteController::class, 'asistencias'])
                ->middleware('permission:asistencias.index');
            Route::get('/{id}/historial', [EstudianteController::class, 'historial'])
                ->middleware('permission:estudiantes.show');
        });

        // ==================== PROFESORES ====================
        Route::prefix('profesores')->group(function () {
            Route::get('/', [ProfesorController::class, 'index'])
                ->middleware('permission:profesores.index');
            Route::get('/{id}', [ProfesorController::class, 'show'])
                ->middleware('permission:profesores.show');
            Route::post('/', [ProfesorController::class, 'store'])
                ->middleware('permission:profesores.create');
            Route::put('/{id}', [ProfesorController::class, 'update'])
                ->middleware('permission:profesores.update');
            Route::delete('/{id}', [ProfesorController::class, 'destroy'])
                ->middleware('permission:profesores.delete');

            // Rutas adicionales
            Route::get('/{id}/asignaturas', [ProfesorController::class, 'asignaturas'])
                ->middleware('permission:asignaturas.index');
        });

        // ==================== CURSOS ====================
        Route::prefix('cursos')->group(function () {
            Route::get('/', [CursoController::class, 'index'])
                ->middleware('permission:cursos.index');
            Route::get('/{id}', [CursoController::class, 'show'])
                ->middleware('permission:cursos.show');
            Route::post('/', [CursoController::class, 'store'])
                ->middleware('permission:cursos.create');
            Route::put('/{id}', [CursoController::class, 'update'])
                ->middleware('permission:cursos.update');
            Route::delete('/{id}', [CursoController::class, 'destroy'])
                ->middleware('permission:cursos.delete');
        });

        // ==================== ASIGNATURAS ====================
        Route::prefix('asignaturas')->group(function () {
            Route::get('/', [AsignaturaController::class, 'index'])
                ->middleware('permission:asignaturas.index');
            Route::get('/{id}', [AsignaturaController::class, 'show'])
                ->middleware('permission:asignaturas.show');
            Route::post('/', [AsignaturaController::class, 'store'])
                ->middleware('permission:asignaturas.create');
            Route::put('/{id}', [AsignaturaController::class, 'update'])
                ->middleware('permission:asignaturas.update');
            Route::delete('/{id}', [AsignaturaController::class, 'destroy'])
                ->middleware('permission:asignaturas.delete');

            // Asignar profesor
            Route::post('/{id}/profesor', [AsignaturaController::class, 'asignarProfesor'])
                ->middleware('permission:asignaturas.update');

            // Estudiantes inscritos
            Route::get('/{id}/estudiantes', [AsignaturaController::class, 'estudiantes'])
                ->middleware('permission:asignaturas.show');
        });

        // ==================== MATRÍCULAS ====================
        Route::prefix('matriculas')->group(function () {
            Route::get('/', [MatriculaController::class, 'index'])
                ->middleware('permission:matriculas.index');

            // Matricular en curso completo (principal)
            Route::post('/matricular-curso', [MatriculaController::class, 'matricularEnCurso'])
                ->middleware('permission:matriculas.create');

            // Matricular en asignatura específica (casos especiales)
            Route::post('/', [MatriculaController::class, 'store'])
                ->middleware('permission:matriculas.create');

            Route::put('/{id}', [MatriculaController::class, 'update'])
                ->middleware('permission:matriculas.update');
            Route::delete('/{id}', [MatriculaController::class, 'destroy'])
                ->middleware('permission:matriculas.delete');

            // Retirar de curso completo
            Route::post('/retirar-curso', [MatriculaController::class, 'retirarDeCurso'])
                ->middleware('permission:matriculas.delete');

            // Ver asignaturas disponibles
            Route::get('/asignaturas-disponibles', [MatriculaController::class, 'asignaturasDisponibles'])
                ->middleware('permission:matriculas.index');
        });

        // ==================== NOTAS ====================
        Route::prefix('notas')->group(function () {
            // Listar notas (profesor/admin)
            Route::get('/', [NotasController::class, 'index'])
                ->middleware('permission:notas.index');

            // Ver mis notas (estudiante)
            Route::get('/mis-notas', [NotasController::class, 'misNotas']);

            // CRUD de notas
            Route::post('/', [NotasController::class, 'store'])
                ->middleware('permission:notas.create');
            Route::put('/{id}', [NotasController::class, 'update'])
                ->middleware('permission:notas.update');
            Route::delete('/{id}', [NotasController::class, 'destroy'])
                ->middleware('permission:notas.delete');

            // Notas por asignatura
            Route::get('/asignatura/{id}', [NotasController::class, 'porAsignatura'])
                ->middleware('permission:notas.index');

            // Cargar notas masivas
            Route::post('/cargar-masivo', [NotasController::class, 'cargarMasivo'])
                ->middleware('permission:notas.create');
        });

        // ==================== ASISTENCIAS ====================
        Route::prefix('asistencias')->group(function () {
            // Listar asistencias (profesor/admin)
            Route::get('/', [AsistenciaController::class, 'index'])
                ->middleware('permission:asistencias.index');

            // Tomar asistencia individual
            Route::post('/', [AsistenciaController::class, 'store'])
                ->middleware('permission:asistencias.create');

            // Actualizar asistencia
            Route::put('/{id}', [AsistenciaController::class, 'update'])
                ->middleware('permission:asistencias.update');

            // Tomar asistencia masiva
            Route::post('/tomar-masivo', [AsistenciaController::class, 'tomarMasivo'])
                ->middleware('permission:asistencias.create');

            // Lista de estudiantes para tomar asistencia
            Route::get('/lista-estudiantes/{id}', [AsistenciaController::class, 'listaEstudiantes'])
                ->middleware('permission:asistencias.create');

            // Asistencia por asignatura
            Route::get('/asignatura/{id}', [AsistenciaController::class, 'porAsignatura'])
                ->middleware('permission:asistencias.index');

            // Estadísticas de asistencia
            Route::get('/estadisticas/{id}', [AsistenciaController::class, 'estadisticas'])
                ->middleware('permission:asistencias.index');

            // Eliminar asistencia por fecha (para re-tomar)
            Route::delete('/eliminar-fecha', [AsistenciaController::class, 'eliminarPorFecha'])
                ->middleware('permission:asistencias.update');
        });

        // ==================== REPORTES ====================
        Route::prefix('reportes')->middleware('permission:reportes.index')->group(function () {
            // Reporte general
            Route::get('/general', [ReporteController::class, 'general']);

            // Reporte de notas
            Route::get('/notas', [ReporteController::class, 'notas'])
                ->middleware('permission:reportes.notas');
            Route::get('/notas/asignatura/{id}', [ReporteController::class, 'notasPorAsignatura']);
            Route::get('/notas/estudiante/{id}', [ReporteController::class, 'notasPorEstudiante']);

            // Reporte de asistencia
            Route::get('/asistencia', [ReporteController::class, 'asistencia'])
                ->middleware('permission:reportes.asistencia');
            Route::get('/asistencia/asignatura/{id}', [ReporteController::class, 'asistenciaPorAsignatura']);
            Route::get('/asistencia/estudiante/{id}', [ReporteController::class, 'asistenciaPorEstudiante']);

            // Reporte académico completo
            Route::get('/academico', [ReporteController::class, 'academico'])
                ->middleware('permission:reportes.academico');

            // Export PDF/Excel
            Route::get('/export/notas', [ReporteController::class, 'exportNotas']);
            Route::get('/export/asistencia', [ReporteController::class, 'exportAsistencia']);
        });

        // ==================== ESTADOS Y CATÁLOGOS ====================
        Route::prefix('catalogos')->group(function () {
            Route::get('/estados/{tipo}', [DashboardController::class, 'estados']);
            Route::get('/roles', [DashboardController::class, 'roles']);
            Route::get('/periodos', [DashboardController::class, 'periodos']);
        });
    });
});

// Ruta de health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now(),
        'service' => 'Casa Azul API'
    ]);
});
