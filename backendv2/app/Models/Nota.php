<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    protected $table = 'notas';
    protected $primaryKey = 'id_nota';

    protected $fillable = [
        'id_matricula',
        'nombre',
        'descripcion',
        'nota',
        'fecha',
        'observaciones',
    ];

    protected $casts = [
        'fecha' => 'date',
        'nota' => 'decimal:1',
    ];

    public function matricula()
    {
        return $this->belongsTo(Matricula::class, 'id_matricula', 'id_matricula');
    }
}
