<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    protected $table = 'matriculas';
    protected $primaryKey = 'id_matricula';
    public $timestamps = true;

    protected $fillable = [
        'id_estudiante',
        'id_asignatura',
        'fecha',
        'id_estado',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    // Relaciones
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

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class, 'id_matricula', 'id_matricula');
    }

    public function notas()
    {
        return $this->hasMany(Nota::class, 'id_matricula', 'id_matricula');
    }

    // MÉTODOS FALTANTES QUE SE USAN EN LOS CONTROLADORES

    /**
     * Calcular promedio de notas de la matrícula
     * 
     * @return float
     */
    public function promedio()
    {
        $notas = $this->notas;

        if ($notas->isEmpty()) {
            return 0;
        }

        return round($notas->avg('nota'), 1);
    }

    /**
     * Calcular porcentaje de asistencia
     * 
     * @return float
     */
    public function porcentajeAsistencia()
    {
        $asistencias = $this->asistencias;

        if ($asistencias->isEmpty()) {
            return 0;
        }

        $totalClases = $asistencias->count();
        $presentes = $asistencias->where('presente', true)->count();

        return round(($presentes / $totalClases) * 100, 2);
    }

    /**
     * Verificar si el estudiante está aprobado
     * 
     * @return bool
     */
    public function estaAprobado()
    {
        $promedio = $this->promedio();
        $asistencia = $this->porcentajeAsistencia();

        // Aprobado si promedio >= 4.0 y asistencia >= 75%
        return $promedio >= 4.0 && $asistencia >= 75;
    }

    /**
     * Obtener estado académico
     * 
     * @return string
     */
    public function estadoAcademico()
    {
        if ($this->estaAprobado()) {
            return 'Aprobado';
        }

        $promedio = $this->promedio();
        $asistencia = $this->porcentajeAsistencia();

        if ($promedio < 4.0) {
            return 'Reprobado por notas';
        }

        if ($asistencia < 75) {
            return 'Reprobado por asistencia';
        }

        return 'En curso';
    }
}
