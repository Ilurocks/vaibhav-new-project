<?php
session_start();
if (!empty($_SESSION['is_admin'])) {
    header('Location: admin.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="login.css">
</head>
<body>
    <script>
        window.APP_BASE_PATH = <?php echo json_encode(rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/')); ?>;
    </script>
    <main class="login-page">
        <section class="login-card">
            <p class="login-kicker">Protected Access</p>
            <h1>Admin Login</h1>
            <p class="login-subtitle">Sign in to view and manage enquiry submissions.</p>

            <form id="login-form" class="login-form">
                <label class="login-field">
                    <span>Username</span>
                    <input type="text" name="username" autocomplete="username" required>
                </label>

                <label class="login-field">
                    <span>Password</span>
                    <input type="password" name="password" autocomplete="current-password" required>
                </label>

                <p id="login-message" class="login-message" aria-live="polite"></p>
                <button type="submit" id="login-submit">Login</button>
            </form>
        </section>
    </main>

    <script src="login.js"></script>
</body>
</html>
