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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'id_rol',
        'id_profesor',
        'ultimo_acceso',
        'activo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'activo' => 'boolean',
        'ultimo_acceso' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'rol' => $this->rol->nombre ?? null,
            'id_rol' => $this->id_rol,
        ];
    }

    /**
     * Relación con rol
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    /**
     * Relación con profesor
     */
    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor', 'id_profesor');
    }

    /**
     * Relación con tokens
     */
    public function tokens()
    {
        return $this->hasMany(Token::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Verificar si el usuario tiene un permiso específico
     * 
     * @param string $permission
     * @return bool
     */
    public function hasPermission($permission)
    {
        return $this->rol->permisos()->where('slug', $permission)->exists();
    }

    /**
     * Verificar si el usuario tiene un rol específico
     * 
     * @param string $roleName
     * @return bool
     */
    public function hasRole($roleName)
    {
        return $this->rol->nombre === $roleName;
    }

    /**
     * Obtener nombre completo del usuario
     * 
     * @return string
     */
    public function nombreCompleto()
    {
        if ($this->id_profesor) {
            $p = $this->profesor;
            return "{$p->nombres} {$p->apellido_paterno} {$p->apellido_materno}";
        }

        return 'Administrador';
    }

    /**
     * Scope para usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    /**
     * Scope por rol
     */
    public function scopePorRol($query, $rolName)
    {
        return $query->whereHas('rol', function ($q) use ($rolName) {
            $q->where('nombre', $rolName);
        });
    }
}
