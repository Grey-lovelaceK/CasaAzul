<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estados', function (Blueprint $table) {
            $table->id('id_estado');
            $table->string('nombre', 50);
            $table->enum('tipo', ['estudiante', 'profesor', 'matricula', 'asignatura']);
            $table->string('descripcion', 200)->nullable();
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estados');
    }
};
