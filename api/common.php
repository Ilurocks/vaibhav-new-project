<?php

declare(strict_types=1);

function start_session_if_needed(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_request_data(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ?: '{}', true);
        return is_array($decoded) ? $decoded : [];
    }

    return $_POST;
}

function require_admin_auth(): void
{
    start_session_if_needed();

    if (empty($_SESSION['is_admin'])) {
        json_response([
            'ok' => false,
            'message' => 'Unauthorized',
        ], 401);
    }
}

function normalize_phone(string $phone): string
{
    return preg_replace('/\D+/', '', $phone) ?? '';
}
