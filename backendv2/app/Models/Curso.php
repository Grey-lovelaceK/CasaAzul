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
        'seccion',
        'cupo_maximo',
        'cupo_disponible',
        'horario',
        'sala',
    ];

    public function periodosAcademicos()
    {
        return $this->hasMany(PeriodoAcademico::class, 'id_curso', 'id_curso');
    }
}
