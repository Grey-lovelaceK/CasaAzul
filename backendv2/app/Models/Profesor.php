<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profesor extends Model
{
    protected $table = 'profesores';
    protected $primaryKey = 'id_profesor';

    protected $fillable = [
        'rut',
        'nombres',
        'apellido_paterno',
        'apellido_materno',
        'email',
        'telefono',
        'especialidad',
        'id_estado',
        'fecha_contratacion',
    ];

    protected $casts = [
        'fecha_contratacion' => 'date',
    ];

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado', 'id_estado');
    }

    public function asignaturas()
    {
        return $this->hasMany(Asignatura::class, 'id_profesor', 'id_profesor');
    }

    public function usuario()
    {
        return $this->hasOne(User::class, 'id_profesor', 'id_profesor');
    }

    public function nombreCompleto()
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
