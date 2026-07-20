<?php
/**
 * Employee CRUD API
 *
 * GET    /api/employees.php           – list (optional ?dept=)
 * GET    /api/employees.php?id=N      – get one
 * POST   /api/employees.php           – create
 * PUT    /api/employees.php           – update (body must include id)
 * DELETE /api/employees.php?id=N      – delete
 */

require_once dirname(__FILE__) . '/../includes/db.php';
require_once dirname(__FILE__) . '/../includes/auth.php';
require_once dirname(__FILE__) . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_response(array('success' => true));
}

require_api_key();

$method = get_request_method();
$conn   = get_db_connection();

switch ($method) {
    case 'GET':
        handle_get($conn);
        break;
    case 'POST':
        handle_post($conn);
        break;
    case 'PUT':
        handle_put($conn);
        break;
    case 'DELETE':
        handle_delete($conn);
        break;
    default:
        json_response(array('success' => false, 'error' => 'Method not allowed'), 405);
}

function handle_get($conn) {
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $id = intval($_GET['id']);
        $sql = "SELECT e.id, e.emp_code, e.first_name, e.last_name, e.email,
                       e.phone, e.department_id, d.name AS department_name,
                       e.job_title, e.status, e.hire_date, e.created_at
                FROM employees e
                LEFT JOIN departments d ON d.id = e.department_id
                WHERE e.id = " . $id;
        $result = mysqli_query($conn, $sql);
        if (!$result) {
            json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
        }
        $row = mysqli_fetch_assoc($result);
        if (!$row) {
            json_response(array('success' => false, 'error' => 'Employee not found'), 404);
        }
        json_response(array('success' => true, 'data' => $row));
    }

    $where = '1=1';
    if (isset($_GET['dept']) && $_GET['dept'] !== '') {
        $dept = intval($_GET['dept']);
        $where .= ' AND e.department_id = ' . $dept;
    }
    if (isset($_GET['q']) && trim($_GET['q']) !== '') {
        $q = db_escape(trim($_GET['q']));
        $where .= " AND (e.first_name LIKE '%{$q}%' OR e.last_name LIKE '%{$q}%' OR e.emp_code LIKE '%{$q}%' OR e.email LIKE '%{$q}%')";
    }

    $sql = "SELECT e.id, e.emp_code, e.first_name, e.last_name, e.email,
                   e.phone, e.department_id, d.name AS department_name,
                   e.job_title, e.status, e.hire_date
            FROM employees e
            LEFT JOIN departments d ON d.id = e.department_id
            WHERE {$where}
            ORDER BY e.last_name, e.first_name";
    $result = mysqli_query($conn, $sql);
    if (!$result) {
        json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
    }

    $rows = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
    }
    json_response(array('success' => true, 'count' => count($rows), 'data' => $rows));
}

function handle_post($conn) {
    $body = get_request_body();

    $emp_code      = isset($body['emp_code']) ? trim($body['emp_code']) : '';
    $first_name    = isset($body['first_name']) ? trim($body['first_name']) : '';
    $last_name     = isset($body['last_name']) ? trim($body['last_name']) : '';
    $email         = isset($body['email']) ? trim($body['email']) : '';
    $phone         = isset($body['phone']) ? trim($body['phone']) : '';
    $department_id = isset($body['department_id']) ? intval($body['department_id']) : 0;
    $job_title     = isset($body['job_title']) ? trim($body['job_title']) : '';
    $status        = isset($body['status']) ? trim($body['status']) : 'ACTIVE';
    $hire_date     = isset($body['hire_date']) ? trim($body['hire_date']) : date('Y-m-d');

    if ($emp_code === '' || $first_name === '' || $last_name === '' || $email === '') {
        json_response(array('success' => false, 'error' => 'emp_code, first_name, last_name and email are required'), 400);
    }

    $sql = sprintf(
        "INSERT INTO employees (emp_code, first_name, last_name, email, phone, department_id, job_title, status, hire_date)
         VALUES ('%s', '%s', '%s', '%s', '%s', %s, '%s', '%s', '%s')",
        db_escape($emp_code),
        db_escape($first_name),
        db_escape($last_name),
        db_escape($email),
        db_escape($phone),
        $department_id > 0 ? $department_id : 'NULL',
        db_escape($job_title),
        db_escape($status),
        db_escape($hire_date)
    );

    if (!mysqli_query($conn, $sql)) {
        json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
    }

    json_response(array(
        'success' => true,
        'message' => 'Employee created',
        'id'      => mysqli_insert_id($conn)
    ), 201);
}

function handle_put($conn) {
    $body = get_request_body();
    $id   = isset($body['id']) ? intval($body['id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);

    if ($id <= 0) {
        json_response(array('success' => false, 'error' => 'id is required'), 400);
    }

    $fields = array();
    $map = array('emp_code', 'first_name', 'last_name', 'email', 'phone', 'job_title', 'status', 'hire_date');
    foreach ($map as $col) {
        if (isset($body[$col])) {
            $fields[] = $col . " = '" . db_escape(trim($body[$col])) . "'";
        }
    }
    if (isset($body['department_id'])) {
        $dept = intval($body['department_id']);
        $fields[] = 'department_id = ' . ($dept > 0 ? $dept : 'NULL');
    }

    if (empty($fields)) {
        json_response(array('success' => false, 'error' => 'No fields to update'), 400);
    }

    $sql = 'UPDATE employees SET ' . implode(', ', $fields) . ' WHERE id = ' . $id;
    if (!mysqli_query($conn, $sql)) {
        json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
    }
    if (mysqli_affected_rows($conn) < 0) {
        json_response(array('success' => false, 'error' => 'Update failed'), 500);
    }

    json_response(array('success' => true, 'message' => 'Employee updated', 'id' => $id));
}

function handle_delete($conn) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        $body = get_request_body();
        $id = isset($body['id']) ? intval($body['id']) : 0;
    }
    if ($id <= 0) {
        json_response(array('success' => false, 'error' => 'id is required'), 400);
    }

    $sql = 'DELETE FROM employees WHERE id = ' . $id;
    if (!mysqli_query($conn, $sql)) {
        json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
    }
    if (mysqli_affected_rows($conn) === 0) {
        json_response(array('success' => false, 'error' => 'Employee not found'), 404);
    }

    json_response(array('success' => true, 'message' => 'Employee deleted', 'id' => $id));
}
?>