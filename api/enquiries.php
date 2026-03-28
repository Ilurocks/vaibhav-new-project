<?php

declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mailer.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    json_response([
        'ok' => false,
        'message' => 'Database connection failed. Please check api/config.php database settings.',
    ], 500);
}

if ($method === 'POST') {
    $data = get_request_data();

    $fullName = trim((string)($data['fullName'] ?? ''));
    $phone = normalize_phone((string)($data['phone'] ?? ''));
    $email = strtolower(trim((string)($data['email'] ?? '')));

    if ($fullName === '' || $phone === '' || $email === '') {
        json_response([
            'ok' => false,
            'message' => 'All fields are required.',
        ], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response([
            'ok' => false,
            'message' => 'Please enter a valid email address.',
        ], 400);
    }

    if (!preg_match('/^[0-9]{10,15}$/', $phone)) {
        json_response([
            'ok' => false,
            'message' => 'Please enter a valid phone number.',
        ], 400);
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO enquiries (full_name, phone_number, email) VALUES (:full_name, :phone_number, :email)');
        $stmt->execute([
            ':full_name' => $fullName,
            ':phone_number' => $phone,
            ':email' => $email,
        ]);

        $enquiryId = (int)$pdo->lastInsertId();

        $emailSent = send_enquiry_notification($enquiryId, $fullName, $phone, $email);

        json_response([
            'ok' => true,
            'message' => $emailSent ? 'Enquiry submitted successfully.' : 'Enquiry saved, but email notification failed.',
            'id' => $enquiryId,
            'emailSent' => $emailSent,
        ], 201);
    } catch (Throwable $e) {
        json_response([
            'ok' => false,
            'message' => 'Unable to save enquiry right now.',
        ], 500);
    }
}

if ($method === 'GET') {
    require_admin_auth();

    try {
        $stmt = $pdo->query('SELECT id, full_name, phone_number, email, created_at FROM enquiries ORDER BY id DESC');
        $rows = $stmt->fetchAll();

        json_response([
            'ok' => true,
            'enquiries' => $rows,
        ]);
    } catch (Throwable $e) {
        json_response([
            'ok' => false,
            'message' => 'Unable to load enquiries right now.',
        ], 500);
    }
}

json_response([
    'ok' => false,
    'message' => 'Method not allowed',
], 405);
