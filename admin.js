document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const enquiriesBody = document.getElementById('enquiries-body');
    const resultCount = document.getElementById('result-count');
    const statTotal = document.getElementById('stat-total');
    const statLatest = document.getElementById('stat-latest');
    const statStatus = document.getElementById('stat-status');
    const appBasePath = String(window.APP_BASE_PATH || '');
    const withBase = (path) => `${appBasePath}${path}`;
    let enquiries = [];

    const redirectToLogin = () => {
        window.location.href = withBase('/login.php');
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
            const response = await fetch(withBase('/api/enquiries.php'), {
                credentials: 'include'
            });
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
            const message = String(error?.message || 'Unable to load enquiries.');
            statStatus.textContent = 'Error';
            enquiriesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">${message}</td>
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
            await fetch(withBase('/api/admin_logout.php'), {
                method: 'POST'
            });
        } finally {
            redirectToLogin();
        }
    });

    loadEnquiries();
});
