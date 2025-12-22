<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Core\Response;
use App\Core\Database;

echo "Autoload OK!\n";

try {
    $db = Database::getInstance();
    echo "Database OK!\n";
} catch (Exception $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}

Response::json(['test' => 'ok']);
