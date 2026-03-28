<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response([
        'ok' => false,
        'message' => 'Method not allowed',
    ], 405);
}

start_session_if_needed();

$authenticated = !empty($_SESSION['is_admin']);

json_response([
    'ok' => true,
    'authenticated' => $authenticated,
]);
