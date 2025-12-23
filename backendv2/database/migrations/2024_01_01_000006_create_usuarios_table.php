<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('username', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('password');

            $table->unsignedBigInteger('id_rol');
            $table->foreign('id_rol')->references('id_rol')->on('roles')->onDelete('cascade');

            $table->unsignedBigInteger('id_profesor')->nullable();
            $table->foreign('id_profesor')->references('id_profesor')->on('profesores')->onDelete('cascade');

            $table->unsignedBigInteger('id_estudiante')->nullable();
            $table->foreign('id_estudiante')->references('id_estudiante')->on('estudiantes')->onDelete('cascade');

            $table->timestamp('ultimo_acceso')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index('id_rol');
            $table->index('id_profesor');
            $table->index('id_estudiante');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
