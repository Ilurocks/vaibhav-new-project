<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response([
        'ok' => false,
        'message' => 'Method not allowed',
    ], 405);
}

$data = get_request_data();
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
    json_response([
        'ok' => false,
        'message' => 'Username and password are required.',
    ], 400);
}

if (!hash_equals(ADMIN_USERNAME, $username) || !hash_equals(ADMIN_PASSWORD, $password)) {
    json_response([
        'ok' => false,
        'message' => 'Invalid username or password.',
    ], 401);
}

start_session_if_needed();
session_regenerate_id(true);
$_SESSION['is_admin'] = true;
$_SESSION['admin_logged_in_at'] = time();

json_response([
    'ok' => true,
    'message' => 'Login successful.',
]);
