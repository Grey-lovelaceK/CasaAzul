<?php
$host = '127.0.0.1';
$db   = 'casa_azul';
$user = 'root';
$pass = 'Crika14*'; // vacía si XAMPP por defecto
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Conexión exitosa 😎";
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
