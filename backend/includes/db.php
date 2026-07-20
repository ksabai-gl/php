<?php
/**
 * MySQLi connection helper (legacy style).
 */
require_once dirname(__FILE__) . '/../config/database.php';

function get_db_connection() {
    static $conn = null;

    if ($conn === null) {
        $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        if (!$conn) {
            header('HTTP/1.1 500 Internal Server Error');
            header('Content-Type: application/json');
            echo json_encode(array(
                'success' => false,
                'error'   => 'Database connection failed: ' . mysqli_connect_error()
            ));
            exit;
        }
        mysqli_set_charset($conn, 'utf8');
    }

    return $conn;
}

function db_escape($value) {
    $conn = get_db_connection();
    return mysqli_real_escape_string($conn, $value);
}
?>