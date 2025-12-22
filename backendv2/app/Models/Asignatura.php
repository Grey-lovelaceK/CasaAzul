<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asignatura extends Model
{
    protected $table = 'asignaturas';
    protected $primaryKey = 'id_asignatura';

    protected $fillable = [
        'id_periodo',
        'id_profesor',
        'codigo',
        'nombre',
        'descripcion',
        'creditos',
        'horas_semanales',
        'id_nivel',
        'id_estado',
    ];

    public function periodo()
    {
        return $this->belongsTo(PeriodoAcademico::class, 'id_periodo', 'id_periodo');
    }

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor', 'id_profesor');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado', 'id_estado');
    }

    public function matriculas()
    {
        return $this->hasMany(Matricula::class, 'id_asignatura', 'id_asignatura');
    }

    // public function evaluaciones()
    // {
    //     return $this->hasMany(Evaluacion::class, 'id_asignatura', 'id_asignatura');
    // }
}
