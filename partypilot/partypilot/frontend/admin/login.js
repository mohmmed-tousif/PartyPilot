// frontend/admin/login.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Redirect if already logged in as admin
    if (localStorage.getItem('token') && localStorage.getItem('role') === 'admin') {
        window.location.href = '/admin/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('admin-login-form');
    const authError = document.getElementById('authError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/api/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            // Store credentials and redirect to the dashboard
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('role', data.role);
            window.location.href = '/admin/dashboard.html';
        } else {
            authError.innerText = 'Invalid email or password.';
            authError.style.display = 'block';
        }
    });
});