<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodoAcademico extends Model
{
    protected $table = 'periodos_academicos';
    protected $primaryKey = 'id_periodo';
    public $timestamps = false;

    protected $fillable = [
        'id_curso',
        'nombre',
        'anio',
        'semestre',
        'fecha_inicio',
        'fecha_termino',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_termino' => 'date',
        'activo' => 'boolean',
    ];

    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso', 'id_curso');
    }

    public function asignaturas()
    {
        return $this->hasMany(Asignatura::class, 'id_periodo', 'id_periodo');
    }
}
