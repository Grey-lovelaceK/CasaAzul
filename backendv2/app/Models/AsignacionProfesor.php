<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionProfesor extends Model
{
    protected $table = 'asignaciones_profesores';
    protected $primaryKey = 'id_asignacion';

    protected $fillable = [
        'id_asignatura',
        'id_profesor',
        'es_titular',
        'fecha_asignacion',
    ];

    protected $casts = [
        'es_titular' => 'boolean',
        'fecha_asignacion' => 'datetime',
    ];

    // Relación con asignatura
    public function asignatura()
    {
        return $this->belongsTo(Asignatura::class, 'id_asignatura', 'id_asignatura');
    }

    // Relación con profesor
    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor', 'id_profesor');
    }

    /**
     * Scope para profesores titulares
     */
    public function scopeTitulares($query)
    {
        return $query->where('es_titular', true);
    }

    /**
     * Scope para profesores suplentes
     */
    public function scopeSuplentes($query)
    {
        return $query->where('es_titular', false);
    }
}
