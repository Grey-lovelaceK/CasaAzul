<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'cursos';
    protected $primaryKey = 'id_curso';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'creditos',
        'horas_semanales',
        'nivel',
    ];

    protected $casts = [
        'creditos' => 'integer',
        'horas_semanales' => 'integer',
        'nivel' => 'integer',
    ];

    /**
     * Un curso tiene muchas asignaturas (secciones en diferentes períodos)
     */
    public function asignaturas()
    {
        return $this->hasMany(Asignatura::class, 'id_curso', 'id_curso');
    }

    /**
     * Obtener asignaturas activas del curso
     */
    public function asignaturasActivas()
    {
        return $this->hasMany(Asignatura::class, 'id_curso', 'id_curso')
            ->whereHas('periodo', function ($q) {
                $q->where('activo', true);
            });
    }

    /**
     * Obtener nivel como texto
     */
    public function nivelTexto()
    {
        $niveles = [
            1 => 'Primero Básico',
            2 => 'Segundo Básico',
            3 => 'Tercero Básico',
            4 => 'Cuarto Básico',
            5 => 'Quinto Básico',
            6 => 'Sexto Básico',
            7 => 'Séptimo Básico',
            8 => 'Octavo Básico',
            9 => 'Primero Medio',
            10 => 'Segundo Medio',
            11 => 'Tercero Medio',
            12 => 'Cuarto Medio',
        ];

        return $niveles[$this->nivel] ?? "Nivel {$this->nivel}";
    }
}
