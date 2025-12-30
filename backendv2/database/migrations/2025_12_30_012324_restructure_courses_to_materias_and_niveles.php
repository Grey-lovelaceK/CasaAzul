<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // ========================================
        // 1. CREAR TABLA MATERIAS
        // ========================================
        Schema::create('materias', function (Blueprint $table) {
            $table->id('id_materia');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('creditos')->default(4);
            $table->integer('horas_semanales')->default(4);
            $table->timestamps();
        });

        // Insertar materias
        DB::table('materias')->insert([
            ['codigo' => 'LENG', 'nombre' => 'Lenguaje y Comunicación', 'descripcion' => 'Desarrollo de habilidades de lectura, escritura y comunicación', 'creditos' => 6, 'horas_semanales' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'MAT', 'nombre' => 'Matemáticas', 'descripcion' => 'Números, álgebra, geometría y resolución de problemas', 'creditos' => 6, 'horas_semanales' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'HIST', 'nombre' => 'Historia y Geografía', 'descripcion' => 'Historia, geografía y formación ciudadana', 'creditos' => 4, 'horas_semanales' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'CIEN', 'nombre' => 'Ciencias Naturales', 'descripcion' => 'Biología, física, química y ciencias de la tierra', 'creditos' => 6, 'horas_semanales' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'ING', 'nombre' => 'Inglés', 'descripcion' => 'Idioma inglés - comprensión y expresión', 'creditos' => 3, 'horas_semanales' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'EDF', 'nombre' => 'Educación Física', 'descripcion' => 'Actividad física, deportes y vida saludable', 'creditos' => 2, 'horas_semanales' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'ART', 'nombre' => 'Artes Visuales', 'descripcion' => 'Expresión artística y creatividad', 'creditos' => 2, 'horas_semanales' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'MUS', 'nombre' => 'Música', 'descripcion' => 'Apreciación y expresión musical', 'creditos' => 2, 'horas_semanales' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'TEC', 'nombre' => 'Tecnología', 'descripcion' => 'Uso de tecnologías digitales', 'creditos' => 2, 'horas_semanales' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'FIL', 'nombre' => 'Filosofía', 'descripcion' => 'Pensamiento crítico y reflexión', 'creditos' => 3, 'horas_semanales' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'CIEN-C', 'nombre' => 'Ciencias para la Ciudadanía', 'descripcion' => 'Formación ciudadana y participación', 'creditos' => 6, 'horas_semanales' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ========================================
        // 2. CREAR TABLA NIVELES
        // ========================================
        Schema::create('niveles', function (Blueprint $table) {
            $table->id('id_nivel');
            $table->string('codigo', 10)->unique();
            $table->string('nombre', 50);
            $table->integer('orden');
            $table->enum('tipo', ['basica', 'media'])->default('basica');
            $table->timestamps();
        });

        // Insertar niveles
        DB::table('niveles')->insert([
            // Educación Básica
            ['codigo' => '1B', 'nombre' => 'Primero Básico', 'orden' => 1, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '2B', 'nombre' => 'Segundo Básico', 'orden' => 2, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '3B', 'nombre' => 'Tercero Básico', 'orden' => 3, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '4B', 'nombre' => 'Cuarto Básico', 'orden' => 4, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '5B', 'nombre' => 'Quinto Básico', 'orden' => 5, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '6B', 'nombre' => 'Sexto Básico', 'orden' => 6, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '7B', 'nombre' => 'Séptimo Básico', 'orden' => 7, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '8B', 'nombre' => 'Octavo Básico', 'orden' => 8, 'tipo' => 'basica', 'created_at' => now(), 'updated_at' => now()],
            // Educación Media
            ['codigo' => '1M', 'nombre' => 'Primero Medio', 'orden' => 9, 'tipo' => 'media', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '2M', 'nombre' => 'Segundo Medio', 'orden' => 10, 'tipo' => 'media', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '3M', 'nombre' => 'Tercero Medio', 'orden' => 11, 'tipo' => 'media', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => '4M', 'nombre' => 'Cuarto Medio', 'orden' => 12, 'tipo' => 'media', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ========================================
        // 3. MODIFICAR TABLA ASIGNATURAS
        // ========================================
        Schema::table('asignaturas', function (Blueprint $table) {
            // Agregar nuevas columnas
            $table->unsignedBigInteger('id_nivel')->nullable()->after('id_asignatura');
            $table->unsignedBigInteger('id_materia')->nullable()->after('id_nivel');
        });

        // ========================================
        // 4. MIGRAR DATOS EXISTENTES
        // ========================================
        // Mapear los cursos antiguos a nivel + materia
        $mapeo = [
            // Primero Básico
            1 => ['nivel' => '1B', 'materia' => 'LENG'], // LENG-1B
            2 => ['nivel' => '1B', 'materia' => 'MAT'],  // MAT-1B

            // Primero Medio
            3 => ['nivel' => '1M', 'materia' => 'LENG'], // LENG-1M
            4 => ['nivel' => '1M', 'materia' => 'MAT'],  // MAT-1M
            5 => ['nivel' => '1M', 'materia' => 'HIST'], // HIST-1M
            6 => ['nivel' => '1M', 'materia' => 'CIEN'], // CIEN-1M
            7 => ['nivel' => '1M', 'materia' => 'ING'],  // ING-1M
            8 => ['nivel' => '1M', 'materia' => 'EDF'],  // EDF-1M

            // Cuarto Medio
            9  => ['nivel' => '4M', 'materia' => 'LENG'],   // LENG-4M
            10 => ['nivel' => '4M', 'materia' => 'MAT'],    // MAT-4M
            11 => ['nivel' => '4M', 'materia' => 'HIST'],   // HIST-4M
            12 => ['nivel' => '4M', 'materia' => 'CIEN-C'], // CIEN-4M
            13 => ['nivel' => '4M', 'materia' => 'ING'],    // ING-4M
            14 => ['nivel' => '4M', 'materia' => 'FIL'],    // FIL-4M
        ];

        foreach ($mapeo as $idCursoViejo => $datos) {
            $nivel = DB::table('niveles')->where('codigo', $datos['nivel'])->first();
            $materia = DB::table('materias')->where('codigo', $datos['materia'])->first();

            if ($nivel && $materia) {
                DB::table('asignaturas')
                    ->where('id_curso', $idCursoViejo)
                    ->update([
                        'id_nivel' => $nivel->id_nivel,
                        'id_materia' => $materia->id_materia,
                    ]);
            }
        }

        // ========================================
        // 5. AGREGAR FOREIGN KEYS
        // ========================================
        Schema::table('asignaturas', function (Blueprint $table) {
            $table->foreign('id_nivel')->references('id_nivel')->on('niveles')->onDelete('restrict');
            $table->foreign('id_materia')->references('id_materia')->on('materias')->onDelete('restrict');
        });

        // ========================================
        // 6. MARCAR id_curso COMO NULLABLE (deprecado)
        // ========================================
        Schema::table('asignaturas', function (Blueprint $table) {
            $table->unsignedBigInteger('id_curso')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('asignaturas', function (Blueprint $table) {
            $table->dropForeign(['id_nivel']);
            $table->dropForeign(['id_materia']);
            $table->dropColumn(['id_nivel', 'id_materia']);
        });

        Schema::dropIfExists('niveles');
        Schema::dropIfExists('materias');
    }
};
