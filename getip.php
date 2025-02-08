<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$clientIP = $_SERVER['REMOTE_ADDR'];
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'];
}

$response = array(
    'ip' => $clientIP,
    'timestamp' => time()
);

echo json_encode($response);
?>
