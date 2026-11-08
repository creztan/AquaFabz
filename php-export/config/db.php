<?php
// ======================================================================
// AquaFabz Water Refilling Station - Storage Engine (JSON + MySQL Fallback)
// ======================================================================

require_once __DIR__ . '/json_db.php';

$use_mysql = false; // Set to true if you are running MySQL on XAMPP / WAMP
$pdo = null;

if ($use_mysql) {
    $host = 'localhost';
    $dbname = 'aquafabz_db';
    $username = 'root';
    $password = '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        // Fall back gracefully to JSON storage
        $pdo = null;
    }
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
