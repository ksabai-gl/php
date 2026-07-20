<?php
/**
 * Database configuration - Employee Portal
 * Traditional shared config for the monolith.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'emp_user');
define('DB_PASS', 'emp_pass');
define('DB_NAME', 'employee_portal');
define('DB_PORT', 3306);

/** API base used by Liferay portlets when calling this backend */
define('API_BASE_URL', 'http://localhost/phpja/api');

/** Simple shared secret for portlet -> PHP calls (legacy style) */
define('API_KEY', 'EMP-PORTAL-LEGACY-KEY-2014');
?>