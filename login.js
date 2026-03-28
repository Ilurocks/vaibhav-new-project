document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    const submitBtn = document.getElementById('login-submit');
    const appBasePath = String(window.APP_BASE_PATH || '');
    const withBase = (path) => `${appBasePath}${path}`;

    const setMessage = (text, type = '') => {
        message.textContent = text;
        message.classList.remove('is-error', 'is-success');
        if (type) {
            message.classList.add(type);
        }
    };

    const loginRequest = async (payload) => {
        return fetch(withBase('/api/admin_login.php'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const username = String(formData.get('username') || '').trim();
        const password = String(formData.get('password') || '');

        if (!username || !password) {
            setMessage('Please enter both username and password.', 'is-error');
            return;
        }

        submitBtn.disabled = true;
        setMessage('Signing in...');

        try {
            const response = await loginRequest({ username, password });

            const rawBody = await response.text();
            let result = null;
            if (rawBody) {
                try {
                    result = JSON.parse(rawBody);
                } catch (parseError) {
                    result = null;
                }
            }

            if (!response.ok) {
                throw new Error(result?.message || `Login failed (HTTP ${response.status}).`);
            }

            if (!result?.ok) {
                throw new Error(result?.message || 'Login failed.');
            }

            setMessage('Login successful. Redirecting...', 'is-success');
            window.setTimeout(() => {
                window.location.href = withBase('/admin.php');
            }, 500);
        } catch (error) {
            setMessage(error.message || 'Unable to login.', 'is-error');
        } finally {
            submitBtn.disabled = false;
        }
    });
});
