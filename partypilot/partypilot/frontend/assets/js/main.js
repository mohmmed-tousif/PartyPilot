// frontend/assets/js/main.js


// --- Hamburger Menu Logic ---
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const menuDropdown = document.getElementById('menuDropdown');
    const adminLoginLink = document.getElementById('adminLoginLink');

    hamburgerMenu.addEventListener('click', (e) => {
        // This stops the click from instantly bubbling to the 'window'
        // and closing the menu right after it opens.
        e.stopPropagation(); 
        menuDropdown.classList.toggle('active');
    });

    // Close dropdown if clicking anywhere else
    window.addEventListener('click', () => {
        if (menuDropdown.classList.contains('active')) {
            menuDropdown.classList.remove('active');
        }
    });
/*
    // Handle Admin Login click
    adminLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        menuDropdown.classList.remove('active'); // Close menu
        showAdminLogin();
    });

    // --- New Function to Show Admin Login Modal ---
    function showAdminLogin() {
        modalBody.innerHTML = `
            <h2>Admin Login</h2>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type.email id="email" value="admin@partypilot.com" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Login</button>
                <div class="form-error" id="authError"></div>
            </form>
        `;
        showModal();

        // Add submit listener
        document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const res = await fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                loginUser(data.token, data.userId, 'admin'); // Re-uses your existing function
            } else {
                showError('Invalid credentials');
            }
        });
    }

*/

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('mainModal');
    const modalBody = document.getElementById('modal-body');
    const customerLoginBtn = document.getElementById('customerLoginBtn');
    const partnerLoginBtn = document.getElementById('partnerLoginBtn');
    const browsePackagesBtn = document.getElementById('browsePackagesBtn');
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
        // Redirect to the correct dashboard
        window.location.href = `/${role}/dashboard.html`;
        return; // Stop executing script on this page
    }

    // Modal close logic
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-btn')) {
            closeModal();
        }
    });
    
    function showModal() { modal.style.display = 'block'; }
    function closeModal() { modal.style.display = 'none'; }

    // --- Event Listeners ---
    customerLoginBtn.onclick = showCustomerLogin;
    partnerLoginBtn.onclick = showPartnerLogin;
    browsePackagesBtn.onclick = showCustomerLogin; // Must log in to browse

    // --- Auth Functions ---
    
    function showCustomerLogin() {
        modalBody.innerHTML = `
            <h2>Customer Login</h2>
            <form id="customer-login-form">
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="e.g., 9876543210" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Send OTP</button>
            </form>
            <form id="customer-verify-form" style="display:none;">
                <p>OTP sent to <b id="phone-display"></b> (check backend console)</p>
                <div class="form-group">
                    <label for="otp">Enter OTP</label>
                    <input type="text" id="otp" placeholder="1234" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Verify & Login</button>
            </form>
            <div class="form-error" id="authError"></div>
        `;
        showModal();
        handleCustomerForms();
    }
    
    function showPartnerLogin() {
        modalBody.innerHTML = `
            <h2>Partner Login</h2>
            <form id="partner-login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Login</button>
                <div class="form-error" id="authError"></div>
                <p style="text-align:center; margin-top:1rem;">
                    New partner? <a href="#" id="showRegisterPartner">Register here</a>
                </p>
            </form>
        `;
        showModal();
        document.getElementById('partner-login-form').addEventListener('submit', handlePartnerLogin);
        document.getElementById('showRegisterPartner').addEventListener('click', showPartnerRegister);
    }
    
    function showPartnerRegister(e) {
        if(e) e.preventDefault();
        modalBody.innerHTML = `
            <h2>Partner Registration</h2>
            <form id="partner-register-form">
                <div class="form-group">
                    <label for="companyName">Company Name</label>
                    <input type="text" id="companyName" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone</label>
                    <input type="tel" id="phone" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Register</button>
                <div class="form-error" id="authError"></div>
                <p style="text-align:center; margin-top:1rem;">
                    Already registered? <a href="#" id="showLoginPartner">Login here</a>
                </p>
            </form>
        `;
        document.getElementById('partner-register-form').addEventListener('submit', handlePartnerRegister);
        document.getElementById('showLoginPartner').addEventListener('click', (e) => {
            e.preventDefault();
            showPartnerLogin();
        });
    }

    function handleCustomerForms() {
        const loginForm = document.getElementById('customer-login-form');
        const verifyForm = document.getElementById('customer-verify-form');
        const errorEl = document.getElementById('authError');
        let userPhone = '';

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';
            userPhone = document.getElementById('phone').value;
            
            const res = await fetch('/api/auth/customer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: userPhone })
            });
            
            if (res.ok) {
                loginForm.style.display = 'none';
                verifyForm.style.display = 'block';
                document.getElementById('phone-display').innerText = userPhone;
            } else {
                const data = await res.json();
                showError(data.message);
            }
        });

        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';
            const otp = document.getElementById('otp').value;
            
            const res = await fetch('/api/auth/customer/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: userPhone, otp: otp })
            });

            if (res.ok) {
                const data = await res.json();
                loginUser(data.token, data.userId, 'customer');
            } else {
                showError('Invalid or expired OTP!');
            }
        });
    }

    async function handlePartnerLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const res = await fetch('/api/auth/partner/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            loginUser(data.token, data.userId, 'partner');
        } else {
            const data = await res.json();
            showError(data.message || 'Invalid credentials');
        }
    }
    
    async function handlePartnerRegister(e) {
        e.preventDefault();
        const companyName = document.getElementById('companyName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        const res = await fetch('/api/auth/partner/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName, email, phone, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            modalBody.innerHTML = `
                <h2>Registration Successful!</h2>
                <p>${data.message}</p>
                <button class="btn btn-primary btn-full" id="backToLogin">Back to Login</button>
            `;
            document.getElementById('backToLogin').onclick = showPartnerLogin;
        } else {
            const data = await res.json();
            showError(data.message || 'Registration failed');
        }
    }

    function loginUser(token, userId, role) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        window.location.href = `/${role}/dashboard.html`;
    }
    
    function showError(message) {
        const errorEl = document.getElementById('authError');
        if (errorEl) {
            errorEl.innerText = message;
            errorEl.style.display = 'block';
        }
    }
});

// (Inside frontend/assets/js/main.js, after other listeners)

document.getElementById('footerCustomerLogin').onclick = showCustomerLogin;
document.getElementById('footerPartnerLogin').onclick = showPartnerLogin;