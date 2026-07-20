<?php
/**
 * Legacy API key check (header X-API-Key).
 */
require_once dirname(__FILE__) . '/../config/database.php';

function require_api_key() {
    $key = '';

    if (isset($_SERVER['HTTP_X_API_KEY'])) {
        $key = $_SERVER['HTTP_X_API_KEY'];
    } elseif (isset($_GET['api_key'])) {
        $key = $_GET['api_key'];
    }

    if ($key !== API_KEY) {
        header('HTTP/1.1 401 Unauthorized');
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => false,
            'error'   => 'Invalid or missing API key'
        ));
        exit;
    }
}
?>