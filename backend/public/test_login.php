<?php
// backend/public/test_login.php
// Script para probar autenticación
// USO: http://localhost/CasaAzul/backend/public/test_login.php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Login - Casa Azul</title>
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
            max-width: 700px;
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

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        input,
        select {
            width: 100%;
            padding: 12px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }

        input:focus,
        select:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }

        button:hover {
            transform: translateY(-2px);
        }

        .result {
            margin-top: 20px;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
        }

        .success {
            background: #d4edda;
            color: #155724;
            border-color: #28a745;
        }

        .error {
            background: #f8d7da;
            color: #721c24;
            border-color: #dc3545;
        }

        .info {
            background: #d1ecf1;
            color: #0c5460;
            border-color: #17a2b8;
        }

        .detail {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }

        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }

        .credentials-list {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .credentials-list h3 {
            margin-bottom: 10px;
            color: #667eea;
        }

        .credential-item {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
            font-size: 0.9em;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Test de Autenticación</h1>
            <p>Verificar que las contraseñas funcionan</p>
        </div>
        <div class="content">

            <div class="credentials-list">
                <h3>📋 Credenciales Disponibles para Probar:</h3>
                <div class="credential-item"><strong>mgonzalez@casaazul.cl</strong> → maria2025</div>
                <div class="credential-item"><strong>jperez@casaazul.cl</strong> → juan2025</div>
                <div class="credential-item"><strong>psilva@casaazul.cl</strong> → patricia2025</div>
                <div class="credential-item"><strong>greydev@gmail.com</strong> → Crika14*</div>
            </div>

            <form method="POST">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <select name="email" id="email" required>
                        <option value="">-- Selecciona un profesor --</option>
                        <?php
                        try {
                            $db = Database::getInstance()->getConnection();
                            $stmt = $db->query("SELECT email, CONCAT(nombres, ' ', apellido_paterno) as nombre FROM profesores ORDER BY apellido_paterno");
                            while ($prof = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $selected = (isset($_POST['email']) && $_POST['email'] === $prof['email']) ? 'selected' : '';
                                echo '<option value="' . htmlspecialchars($prof['email']) . '" ' . $selected . '>' .
                                    htmlspecialchars($prof['nombre'] . ' (' . $prof['email'] . ')') . '</option>';
                            }
                        } catch (Exception $e) {
                            echo '<option value="">Error: ' . $e->getMessage() . '</option>';
                        }
                        ?>
                    </select>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="text" name="password" id="password" required
                        placeholder="Ej: maria2025, juan2025, Crika14*"
                        value="<?php echo htmlspecialchars($_POST['password'] ?? ''); ?>">
                </div>

                <button type="submit">🔍 Probar Login</button>
            </form>

            <?php
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $email = $_POST['email'] ?? '';
                $password = $_POST['password'] ?? '';

                if (!empty($email) && !empty($password)) {
                    try {
                        $db = Database::getInstance()->getConnection();

                        // Buscar usuario
                        $stmt = $db->prepare("SELECT id_profesor, nombres, apellido_paterno, email, password FROM profesores WHERE email = :email");
                        $stmt->execute(['email' => $email]);
                        $user = $stmt->fetch(PDO::FETCH_ASSOC);

                        if (!$user) {
                            echo '<div class="result error">';
                            echo '<strong>❌ Usuario no encontrado</strong><br>';
                            echo 'El email <code>' . htmlspecialchars($email) . '</code> no existe en la base de datos.';
                            echo '</div>';
                        } else {
                            // Verificar contraseña
                            $passwordMatch = password_verify($password, $user['password']);

                            if ($passwordMatch) {
                                echo '<div class="result success">';
                                echo '<h2>✅ LOGIN EXITOSO</h2>';
                                echo '<div class="detail">';
                                echo '<strong>ID:</strong> ' . $user['id_profesor'] . '<br>';
                                echo '<strong>Nombre:</strong> ' . htmlspecialchars($user['nombres'] . ' ' . $user['apellido_paterno']) . '<br>';
                                echo '<strong>Email:</strong> ' . htmlspecialchars($user['email']) . '<br>';
                                echo '<strong>Contraseña ingresada:</strong> <code>' . htmlspecialchars($password) . '</code><br>';
                                echo '<strong>Hash en BD:</strong> <code style="font-size: 0.8em;">' . substr($user['password'], 0, 50) . '...</code>';
                                echo '</div>';
                                echo '<div style="margin-top: 15px; padding: 10px; background: #d1f2eb; border-radius: 5px;">';
                                echo '✓ La función <code>password_verify()</code> retornó TRUE<br>';
                                echo '✓ Las credenciales son correctas';
                                echo '</div>';
                                echo '</div>';
                            } else {
                                echo '<div class="result error">';
                                echo '<h2>❌ LOGIN FALLIDO</h2>';
                                echo '<div class="detail">';
                                echo '<strong>Email:</strong> ' . htmlspecialchars($user['email']) . '<br>';
                                echo '<strong>Contraseña ingresada:</strong> <code>' . htmlspecialchars($password) . '</code><br>';
                                echo '<strong>Hash en BD:</strong> <code style="font-size: 0.8em;">' . substr($user['password'], 0, 50) . '...</code>';
                                echo '</div>';
                                echo '<div style="margin-top: 15px; padding: 10px; background: #f8d7da; border-radius: 5px;">';
                                echo '✗ La función <code>password_verify()</code> retornó FALSE<br>';
                                echo '✗ La contraseña no coincide con el hash';
                                echo '</div>';

                                // Información de debug
                                echo '<div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">';
                                echo '<strong>🔍 Debug Info:</strong><br>';
                                echo 'Longitud del hash: ' . strlen($user['password']) . ' caracteres<br>';
                                echo 'Tipo de hash: ' . (strpos($user['password'], '$2y$') === 0 ? 'bcrypt ✓' : 'DESCONOCIDO ✗') . '<br>';
                                echo 'Contraseña ingresada: "' . htmlspecialchars($password) . '" (' . strlen($password) . ' caracteres)<br>';

                                // Sugerencias
                                echo '<br><strong>Posibles problemas:</strong><br>';
                                echo '• Verifica que no haya espacios antes/después de la contraseña<br>';
                                echo '• La contraseña es case-sensitive (mayúsculas/minúsculas)<br>';
                                echo '• Intenta con las contraseñas sugeridas arriba';
                                echo '</div>';

                                echo '</div>';
                            }
                        }
                    } catch (Exception $e) {
                        echo '<div class="result error">';
                        echo '<strong>❌ Error de Sistema</strong><br>';
                        echo htmlspecialchars($e->getMessage());
                        echo '</div>';
                    }
                }
            }
            ?>

            <div class="result info" style="margin-top: 30px;">
                <strong>ℹ️ Cómo funciona:</strong><br>
                1. Selecciona un email de la lista<br>
                2. Ingresa la contraseña correspondiente<br>
                3. El script buscará el usuario en la BD<br>
                4. Usará <code>password_verify($password, $hash)</code> para validar<br>
                5. Te mostrará si el login es exitoso o no
            </div>

        </div>
    </div>
</body>

</html>