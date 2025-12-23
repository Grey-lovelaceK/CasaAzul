<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id('id_curso');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('creditos')->default(0);
            $table->integer('horas_semanales')->nullable();
            $table->integer('nivel')->nullable()->comment('1-8: Básica, 9-12: Media');
            $table->timestamps();

            $table->index('nivel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
