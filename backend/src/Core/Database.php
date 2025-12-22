<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?Database $instance = null;
    private PDO $connection;

    private const HOST = '127.0.0.1';
    private const PORT = '3306';
    private const DB_NAME = 'casa_azul';
    private const USERNAME = 'root';
    private const PASSWORD = 'Crika14*';
    private const CHARSET = 'utf8mb4';

    private function __construct()
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                self::HOST,
                self::PORT,
                self::DB_NAME,
                self::CHARSET
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, self::USERNAME, self::PASSWORD, $options);
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            throw new \Exception('Error de conexión a la base de datos: ' . $e->getMessage());
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    private function __clone() {}

    public function __wakeup()
    {
        throw new \Exception("Cannot unserialize singleton");
    }
}
