document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const enquiriesBody = document.getElementById('enquiries-body');
    const resultCount = document.getElementById('result-count');
    const statTotal = document.getElementById('stat-total');
    const statLatest = document.getElementById('stat-latest');
    const statStatus = document.getElementById('stat-status');
    const apiBases = window.location.port === '3000'
        ? ['']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    let activeApiBase = apiBases[0];

    let enquiries = [];

    const redirectToLogin = () => {
        window.location.href = `${activeApiBase}/login`;
    };

    const requestWithFallback = async (path, options = {}) => {
        let lastError = null;

        for (const base of apiBases) {
            try {
                const response = await fetch(`${base}${path}`, {
                    ...options,
                    credentials: 'include'
                });

                activeApiBase = base;
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error(`Unable to reach API for ${path}.`);
    };

    const formatDate = (value) => {
        const normalizedValue = typeof value === 'string' && value.includes(' ') && !value.endsWith('Z')
            ? `${value.replace(' ', 'T')}Z`
            : value;
        const date = new Date(normalizedValue);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    const renderRows = (rows) => {
        if (!rows.length) {
            enquiriesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">No enquiries found.</td>
                </tr>
            `;
            resultCount.textContent = '0 results';
            return;
        }

        enquiriesBody.innerHTML = rows.map((row) => `
            <tr>
                <td>${row.id}</td>
                <td>${row.full_name}</td>
                <td>${row.phone_number}</td>
                <td>${row.email}</td>
                <td>${formatDate(row.created_at)}</td>
            </tr>
        `).join('');

        resultCount.textContent = `${rows.length} result${rows.length === 1 ? '' : 's'}`;
    };

    const applySearch = () => {
        const query = (searchInput.value || '').trim().toLowerCase();
        if (!query) {
            renderRows(enquiries);
            return;
        }

        const filtered = enquiries.filter((row) =>
            row.full_name.toLowerCase().includes(query) ||
            row.email.toLowerCase().includes(query) ||
            row.phone_number.toLowerCase().includes(query)
        );

        renderRows(filtered);
    };

    const loadEnquiries = async () => {
        statStatus.textContent = 'Loading...';
        refreshBtn.disabled = true;

        try {
            const response = await requestWithFallback('/api/enquiries');
            if (response.status === 401) {
                redirectToLogin();
                return;
            }
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
                throw new Error(result?.message || `Unable to load enquiries (HTTP ${response.status}).`);
            }

            if (!result?.ok) {
                throw new Error(result?.message || 'Unable to load enquiries.');
            }

            enquiries = result.enquiries || [];
            statTotal.textContent = String(enquiries.length);
            statLatest.textContent = enquiries.length ? formatDate(enquiries[0].created_at) : '-';
            statStatus.textContent = 'Live';
            applySearch();
        } catch (error) {
            statStatus.textContent = 'Error';
            enquiriesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">${error.message}</td>
                </tr>
            `;
            resultCount.textContent = '0 results';
        } finally {
            refreshBtn.disabled = false;
        }
    };

    searchInput.addEventListener('input', applySearch);
    refreshBtn.addEventListener('click', loadEnquiries);
    logoutBtn.addEventListener('click', async () => {
        logoutBtn.disabled = true;
        try {
            await requestWithFallback('/api/admin/logout', {
                method: 'POST'
            });
        } finally {
            redirectToLogin();
        }
    });

    loadEnquiries();
});
