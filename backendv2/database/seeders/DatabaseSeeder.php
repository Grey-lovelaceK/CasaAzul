<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. ESTADOS
        $this->seedEstados();

        // 2. ROLES Y PERMISOS
        $this->seedRolesYPermisos();

        // 3. USUARIO ADMINISTRADOR
        $this->seedAdministrador();

        // 4. PERÍODOS ACADÉMICOS
        $this->seedPeriodosAcademicos();

        // 5. CURSOS
        $this->seedCursos();

        // 6. DATOS DE PRUEBA (opcional)
        // $this->seedDatosPrueba();

        $this->command->info('Base de datos inicializada correctamente!');
    }

    private function seedEstados()
    {
        $estados = [
            // Estados para estudiantes
            ['nombre' => 'Activo', 'tipo' => 'estudiante', 'descripcion' => 'Estudiante activo', 'activo' => true],
            ['nombre' => 'Inactivo', 'tipo' => 'estudiante', 'descripcion' => 'Estudiante inactivo', 'activo' => true],
            ['nombre' => 'Egresado', 'tipo' => 'estudiante', 'descripcion' => 'Estudiante egresado', 'activo' => true],

            // Estados para profesores
            ['nombre' => 'Activo', 'tipo' => 'profesor', 'descripcion' => 'Profesor activo', 'activo' => true],
            ['nombre' => 'Inactivo', 'tipo' => 'profesor', 'descripcion' => 'Profesor inactivo', 'activo' => true],

            // Estados para matrículas
            ['nombre' => 'Matriculado', 'tipo' => 'matricula', 'descripcion' => 'Estudiante matriculado', 'activo' => true],
            ['nombre' => 'Retirado', 'tipo' => 'matricula', 'descripcion' => 'Estudiante retirado', 'activo' => true],
            ['nombre' => 'Congelado', 'tipo' => 'matricula', 'descripcion' => 'Matrícula congelada', 'activo' => true],

            // Estados para asignaturas
            ['nombre' => 'Abierta', 'tipo' => 'asignatura', 'descripcion' => 'Asignatura abierta para matrícula', 'activo' => true],
            ['nombre' => 'Cerrada', 'tipo' => 'asignatura', 'descripcion' => 'Asignatura cerrada', 'activo' => true],
            ['nombre' => 'En curso', 'tipo' => 'asignatura', 'descripcion' => 'Asignatura en curso', 'activo' => true],
            ['nombre' => 'Finalizada', 'tipo' => 'asignatura', 'descripcion' => 'Asignatura finalizada', 'activo' => true],
        ];

        foreach ($estados as $estado) {
            DB::table('estados')->insert($estado);
        }

        $this->command->info('Estados creados correctamente');
    }

    private function seedRolesYPermisos()
    {
        // ROLES
        $roles = [
            ['nombre' => 'Administrador', 'descripcion' => 'Acceso total al sistema', 'activo' => true],
            ['nombre' => 'Profesor', 'descripcion' => 'Gestión de cursos y calificaciones', 'activo' => true],
            ['nombre' => 'Estudiante', 'descripcion' => 'Consulta de información académica', 'activo' => true],
        ];

        foreach ($roles as $rol) {
            DB::table('roles')->insert($rol);
        }

        // PERMISOS
        $permisos = [
            // Estudiantes
            ['nombre' => 'Ver estudiantes', 'slug' => 'estudiantes.ver', 'descripcion' => 'Ver lista de estudiantes', 'modulo' => 'estudiantes'],
            ['nombre' => 'Crear estudiantes', 'slug' => 'estudiantes.crear', 'descripcion' => 'Crear nuevos estudiantes', 'modulo' => 'estudiantes'],
            ['nombre' => 'Editar estudiantes', 'slug' => 'estudiantes.editar', 'descripcion' => 'Editar estudiantes', 'modulo' => 'estudiantes'],
            ['nombre' => 'Eliminar estudiantes', 'slug' => 'estudiantes.eliminar', 'descripcion' => 'Eliminar estudiantes', 'modulo' => 'estudiantes'],

            // Profesores
            ['nombre' => 'Ver profesores', 'slug' => 'profesores.ver', 'descripcion' => 'Ver lista de profesores', 'modulo' => 'profesores'],
            ['nombre' => 'Crear profesores', 'slug' => 'profesores.crear', 'descripcion' => 'Crear nuevos profesores', 'modulo' => 'profesores'],
            ['nombre' => 'Editar profesores', 'slug' => 'profesores.editar', 'descripcion' => 'Editar profesores', 'modulo' => 'profesores'],
            ['nombre' => 'Eliminar profesores', 'slug' => 'profesores.eliminar', 'descripcion' => 'Eliminar profesores', 'modulo' => 'profesores'],

            // Cursos
            ['nombre' => 'Ver cursos', 'slug' => 'cursos.ver', 'descripcion' => 'Ver lista de cursos', 'modulo' => 'cursos'],
            ['nombre' => 'Crear cursos', 'slug' => 'cursos.crear', 'descripcion' => 'Crear nuevos cursos', 'modulo' => 'cursos'],
            ['nombre' => 'Editar cursos', 'slug' => 'cursos.editar', 'descripcion' => 'Editar cursos', 'modulo' => 'cursos'],
            ['nombre' => 'Eliminar cursos', 'slug' => 'cursos.eliminar', 'descripcion' => 'Eliminar cursos', 'modulo' => 'cursos'],

            // Asignaturas
            ['nombre' => 'Ver asignaturas', 'slug' => 'asignaturas.ver', 'descripcion' => 'Ver asignaturas', 'modulo' => 'asignaturas'],
            ['nombre' => 'Crear asignaturas', 'slug' => 'asignaturas.crear', 'descripcion' => 'Crear asignaturas', 'modulo' => 'asignaturas'],
            ['nombre' => 'Editar asignaturas', 'slug' => 'asignaturas.editar', 'descripcion' => 'Editar asignaturas', 'modulo' => 'asignaturas'],

            // Matrículas
            ['nombre' => 'Ver matrículas', 'slug' => 'matriculas.ver', 'descripcion' => 'Ver matrículas', 'modulo' => 'matriculas'],
            ['nombre' => 'Crear matrículas', 'slug' => 'matriculas.crear', 'descripcion' => 'Matricular estudiantes', 'modulo' => 'matriculas'],
            ['nombre' => 'Eliminar matrículas', 'slug' => 'matriculas.eliminar', 'descripcion' => 'Retirar estudiantes', 'modulo' => 'matriculas'],

            // Notas
            ['nombre' => 'Ver notas', 'slug' => 'notas.ver', 'descripcion' => 'Ver notas', 'modulo' => 'notas'],
            ['nombre' => 'Registrar notas', 'slug' => 'notas.registrar', 'descripcion' => 'Registrar notas', 'modulo' => 'notas'],
            ['nombre' => 'Editar notas', 'slug' => 'notas.editar', 'descripcion' => 'Editar notas', 'modulo' => 'notas'],
            ['nombre' => 'Eliminar notas', 'slug' => 'notas.eliminar', 'descripcion' => 'Eliminar notas', 'modulo' => 'notas'],

            // Asistencia
            ['nombre' => 'Ver asistencia', 'slug' => 'asistencia.ver', 'descripcion' => 'Ver asistencia', 'modulo' => 'asistencia'],
            ['nombre' => 'Tomar asistencia', 'slug' => 'asistencia.tomar', 'descripcion' => 'Registrar asistencia', 'modulo' => 'asistencia'],
            ['nombre' => 'Editar asistencia', 'slug' => 'asistencia.editar', 'descripcion' => 'Editar asistencia', 'modulo' => 'asistencia'],

            // Reportes
            ['nombre' => 'Ver reportes', 'slug' => 'reportes.ver', 'descripcion' => 'Ver reportes', 'modulo' => 'reportes'],
            ['nombre' => 'Exportar reportes', 'slug' => 'reportes.exportar', 'descripcion' => 'Exportar reportes', 'modulo' => 'reportes'],
        ];

        foreach ($permisos as $permiso) {
            DB::table('permisos')->insert($permiso);
        }

        // ASIGNAR PERMISOS A ROLES
        // Administrador: todos los permisos
        $todosPermisos = DB::table('permisos')->pluck('id_permiso');
        foreach ($todosPermisos as $idPermiso) {
            DB::table('roles_permisos')->insert([
                'id_rol' => 1, // Administrador
                'id_permiso' => $idPermiso,
            ]);
        }

        // Profesor: permisos limitados
        $permisosProfesor = [
            'asignaturas.ver',
            'notas.ver',
            'notas.registrar',
            'notas.editar',
            'asistencia.ver',
            'asistencia.tomar',
            'asistencia.editar',
            'estudiantes.ver',
            'matriculas.ver',
            'reportes.ver'
        ];

        foreach ($permisosProfesor as $slug) {
            $permiso = DB::table('permisos')->where('slug', $slug)->first();
            if ($permiso) {
                DB::table('roles_permisos')->insert([
                    'id_rol' => 2, // Profesor
                    'id_permiso' => $permiso->id_permiso,
                ]);
            }
        }

        // Estudiante: permisos de consulta
        $permisosEstudiante = ['notas.ver', 'asistencia.ver'];
        foreach ($permisosEstudiante as $slug) {
            $permiso = DB::table('permisos')->where('slug', $slug)->first();
            if ($permiso) {
                DB::table('roles_permisos')->insert([
                    'id_rol' => 3, // Estudiante
                    'id_permiso' => $permiso->id_permiso,
                ]);
            }
        }

        $this->command->info('Roles y permisos creados correctamente');
    }

    private function seedAdministrador()
    {
        DB::table('usuarios')->insert([
            'username' => 'admin',
            'email' => 'admin@casaazul.cl',
            'password' => Hash::make('admin123'),
            'id_rol' => 1, // Administrador
            'activo' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Usuario administrador creado - username: admin, password: admin123');
    }

    private function seedPeriodosAcademicos()
    {
        $periodos = [
            [
                'nombre' => 'Primer Semestre 2024',
                'anio' => 2024,
                'semestre' => 1,
                'fecha_inicio' => '2024-03-01',
                'fecha_termino' => '2024-07-31',
                'activo' => false,
            ],
            [
                'nombre' => 'Segundo Semestre 2024',
                'anio' => 2024,
                'semestre' => 2,
                'fecha_inicio' => '2024-08-01',
                'fecha_termino' => '2024-12-31',
                'activo' => false,
            ],
            [
                'nombre' => 'Primer Semestre 2025',
                'anio' => 2025,
                'semestre' => 1,
                'fecha_inicio' => '2025-03-01',
                'fecha_termino' => '2025-07-31',
                'activo' => true, // Período activo
            ],
        ];

        foreach ($periodos as $periodo) {
            DB::table('periodos_academicos')->insert($periodo);
        }

        $this->command->info('Períodos académicos creados correctamente');
    }

    private function seedCursos()
    {
        $cursos = [
            // Educación Básica
            ['codigo' => 'LENG-1B', 'nombre' => 'Lenguaje y Comunicación', 'descripcion' => 'Primero Básico', 'creditos' => 6, 'horas_semanales' => 8, 'nivel' => 1],
            ['codigo' => 'MAT-1B', 'nombre' => 'Matemáticas', 'descripcion' => 'Primero Básico', 'creditos' => 6, 'horas_semanales' => 8, 'nivel' => 1],

            // Educación Media
            ['codigo' => 'LENG-1M', 'nombre' => 'Lengua y Literatura', 'descripcion' => 'Primero Medio', 'creditos' => 6, 'horas_semanales' => 6, 'nivel' => 9],
            ['codigo' => 'MAT-1M', 'nombre' => 'Matemáticas', 'descripcion' => 'Primero Medio', 'creditos' => 6, 'horas_semanales' => 7, 'nivel' => 9],
            ['codigo' => 'HIST-1M', 'nombre' => 'Historia y Geografía', 'descripcion' => 'Primero Medio', 'creditos' => 4, 'horas_semanales' => 4, 'nivel' => 9],
            ['codigo' => 'CIEN-1M', 'nombre' => 'Ciencias Naturales', 'descripcion' => 'Primero Medio', 'creditos' => 6, 'horas_semanales' => 6, 'nivel' => 9],
            ['codigo' => 'ING-1M', 'nombre' => 'Inglés', 'descripcion' => 'Primero Medio', 'creditos' => 3, 'horas_semanales' => 3, 'nivel' => 9],
            ['codigo' => 'EDF-1M', 'nombre' => 'Educación Física', 'descripcion' => 'Primero Medio', 'creditos' => 2, 'horas_semanales' => 2, 'nivel' => 9],

            // Cuarto Medio
            ['codigo' => 'LENG-4M', 'nombre' => 'Lengua y Literatura', 'descripcion' => 'Cuarto Medio', 'creditos' => 6, 'horas_semanales' => 6, 'nivel' => 12],
            ['codigo' => 'MAT-4M', 'nombre' => 'Matemáticas', 'descripcion' => 'Cuarto Medio', 'creditos' => 6, 'horas_semanales' => 7, 'nivel' => 12],
            ['codigo' => 'HIST-4M', 'nombre' => 'Historia y Ciencias Sociales', 'descripcion' => 'Cuarto Medio', 'creditos' => 4, 'horas_semanales' => 4, 'nivel' => 12],
            ['codigo' => 'CIEN-4M', 'nombre' => 'Ciencias para la Ciudadanía', 'descripcion' => 'Cuarto Medio', 'creditos' => 6, 'horas_semanales' => 6, 'nivel' => 12],
            ['codigo' => 'ING-4M', 'nombre' => 'Inglés', 'descripcion' => 'Cuarto Medio', 'creditos' => 3, 'horas_semanales' => 3, 'nivel' => 12],
            ['codigo' => 'FIL-4M', 'nombre' => 'Filosofía', 'descripcion' => 'Cuarto Medio', 'creditos' => 3, 'horas_semanales' => 3, 'nivel' => 12],
        ];

        foreach ($cursos as $curso) {
            DB::table('cursos')->insert(array_merge($curso, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Cursos creados correctamente');
    }
}
