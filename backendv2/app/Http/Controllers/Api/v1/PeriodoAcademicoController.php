<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable, HasFactory;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'username',
        'email',
        'password',
        'id_rol',
        'id_profesor',
        'id_estudiante', // AGREGADO: faltaba esta columna
        'ultimo_acceso',
        'activo',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'ultimo_acceso' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [
            'rol' => $this->rol->nombre ?? null,
            'id_rol' => $this->id_rol,
        ];
    }

    // ===== RELACIONES =====

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor', 'id_profesor');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante', 'id_estudiante');
    }

    // ===== MÉTODOS ÚTILES =====

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    public function hasPermission($permission)
    {
        return $this->rol->permisos()->where('slug', $permission)->exists();
    }

    /**
     * Verificar si el usuario tiene un rol específico
     */
    public function hasRole($roleName)
    {
        return $this->rol && $this->rol->nombre === $roleName;
    }

    /**
     * Verificar si es administrador
     */
    public function esAdministrador()
    {
        return $this->id_rol === 1;
    }

    /**
     * Verificar si es profesor
     */
    public function esProfesor()
    {
        return $this->id_rol === 2 && $this->id_profesor;
    }

    /**
     * Verificar si es estudiante
     */
    public function esEstudiante()
    {
        return $this->id_rol === 3 && $this->id_estudiante;
    }

    /**
     * Obtener nombre completo del usuario
     */
    public function nombreCompleto()
    {
        if ($this->id_profesor) {
            $p = $this->profesor;
            return "{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}";
        }

        if ($this->id_estudiante) {
            $e = $this->estudiante;
            return "{$e->nombres} {$e->apellido_paterno} {$e->apellido_materno}";
        }

        return $this->username;
    }

    /**
     * Obtener información completa del usuario para el perfil
     */
    public function perfilCompleto()
    {
        $perfil = [
            'id' => $this->id_usuario,
            'username' => $this->username,
            'email' => $this->email,
            'rol' => $this->rol->nombre,
            'ultimo_acceso' => $this->ultimo_acceso,
        ];

        if ($this->esProfesor()) {
            $profesor = $this->profesor;
            $perfil['profesor'] = [
                'id' => $profesor->id_profesor,
                'nombre_completo' => $profesor->nombreCompleto(),
                'rut' => $profesor->rut,
                'especialidad' => $profesor->especialidad,
                'email' => $profesor->email,
                'telefono' => $profesor->telefono,
            ];
        }

        if ($this->esEstudiante()) {
            $estudiante = $this->estudiante;
            $perfil['estudiante'] = [
                'id' => $estudiante->id_estudiante,
                'nombre_completo' => $estudiante->nombreCompleto(),
                'rut' => $estudiante->rut,
                'email' => $estudiante->email,
                'telefono' => $estudiante->telefono,
                'estado' => $estudiante->estado->nombre ?? null,
            ];
        }

        return $perfil;
    }

    // ===== SCOPES =====

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorRol($query, $rolName)
    {
        return $query->whereHas('rol', function ($q) use ($rolName) {
            $q->where('nombre', $rolName);
        });
    }

    public function scopeProfesores($query)
    {
        return $query->where('id_rol', 2)->whereNotNull('id_profesor');
    }

    public function scopeEstudiantes($query)
    {
        return $query->where('id_rol', 3)->whereNotNull('id_estudiante');
    }
}
