<?php
// ============================================
// app/Models/Estudiante.php
// ============================================

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

    public function nombreCompleto()
    {
        return "{$this->nombres} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
