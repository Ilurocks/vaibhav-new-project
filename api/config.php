<?php

declare(strict_types=1);

date_default_timezone_set('Asia/Kolkata');

function env_or_default(string $key, string $default): string
{
    $value = getenv($key);
    if ($value === false || trim($value) === '') {
        return $default;
    }

    return $value;
}

define('DB_HOST', env_or_default('DB_HOST', 'localhost'));
define('DB_NAME', env_or_default('DB_NAME', 'replace_with_db_name'));
define('DB_USER', env_or_default('DB_USER', 'replace_with_db_user'));
define('DB_PASS', env_or_default('DB_PASS', 'replace_with_db_password'));
define('DB_PORT', env_or_default('DB_PORT', '3306'));

define('ADMIN_USERNAME', env_or_default('ADMIN_USERNAME', 'admin'));
define('ADMIN_PASSWORD', env_or_default('ADMIN_PASSWORD', 'change-me-123'));
define('ADMIN_NOTIFY_EMAIL', env_or_default('ADMIN_NOTIFY_EMAIL', 'replace_with_admin_email@example.com'));

define('SMTP_ENABLED', strtolower(env_or_default('SMTP_ENABLED', 'true')) === 'true');
define('SMTP_HOST', env_or_default('SMTP_HOST', 'mail.yourdomain.com'));
define('SMTP_PORT', (int)env_or_default('SMTP_PORT', '465'));
define('SMTP_USERNAME', env_or_default('SMTP_USERNAME', 'no-reply@yourdomain.com'));
define('SMTP_PASSWORD', env_or_default('SMTP_PASSWORD', 'replace_with_smtp_password'));
define('SMTP_SECURE', strtolower(env_or_default('SMTP_SECURE', 'ssl'))); // ssl | tls | none
define('SMTP_FROM_EMAIL', env_or_default('SMTP_FROM_EMAIL', SMTP_USERNAME));
define('SMTP_FROM_NAME', env_or_default('SMTP_FROM_NAME', 'Website Enquiries'));
