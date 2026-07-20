<?php
/**
 * Departments API (read + summary)
 *
 * GET /api/departments.php           – list departments
 * GET /api/departments.php?summary=1 – headcount by department
 */

require_once dirname(__FILE__) . '/../includes/db.php';
require_once dirname(__FILE__) . '/../includes/auth.php';
require_once dirname(__FILE__) . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_response(array('success' => true));
}

require_api_key();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(array('success' => false, 'error' => 'Method not allowed'), 405);
}

$conn = get_db_connection();

if (isset($_GET['summary']) && $_GET['summary'] == '1') {
    $sql = "SELECT d.id, d.code, d.name,
                   COUNT(e.id) AS employee_count,
                   SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_count
            FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id
            GROUP BY d.id, d.code, d.name
            ORDER BY d.name";
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

$sql = "SELECT id, code, name, description FROM departments ORDER BY name";
$result = mysqli_query($conn, $sql);
if (!$result) {
    json_response(array('success' => false, 'error' => mysqli_error($conn)), 500);
}
$rows = array();
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;
}
json_response(array('success' => true, 'count' => count($rows), 'data' => $rows));
?>