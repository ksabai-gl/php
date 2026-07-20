<?php
/**
 * Simple health / version endpoint for the PHP backend.
 * GET /api/health.php
 */
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__FILE__) . '/../config/database.php';

$dbOk = false;
$dbError = null;

$conn = @mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($conn) {
    $dbOk = true;
    mysqli_close($conn);
} else {
    $dbError = mysqli_connect_error();
}

echo json_encode(array(
    'success'   => true,
    'service'   => 'Employee Portal PHP API',
    'version'   => '1.0.0',
    'timestamp' => date('c'),
    'database'  => $dbOk ? 'up' : 'down',
    'db_error'  => $dbError
));
?>