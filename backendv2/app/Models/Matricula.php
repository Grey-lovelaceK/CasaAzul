<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    protected $table = 'matriculas';
    protected $primaryKey = 'id_matricula';
    public $timestamps = false;

    protected $fillable = [
        'id_estudiante',
        'id_asignatura',
        'fecha',
        'id_estado',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante', 'id_estudiante');
    }

    public function asignatura()
    {
        return $this->belongsTo(Asignatura::class, 'id_asignatura', 'id_asignatura');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado', 'id_estado');
    }

    // public function evaluaciones()
    // {
    //     return $this->hasMany(Evaluacion::class, 'id_matricula', 'id_matricula');
    // }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_matricula', 'id_matricula');
    }

    public function notas()
    {
        return $this->hasMany(Nota::class, 'id_matricula', 'id_matricula');
    }
}
