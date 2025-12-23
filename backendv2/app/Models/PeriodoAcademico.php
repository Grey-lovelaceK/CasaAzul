<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodoAcademico extends Model
{
    protected $table = 'periodos_academicos';
    protected $primaryKey = 'id_periodo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'anio',
        'semestre',
        'fecha_inicio',
        'fecha_termino',
        'activo',
    ];

    protected $casts = [
        'anio' => 'integer',
        'semestre' => 'integer',
        'fecha_inicio' => 'date',
        'fecha_termino' => 'date',
        'activo' => 'boolean',
    ];

    /**
     * Un período tiene muchas asignaturas
     */
    public function asignaturas()
    {
        return $this->hasMany(Asignatura::class, 'id_periodo', 'id_periodo');
    }

    /**
     * Verificar si el período está vigente
     */
    public function estaVigente()
    {
        $hoy = now();
        return $this->activo &&
            $hoy->greaterThanOrEqualTo($this->fecha_inicio) &&
            $hoy->lessThanOrEqualTo($this->fecha_termino);
    }

    /**
     * Scope para períodos activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para período vigente
     */
    public function scopeVigente($query)
    {
        $hoy = now();
        return $query->where('activo', true)
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->whereDate('fecha_termino', '>=', $hoy);
    }

    /**
     * Obtener nombre completo del período
     */
    public function nombreCompleto()
    {
        return "{$this->nombre} ({$this->anio})";
    }
}
