<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id('id_asistencia');

            $table->unsignedBigInteger('id_matricula');
            $table->foreign('id_matricula')->references('id_matricula')->on('matriculas')->onDelete('cascade');

            $table->date('fecha');
            $table->boolean('presente')->default(false);
            $table->boolean('justificada')->default(false);
            $table->text('observaciones')->nullable();

            $table->timestamp('created_at')->useCurrent();

            $table->index('id_matricula');
            $table->index('fecha');
            $table->index(['id_matricula', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
