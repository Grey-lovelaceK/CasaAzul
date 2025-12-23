<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos', function (Blueprint $table) {
            $table->id('id_permiso');
            $table->string('nombre', 100);
            $table->string('slug', 100)->unique();
            $table->string('descripcion', 200)->nullable();
            $table->string('modulo', 50)->nullable();
        });

        Schema::create('roles_permisos', function (Blueprint $table) {
            $table->id('id_rol_permiso');
            $table->unsignedBigInteger('id_rol');
            $table->unsignedBigInteger('id_permiso');

            $table->foreign('id_rol')->references('id_rol')->on('roles')->onDelete('cascade');
            $table->foreign('id_permiso')->references('id_permiso')->on('permisos')->onDelete('cascade');

            $table->unique(['id_rol', 'id_permiso']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles_permisos');
        Schema::dropIfExists('permisos');
    }
};
