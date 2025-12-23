<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asignatura extends Model
{
    protected $table = 'asignaturas';
    protected $primaryKey = 'id_asignatura';

    protected $fillable = [
        'id_curso',           // CORREGIDO: debe ser id_curso, no id_periodo directamente
        'id_periodo',
        'id_profesor',
        'seccion',
        'cupo_maximo',
        'cupo_disponible',
        'horario',
        'sala',
        'id_estado',
    ];

    protected $casts = [
        'cupo_maximo' => 'integer',
        'cupo_disponible' => 'integer',
    ];

    // Relación con curso
    public function curso()
    {
        return $this->belongsTo(Curso::class, 'id_curso', 'id_curso');
    }

    // Relación con período
    public function periodo()
    {
        return $this->belongsTo(PeriodoAcademico::class, 'id_periodo', 'id_periodo');
    }

    // Relación con profesor
    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor', 'id_profesor');
    }

    // Relación con estado
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado', 'id_estado');
    }

    // Relación con matrículas
    public function matriculas()
    {
        return $this->hasMany(Matricula::class, 'id_asignatura', 'id_asignatura');
    }

    // Relación con asignaciones de profesores (suplencias)
    public function asignacionesProfesores()
    {
        return $this->hasMany(AsignacionProfesor::class, 'id_asignatura', 'id_asignatura');
    }

    // Método para obtener nombre completo de la asignatura
    public function nombreCompleto()
    {
        return "{$this->curso->nombre} - Sección {$this->seccion}";
    }
}
