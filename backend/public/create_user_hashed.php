<?php
// backend/public/create_user_hashed.php
// Script temporal: crear usuario con contraseña hasheada
// USO (navegador): http://localhost/CasaAzul/backend/public/create_user_hashed.php?email=demo@ejemplo.test&password=Pass1234!&nombres=Demo&apellido_paterno=User
// USO (CLI): php create_user_hashed.php email=demo@ejemplo.test password=Pass1234! nombres=Demo apellido_paterno=User

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

header('Content-Type: application/json; charset=utf-8');

try {
    // Obtener parámetros (GET, POST o CLI argv)
    $params = [];
    if (php_sapi_name() === 'cli') {
        // CLI: recibir args en forma key=value
        foreach ($argv as $i => $arg) {
            if ($i === 0) continue;
            if (strpos($arg, '=') !== false) {
                [$k, $v] = explode('=', $arg, 2);
                $params[$k] = $v;
            }
        }
    } else {
        // Web: prefer POST, si no GET
        $params = $_POST + $_GET;
    }

    // Valores mínimos requeridos
    $email = $params['email'] ?? null;
    $plainPassword = $params['password'] ?? null;
    $nombres = $params['nombres'] ?? ($params['name'] ?? 'Nombre');
    $apellido_paterno = $params['apellido_paterno'] ?? ($params['apellido'] ?? 'Apellido');

    if (!$email || !$plainPassword) {
        echo json_encode([
            'success' => false,
            'message' => 'Parámetros requeridos: email y password. Ejemplo: ?email=demo@ejemplo.test&password=Pass1234!'
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Conexión DB
    $db = Database::getInstance()->getConnection();

    // Revisar si existe email
    $check = $db->prepare("SELECT id_profesor FROM profesores WHERE email = :email LIMIT 1");
    $check->execute(['email' => $email]);
    $exists = $check->fetch(PDO::FETCH_ASSOC);

    if ($exists) {
        echo json_encode([
            'success' => false,
            'message' => 'El email ya existe en la base de datos.',
            'id' => $exists['id_profesor']
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Generar hash
    $hash = password_hash($plainPassword, PASSWORD_BCRYPT);

    // Campos extra (ajusta si tu tabla requiere otros)
    $rut = $params['rut'] ?? null;
    $apellido_materno = $params['apellido_materno'] ?? null;
    $telefono = $params['telefono'] ?? null;
    $especialidad = $params['especialidad'] ?? null;
    $id_estado = isset($params['id_estado']) ? (int)$params['id_estado'] : 1;
    $fecha_contratacion = $params['fecha_contratacion'] ?? date('Y-m-d');
    $created_at = date('Y-m-d H:i:s');
    $updated_at = date('Y-m-d H:i:s');

    // Insertar
    $stmt = $db->prepare("
        INSERT INTO profesores (
            rut, nombres, apellido_paterno, apellido_materno,
            email, password, telefono, especialidad,
            id_estado, fecha_contratacion, created_at, updated_at
        ) VALUES (
            :rut, :nombres, :apellido_paterno, :apellido_materno,
            :email, :password, :telefono, :especialidad,
            :id_estado, :fecha_contratacion, :created_at, :updated_at
        )
    ");

    $stmt->execute([
        'rut' => $rut,
        'nombres' => $nombres,
        'apellido_paterno' => $apellido_paterno,
        'apellido_materno' => $apellido_materno,
        'email' => $email,
        'password' => $hash,
        'telefono' => $telefono,
        'especialidad' => $especialidad,
        'id_estado' => $id_estado,
        'fecha_contratacion' => $fecha_contratacion,
        'created_at' => $created_at,
        'updated_at' => $updated_at
    ]);

    $newId = (int)$db->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Usuario creado correctamente con contraseña hasheada',
        'id' => $newId,
        'email' => $email,
        'password_plain' => '[oculto_por_seguridad]',
        'note' => 'Elimina este archivo después de usarlo'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// http://localhost/CasaAzul/backend/public/create_user_hashed.php?email=greydev@gmail.com&password=Crika14*&nombres=greyadmin&apellido_paterno=Admin&rut=26746895&apellido_materno=Revilla