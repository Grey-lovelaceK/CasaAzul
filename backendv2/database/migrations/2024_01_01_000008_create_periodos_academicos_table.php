<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periodos_academicos', function (Blueprint $table) {
            $table->id('id_periodo');
            $table->string('nombre', 100);
            $table->integer('anio');
            $table->integer('semestre')->comment('1 o 2');
            $table->date('fecha_inicio');
            $table->date('fecha_termino');
            $table->boolean('activo')->default(false);

            $table->unique(['anio', 'semestre']);
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periodos_academicos');
    }
};
