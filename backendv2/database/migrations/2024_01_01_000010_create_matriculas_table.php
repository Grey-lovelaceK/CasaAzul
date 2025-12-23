<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id('id_matricula');

            $table->unsignedBigInteger('id_estudiante');
            $table->foreign('id_estudiante')->references('id_estudiante')->on('estudiantes')->onDelete('cascade');

            $table->unsignedBigInteger('id_asignatura');
            $table->foreign('id_asignatura')->references('id_asignatura')->on('asignaturas')->onDelete('cascade');

            $table->date('fecha');

            $table->unsignedBigInteger('id_estado')->nullable();
            $table->foreign('id_estado')->references('id_estado')->on('estados')->onDelete('set null');

            $table->timestamps();

            $table->index('id_estudiante');
            $table->index('id_asignatura');
            $table->unique(['id_estudiante', 'id_asignatura']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};
