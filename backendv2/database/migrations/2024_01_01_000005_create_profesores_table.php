<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profesores', function (Blueprint $table) {
            $table->id('id_profesor');
            $table->string('rut', 12)->unique();
            $table->string('nombres', 100);
            $table->string('apellido_paterno', 50);
            $table->string('apellido_materno', 50);
            $table->string('email', 100)->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('especialidad', 100)->nullable();
            $table->date('fecha_contratacion')->nullable();

            $table->unsignedBigInteger('id_estado')->nullable();
            $table->foreign('id_estado')->references('id_estado')->on('estados')->onDelete('set null');

            $table->timestamps();
            $table->index('id_estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profesores');
    }
};
