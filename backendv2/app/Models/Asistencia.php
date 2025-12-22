<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    protected $table = 'asistencias';
    protected $primaryKey = 'id_asistencia';
    public $timestamps = false;

    protected $fillable = [
        'id_matricula',
        'fecha',
        'presente',
        'justificada',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
        'presente' => 'boolean',
        'justificada' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function matricula()
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }
}
