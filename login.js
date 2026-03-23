document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const message = document.getElementById('login-message');
    const submitBtn = document.getElementById('login-submit');
    const apiBases = window.location.port === '3000'
        ? ['']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    let activeApiBase = apiBases[0];

    const setMessage = (text, type = '') => {
        message.textContent = text;
        message.classList.remove('is-error', 'is-success');
        if (type) {
            message.classList.add(type);
        }
    };

    const loginRequest = async (payload) => {
        let lastError = null;

        for (const base of apiBases) {
            try {
                const response = await fetch(`${base}/api/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });

                activeApiBase = base;
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Unable to reach login API.');
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
                window.location.href = `${activeApiBase}/admin`;
            }, 500);
        } catch (error) {
            const networkError = error instanceof TypeError || String(error?.message || '').toLowerCase().includes('failed to fetch');
            if (networkError) {
                setMessage('Cannot reach API server on port 3000. Start server.js and try again.', 'is-error');
            } else {
                setMessage(error.message || 'Unable to login.', 'is-error');
            }
        } finally {
            submitBtn.disabled = false;
        }
    });
});
