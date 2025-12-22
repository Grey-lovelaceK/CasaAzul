<?php

/**
 * Script simple para hashear contraseñas
 * Acceder desde: http://localhost/CasaAzul/backend/public/hash_now.php
 */

// Configuración
$host = '127.0.0.1';
$dbname = 'casa_azul';
$username = 'root';
$password = 'Crika14*';

// Estilos inline
echo '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hashear Contraseñas</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545; }
        .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #17a2b8; }
        .credential { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #4CAF50; color: white; }
        tr:hover { background: #f5f5f5; }
    </style>
</head>
<body>
<div class="container">
    <h1>🔐 Hasheo de Contraseñas - Casa Azul</h1>';

try {
    // Conectar con mysqli
    $mysqli = new mysqli($host, $username, $password, $dbname);

    if ($mysqli->connect_error) {
        throw new Exception("Error de conexión: " . $mysqli->connect_error);
    }

    echo '<div class="success">✓ Conectado a la base de datos correctamente</div>';

    $mysqli->set_charset("utf8mb4");

    // Verificar contraseñas sin hashear
    $result = $mysqli->query("SELECT id_profesor, email, nombres, apellido_paterno, password FROM profesores WHERE password LIKE 'PLAIN:%'");

    if ($result->num_rows == 0) {
        echo '<div class="info">✓ No hay contraseñas pendientes de hashear. Todas las contraseñas ya están procesadas.</div>';

        // Mostrar lista de profesores
        echo '<h2>Lista de Profesores Registrados:</h2>';
        $allProfs = $mysqli->query("SELECT email, nombres, apellido_paterno, especialidad FROM profesores ORDER BY apellido_paterno");

        echo '<table>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Especialidad</th>
                    <th>Estado Password</th>
                </tr>';

        while ($prof = $allProfs->fetch_assoc()) {
            echo '<tr>
                    <td>' . htmlspecialchars($prof['nombres'] . ' ' . $prof['apellido_paterno']) . '</td>
                    <td>' . htmlspecialchars($prof['email']) . '</td>
                    <td>' . htmlspecialchars($prof['especialidad']) . '</td>
                    <td><span style="color: green;">✓ Hasheada</span></td>
                  </tr>';
        }
        echo '</table>';
    } else {
        echo '<div class="info">⚙ Procesando ' . $result->num_rows . ' contraseñas...</div>';

        // Preparar statement
        $updateStmt = $mysqli->prepare("UPDATE profesores SET password = ? WHERE id_profesor = ?");

        $contador = 0;
        $credenciales = [];

        echo '<h2>Contraseñas Procesadas:</h2>';

        while ($row = $result->fetch_assoc()) {
            $plainPassword = str_replace('PLAIN:', '', $row['password']);
            $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

            $updateStmt->bind_param("si", $hashedPassword, $row['id_profesor']);

            if ($updateStmt->execute()) {
                $contador++;
                echo '<div class="credential">';
                echo '<strong>✓ ' . htmlspecialchars($row['nombres'] . ' ' . $row['apellido_paterno']) . '</strong><br>';
                echo 'Email: ' . htmlspecialchars($row['email']) . '<br>';
                echo 'Contraseña: <code>' . htmlspecialchars($plainPassword) . '</code><br>';
                echo 'Hash: <small style="color: #666;">' . substr($hashedPassword, 0, 60) . '...</small>';
                echo '</div>';

                $credenciales[] = [
                    'email' => $row['email'],
                    'password' => $plainPassword,
                    'nombre' => $row['nombres'] . ' ' . $row['apellido_paterno']
                ];
            }
        }

        $updateStmt->close();

        echo '<div class="success">';
        echo '<h2>✓ Proceso Completado</h2>';
        echo '<p>Total de contraseñas hasheadas: <strong>' . $contador . '</strong></p>';
        echo '</div>';

        // Tabla resumen de credenciales
        echo '<h2>📋 Credenciales de Acceso (Guárdalas):</h2>';
        echo '<table>
                <tr>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Contraseña</th>
                </tr>';

        foreach ($credenciales as $cred) {
            echo '<tr>
                    <td>' . htmlspecialchars($cred['email']) . '</td>
                    <td>' . htmlspecialchars($cred['nombre']) . '</td>
                    <td><code>' . htmlspecialchars($cred['password']) . '</code></td>
                  </tr>';
        }
        echo '</table>';

        echo '<div class="info">
                <strong>⚠ IMPORTANTE:</strong><br>
                • Guarda estas credenciales en un lugar seguro<br>
                • Elimina este archivo después de usarlo<br>
                • Las contraseñas ahora están hasheadas con bcrypt<br>
              </div>';
    }

    $mysqli->close();
} catch (Exception $e) {
    echo '<div class="error">✗ ERROR: ' . htmlspecialchars($e->getMessage()) . '</div>';
}

echo '</div>
</body>
</html>';
