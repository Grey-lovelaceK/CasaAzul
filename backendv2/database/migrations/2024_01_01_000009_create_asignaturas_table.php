<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaturas', function (Blueprint $table) {
            $table->id('id_asignatura');

            $table->unsignedBigInteger('id_curso');
            $table->foreign('id_curso')->references('id_curso')->on('cursos')->onDelete('cascade');

            $table->unsignedBigInteger('id_periodo');
            $table->foreign('id_periodo')->references('id_periodo')->on('periodos_academicos')->onDelete('cascade');

            $table->unsignedBigInteger('id_profesor')->nullable();
            $table->foreign('id_profesor')->references('id_profesor')->on('profesores')->onDelete('set null');

            $table->string('seccion', 10);
            $table->integer('cupo_maximo')->nullable();
            $table->integer('cupo_disponible')->nullable();
            $table->text('horario')->nullable();
            $table->string('sala', 20)->nullable();

            $table->unsignedBigInteger('id_estado')->nullable();
            $table->foreign('id_estado')->references('id_estado')->on('estados')->onDelete('set null');

            $table->timestamps();

            $table->index(['id_curso', 'id_periodo']);
            $table->index('id_profesor');
            $table->unique(['id_curso', 'id_periodo', 'seccion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaturas');
    }
};
