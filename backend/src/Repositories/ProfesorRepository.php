<?php
// backend/src/Repositories/ProfesorRepository.php

namespace App\Repositories;

use App\Core\Database;
use PDO;

class ProfesorRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Buscar profesor por email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM profesores 
            WHERE email = :email
            LIMIT 1
        ");

        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    /**
     * Buscar profesor por ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM profesores 
            WHERE id_profesor = :id
            LIMIT 1
        ");

        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    /**
     * Buscar profesor por RUT
     */
    public function findByRut(string $rut): ?array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM profesores 
            WHERE rut = :rut
            LIMIT 1
        ");

        $stmt->execute(['rut' => $rut]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    /**
     * Obtener todos los profesores activos
     */
    public function findAllActive(): array
    {
        $stmt = $this->db->query("
            SELECT 
                id_profesor,
                rut,
                nombres,
                apellido_paterno,
                apellido_materno,
                email,
                telefono,
                especialidad,
                id_estado,
                fecha_contratacion,
                created_at
            FROM profesores 
            WHERE id_estado = 1
            ORDER BY apellido_paterno, apellido_materno, nombres
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener todos los profesores
     */
    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT 
                id_profesor,
                rut,
                nombres,
                apellido_paterno,
                apellido_materno,
                email,
                telefono,
                especialidad,
                id_estado,
                fecha_contratacion,
                created_at
            FROM profesores 
            ORDER BY apellido_paterno, apellido_materno, nombres
        ");

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Crear nuevo profesor
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare("
            INSERT INTO profesores (
                rut, nombres, apellido_paterno, apellido_materno,
                email, password, telefono, especialidad,
                id_estado, fecha_contratacion
            ) VALUES (
                :rut, :nombres, :apellido_paterno, :apellido_materno,
                :email, :password, :telefono, :especialidad,
                :id_estado, :fecha_contratacion
            )
        ");

        $stmt->execute([
            'rut' => $data['rut'],
            'nombres' => $data['nombres'],
            'apellido_paterno' => $data['apellido_paterno'],
            'apellido_materno' => $data['apellido_materno'],
            'email' => $data['email'],
            'password' => $data['password'],
            'telefono' => $data['telefono'] ?? null,
            'especialidad' => $data['especialidad'] ?? null,
            'id_estado' => $data['id_estado'] ?? 1,
            'fecha_contratacion' => $data['fecha_contratacion'] ?? date('Y-m-d')
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Actualizar profesor
     */
    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE profesores SET
                rut = :rut,
                nombres = :nombres,
                apellido_paterno = :apellido_paterno,
                apellido_materno = :apellido_materno,
                email = :email,
                telefono = :telefono,
                especialidad = :especialidad,
                id_estado = :id_estado,
                fecha_contratacion = :fecha_contratacion
            WHERE id_profesor = :id
        ");

        return $stmt->execute([
            'id' => $id,
            'rut' => $data['rut'],
            'nombres' => $data['nombres'],
            'apellido_paterno' => $data['apellido_paterno'],
            'apellido_materno' => $data['apellido_materno'],
            'email' => $data['email'],
            'telefono' => $data['telefono'] ?? null,
            'especialidad' => $data['especialidad'] ?? null,
            'id_estado' => $data['id_estado'] ?? 1,
            'fecha_contratacion' => $data['fecha_contratacion']
        ]);
    }

    /**
     * Actualizar contraseña
     */
    public function updatePassword(int $id, string $hashedPassword): bool
    {
        $stmt = $this->db->prepare("
            UPDATE profesores 
            SET password = :password 
            WHERE id_profesor = :id
        ");

        return $stmt->execute([
            'id' => $id,
            'password' => $hashedPassword
        ]);
    }

    /**
     * Eliminar profesor (soft delete)
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("
            UPDATE profesores 
            SET id_estado = 2 
            WHERE id_profesor = :id
        ");

        return $stmt->execute(['id' => $id]);
    }

    /**
     * Eliminar profesor permanentemente
     */
    public function hardDelete(int $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM profesores 
            WHERE id_profesor = :id
        ");

        return $stmt->execute(['id' => $id]);
    }
}
