<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas', function (Blueprint $table) {
            $table->id('id_nota');

            $table->unsignedBigInteger('id_matricula');
            $table->foreign('id_matricula')->references('id_matricula')->on('matriculas')->onDelete('cascade');

            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->date('fecha');
            $table->decimal('nota', 3, 1);
            $table->text('observaciones')->nullable();

            $table->timestamps();

            $table->index('id_matricula');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
