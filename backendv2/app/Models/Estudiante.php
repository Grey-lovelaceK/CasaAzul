<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    protected $table = 'estudiantes';
    protected $primaryKey = 'id_estudiante';

    protected $fillable = [
        'rut',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'email',
        'telefono',
        'fecha_nacimiento',
        'direccion',
        'id_estado',
        'fecha_ingreso',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'fecha_ingreso' => 'date',
    ];

    // Relaciones
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado', 'id_estado');
    }

    public function matriculas()
    {
        return $this->hasMany(Matricula::class, 'id_estudiante', 'id_estudiante');
    }

    public function usuario()
    {
        return $this->hasOne(User::class, 'id_estudiante', 'id_estudiante');
    }

    // Métodos útiles
    public function nombreCompleto()
    {
        return trim("{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}");
    }

    /**
     * Obtener matrículas activas
     */
    public function matriculasActivas()
    {
        return $this->hasMany(Matricula::class, 'id_estudiante', 'id_estudiante')
            ->whereHas('asignatura.periodo', function ($q) {
                $q->where('activo', true);
            });
    }

    /**
     * Calcular promedio general del estudiante
     */
    public function promedioGeneral()
    {
        $matriculas = $this->matriculas;

        if ($matriculas->isEmpty()) {
            return 0;
        }

        $promedios = $matriculas->map(function ($matricula) {
            return $matricula->promedio();
        })->filter(function ($promedio) {
            return $promedio > 0;
        });

        if ($promedios->isEmpty()) {
            return 0;
        }

        return round($promedios->avg(), 1);
    }

    /**
     * Calcular asistencia general del estudiante
     */
    public function asistenciaGeneral()
    {
        $matriculas = $this->matriculas;

        if ($matriculas->isEmpty()) {
            return 0;
        }

        $asistencias = $matriculas->map(function ($matricula) {
            return $matricula->porcentajeAsistencia();
        })->filter(function ($asistencia) {
            return $asistencia > 0;
        });

        if ($asistencias->isEmpty()) {
            return 0;
        }

        return round($asistencias->avg(), 2);
    }

    /**
     * Verificar si el estudiante está activo
     */
    public function estaActivo()
    {
        return $this->estado && $this->estado->nombre === 'Activo';
    }

    /**
     * Obtener edad del estudiante
     */
    public function edad()
    {
        if (!$this->fecha_nacimiento) {
            return null;
        }

        return $this->fecha_nacimiento->age;
    }

    /**
     * Scope para estudiantes activos
     */
    public function scopeActivos($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('nombre', 'Activo')->where('tipo', 'estudiante');
        });
    }

    /**
     * Scope para búsqueda
     */
    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('rut', 'like', "%{$termino}%")
                ->orWhere('nombres', 'like', "%{$termino}%")
                ->orWhere('apellido_paterno', 'like', "%{$termino}%")
                ->orWhere('apellido_materno', 'like', "%{$termino}%")
                ->orWhere('email', 'like', "%{$termino}%");
        });
    }
}
