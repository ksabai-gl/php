<?php
/**
 * JSON response helpers.
 */

function json_response($data, $httpCode = 200) {
    $codes = array(
        200 => 'OK',
        201 => 'Created',
        400 => 'Bad Request',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        500 => 'Internal Server Error'
    );
    $status = isset($codes[$httpCode]) ? $codes[$httpCode] : 'OK';
    header('HTTP/1.1 ' . $httpCode . ' ' . $status);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
    echo json_encode($data);
    exit;
}

function get_request_body() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = array();
        if (!empty($_POST)) {
            $data = $_POST;
        }
    }
    return $data;
}

function get_request_method() {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'POST' && isset($_POST['_method'])) {
        $method = strtoupper($_POST['_method']);
    }
    return $method;
}
?>