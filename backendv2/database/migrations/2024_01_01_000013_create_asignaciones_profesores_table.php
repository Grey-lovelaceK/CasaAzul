<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones_profesores', function (Blueprint $table) {
            $table->id('id_asignacion');

            $table->unsignedBigInteger('id_asignatura');
            $table->foreign('id_asignatura')->references('id_asignatura')->on('asignaturas')->onDelete('cascade');

            $table->unsignedBigInteger('id_profesor');
            $table->foreign('id_profesor')->references('id_profesor')->on('profesores')->onDelete('cascade');

            $table->boolean('es_titular')->default(true);
            $table->timestamp('fecha_asignacion')->useCurrent();

            $table->timestamps();

            $table->index(['id_asignatura', 'id_profesor']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones_profesores');
    }
};
