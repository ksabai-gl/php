<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Employee Portal PHP Backend</title>
    <style>
        body { font-family: Tahoma, Arial, sans-serif; margin: 24px; color: #222; }
        code { background: #f0f0f0; padding: 2px 4px; }
        a { color: #0645ad; }
    </style>
</head>
<body>
    <h1>Employee Portal – PHP Backend</h1>
    <p>Monolithic HR API used by the Liferay portlets.</p>
    <ul>
        <li><a href="api/health.php">api/health.php</a></li>
        <li><a href="api/API.txt">api/API.txt</a> (cheat sheet)</li>
    </ul>
    <p>Secure endpoints require header <code>X-API-Key</code>.</p>
</body>
</html>