<?php
// backend/public/update_passwords.php
// Script para hashear contraseñas que están en formato PLAIN:
// USO (navegador): http://localhost/CasaAzul/backend/public/update_passwords.php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actualizar Contraseñas - Casa Azul</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .content {
            padding: 30px;
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-weight: 500;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }

        .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }

        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }

        .credential-card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-left: 4px solid #667eea;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }

        .credential-card h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.1em;
        }

        .credential-card .detail {
            margin: 5px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.95em;
        }

        .credential-card .password {
            background: white;
            padding: 8px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 5px;
            color: #28a745;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }

        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }

        tr:hover {
            background: #f8f9fa;
        }

        .summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .summary h2 {
            margin-bottom: 10px;
        }

        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Actualización de Contraseñas</h1>
            <p>Sistema de Gestión Académica - Casa Azul</p>
        </div>
        <div class="content">
            <?php

            try {
                // Conectar a la base de datos
                $db = Database::getInstance()->getConnection();

                echo '<div class="alert alert-success">✓ Conexión exitosa a la base de datos</div>';

                // Buscar profesores con contraseñas sin hashear
                $stmt = $db->query("SELECT id_profesor, rut, nombres, apellido_paterno, apellido_materno, email, password, especialidad 
                        FROM profesores 
                        WHERE password LIKE 'PLAIN:%' 
                        ORDER BY apellido_paterno");

                $profesores = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($profesores)) {
                    echo '<div class="alert alert-info">';
                    echo '<strong>✓ No hay contraseñas pendientes</strong><br>';
                    echo 'Todas las contraseñas ya están hasheadas correctamente.';
                    echo '</div>';

                    // Mostrar lista de todos los profesores
                    echo '<h2>📋 Profesores Registrados:</h2>';
                    $allStmt = $db->query("SELECT nombres, apellido_paterno, email, especialidad, 
                               CASE 
                                   WHEN password LIKE '\$2y\$%' THEN 'Hasheada ✓'
                                   WHEN password LIKE 'PLAIN:%' THEN 'Sin hashear ✗'
                                   ELSE 'Hasheada ✓'
                               END as estado_password
                               FROM profesores 
                               ORDER BY apellido_paterno");

                    echo '<table>';
                    echo '<tr><th>Nombre</th><th>Email</th><th>Especialidad</th><th>Estado Password</th></tr>';

                    while ($prof = $allStmt->fetch(PDO::FETCH_ASSOC)) {
                        $statusColor = ($prof['estado_password'] === 'Hasheada ✓') ? 'color: green;' : 'color: red;';
                        echo '<tr>';
                        echo '<td>' . htmlspecialchars($prof['nombres'] . ' ' . $prof['apellido_paterno']) . '</td>';
                        echo '<td>' . htmlspecialchars($prof['email']) . '</td>';
                        echo '<td>' . htmlspecialchars($prof['especialidad'] ?? 'N/A') . '</td>';
                        echo '<td style="' . $statusColor . '">' . $prof['estado_password'] . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                } else {
                    echo '<div class="alert alert-info">';
                    echo '<strong>⚙ Procesando...</strong><br>';
                    echo 'Se encontraron ' . count($profesores) . ' contraseñas que necesitan ser hasheadas.';
                    echo '</div>';

                    $updateStmt = $db->prepare("UPDATE profesores SET password = :password, updated_at = NOW() WHERE id_profesor = :id");

                    $contador = 0;
                    $credenciales = [];

                    echo '<h2>✨ Contraseñas Actualizadas:</h2>';

                    foreach ($profesores as $profesor) {
                        // Extraer contraseña en texto plano
                        $plainPassword = str_replace('PLAIN:', '', $profesor['password']);

                        // Generar hash con bcrypt
                        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);

                        // Actualizar en la base de datos
                        $success = $updateStmt->execute([
                            'password' => $hashedPassword,
                            'id' => $profesor['id_profesor']
                        ]);

                        if ($success) {
                            $contador++;

                            echo '<div class="credential-card">';
                            echo '<h3>' . htmlspecialchars($profesor['nombres'] . ' ' . $profesor['apellido_paterno'] . ' ' . $profesor['apellido_materno']) . '</h3>';
                            echo '<div class="detail"><strong>Email:</strong> ' . htmlspecialchars($profesor['email']) . '</div>';
                            echo '<div class="detail"><strong>RUT:</strong> ' . htmlspecialchars($profesor['rut']) . '</div>';
                            echo '<div class="detail"><strong>Especialidad:</strong> ' . htmlspecialchars($profesor['especialidad'] ?? 'N/A') . '</div>';
                            echo '<div class="detail"><strong>Contraseña:</strong> <span class="password">' . htmlspecialchars($plainPassword) . '</span></div>';
                            echo '<div class="detail" style="font-size: 0.85em; color: #666;"><strong>Hash:</strong> ' . substr($hashedPassword, 0, 60) . '...</div>';
                            echo '</div>';

                            // Guardar para resumen
                            $credenciales[] = [
                                'nombre' => $profesor['nombres'] . ' ' . $profesor['apellido_paterno'],
                                'email' => $profesor['email'],
                                'password' => $plainPassword
                            ];
                        }
                    }

                    // Resumen final
                    echo '<div class="summary">';
                    echo '<h2>✓ Proceso Completado Exitosamente</h2>';
                    echo '<p><strong>Total de contraseñas hasheadas:</strong> ' . $contador . '</p>';
                    echo '</div>';

                    // Tabla resumen de credenciales
                    echo '<h2>📋 Resumen de Credenciales (Guarda esta información):</h2>';
                    echo '<table>';
                    echo '<tr><th>Nombre</th><th>Email</th><th>Contraseña</th></tr>';

                    foreach ($credenciales as $cred) {
                        echo '<tr>';
                        echo '<td>' . htmlspecialchars($cred['nombre']) . '</td>';
                        echo '<td>' . htmlspecialchars($cred['email']) . '</td>';
                        echo '<td><code>' . htmlspecialchars($cred['password']) . '</code></td>';
                        echo '</tr>';
                    }
                    echo '</table>';

                    // Advertencias importantes
                    echo '<div class="alert alert-warning">';
                    echo '<strong>⚠ IMPORTANTE - Por Seguridad:</strong><br>';
                    echo '1. Guarda estas credenciales en un lugar seguro<br>';
                    echo '2. <strong>ELIMINA este archivo (update_passwords.php) después de usarlo</strong><br>';
                    echo '3. Las contraseñas ahora están hasheadas con bcrypt (PASSWORD_BCRYPT)<br>';
                    echo '4. Para validar logins, usa <code>password_verify($password, $hash)</code>';
                    echo '</div>';
                }
            } catch (\Exception $e) {
                echo '<div class="alert alert-error">';
                echo '<strong>✗ Error:</strong><br>';
                echo htmlspecialchars($e->getMessage());
                echo '</div>';
            }

            ?>
        </div>
    </div>
</body>

</html>