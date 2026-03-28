<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function send_enquiry_notification(int $enquiryId, string $fullName, string $phone, string $email): bool
{
    $host = $_SERVER['HTTP_HOST'] ?? 'website';
    $subject = 'New Enquiry Received - ' . $host;

    $body = "New enquiry received from website:\n\n"
        . "ID: {$enquiryId}\n"
        . "Name: {$fullName}\n"
        . "Phone: {$phone}\n"
        . "Email: {$email}\n"
        . "Date: " . date('Y-m-d H:i:s') . "\n";

    if (SMTP_ENABLED) {
        return smtp_send_mail(ADMIN_NOTIFY_EMAIL, $subject, $body, $email);
    }

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>',
        'Reply-To: ' . $email,
    ];

    return @mail(ADMIN_NOTIFY_EMAIL, $subject, $body, implode("\r\n", $headers));
}

function smtp_send_mail(string $to, string $subject, string $message, string $replyTo = ''): bool
{
    $transport = SMTP_SECURE === 'ssl' ? 'ssl://' : '';
    $remoteHost = $transport . SMTP_HOST;

    $socket = @stream_socket_client($remoteHost . ':' . SMTP_PORT, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        return false;
    }

    stream_set_timeout($socket, 20);

    if (!smtp_expect($socket, [220])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, 'EHLO ' . get_smtp_helo_host(), [250])) {
        fclose($socket);
        return false;
    }

    if (SMTP_SECURE === 'tls') {
        if (!smtp_command($socket, 'STARTTLS', [220])) {
            fclose($socket);
            return false;
        }

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return false;
        }

        if (!smtp_command($socket, 'EHLO ' . get_smtp_helo_host(), [250])) {
            fclose($socket);
            return false;
        }
    }

    if (!smtp_command($socket, 'AUTH LOGIN', [334])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, base64_encode(SMTP_USERNAME), [334])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, base64_encode(SMTP_PASSWORD), [235])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, 'MAIL FROM:<' . SMTP_FROM_EMAIL . '>', [250])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, 'DATA', [354])) {
        fclose($socket);
        return false;
    }

    $headers = [
        'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>',
        'To: <' . $to . '>',
        'Subject: ' . $subject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];

    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    $data = implode("\r\n", $headers) . "\r\n\r\n" . normalize_smtp_body($message) . "\r\n.";
    fwrite($socket, $data . "\r\n");

    $sent = smtp_expect($socket, [250]);

    smtp_command($socket, 'QUIT', [221]);
    fclose($socket);

    return $sent;
}

function smtp_command($socket, string $command, array $expectedCodes): bool
{
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $expectedCodes);
}

function smtp_expect($socket, array $expectedCodes): bool
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }

    if ($response === '') {
        return false;
    }

    $code = (int)substr($response, 0, 3);
    return in_array($code, $expectedCodes, true);
}

function normalize_smtp_body(string $body): string
{
    $normalized = str_replace(["\r\n", "\r"], "\n", $body);
    $normalized = preg_replace('/^\./m', '..', $normalized) ?? $normalized;
    return str_replace("\n", "\r\n", $normalized);
}

function get_smtp_helo_host(): string
{
    $host = $_SERVER['SERVER_NAME'] ?? '';
    if ($host !== '') {
        return $host;
    }

    return 'localhost';
}
