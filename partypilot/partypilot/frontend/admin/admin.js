// frontend/admin/admin.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Admin Login Check ---
    // On the main page, we need a way to log in as admin.
    // For now, let's assume the user manually goes to /admin/dashboard.html
    // and we just check for a token. A real app would have a dedicated admin login.
    
    // Simple admin login prompt
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
        const password = prompt('Enter admin password:');
        if (password) {
            fetch('/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@partypilot.com', password: password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('role', 'admin');
                    window.location.reload();
                } else {
                    alert('Invalid password');
                    window.location.href = '/';
                }
            });
        } else {
            window.location.href = '/';
        }
        return; // Stop execution until logged in
    }

    // --- Global Elements ---
    const token = localStorage.getItem('token');
    const modal = document.getElementById('mainModal');
    const modalBody = document.getElementById('modal-body');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- Socket.IO Setup ---
    const socket = io();
    socket.on('connect', () => {
        console.log('Admin socket connected:', socket.id);
        socket.emit('joinAdminRoom'); // Join admin-only room
    });
    
    socket.on('newOrder', (order) => {
        alert(`New Order Received! #${order._id.slice(-6)}`);
        // We are on the 'orders' tab, refresh it
        if(document.getElementById('orders').classList.contains('active')) {
            fetchAllOrders();
        }
    });
    
    socket.on('orderUpdated', (order) => {
        console.log('Order updated by partner', order);
        if(document.getElementById('orders').classList.contains('active')) {
            fetchAllOrders();
        }
    });

    // --- Modal Logic ---
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-btn')) {
            closeModal();
        }
    });
    function showModal() { modal.style.display = 'block'; }
    function closeModal() { modal.style.display = 'none'; }
    
    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
            
            if (tab.dataset.target === 'orders') fetchAllOrders();
            if (tab.dataset.target === 'packages') fetchAllPackages();
            if (tab.dataset.target === 'partners') fetchAllPartners();
        });
    });

    // --- Logout ---
    logoutBtn.onclick = () => {
        localStorage.clear();
        window.location.href = '/';
    };
    
    // --- API Helper ---
    const apiFetch = async (url, options = {}) => {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const res = await fetch(url, options);
        if (res.status === 401) {
             alert('Session expired.');
             logoutBtn.click();
        }
        return res;
    };
    
    // --- Section 1: All Orders ---
    async function fetchAllOrders() {
        const res = await apiFetch('/api/admin/orders');
        const orders = await res.json();
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';
        orders.forEach(order => {
            tbody.innerHTML += `
                <tr>
                    <td>${order._id.slice(-6)}</td>
                    <td>${order.customer?.fullName || 'N/A'}</td>
                    <td>${order.package?.name || 'N/A'}</td>
                    <td>${new Date(order.eventDate).toLocaleDateString()}</td>
                    <td>${order.assignedPartner?.companyName || '<i>Unassigned</i>'}</td>
                    <td><span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span></td>
                </tr>
            `;
        });
    }

    // --- Section 2: Manage Partners ---
    async function fetchAllPartners() {
        const res = await apiFetch('/api/admin/partners');
        const partners = await res.json();
        const tbody = document.getElementById('partners-table-body');
        tbody.innerHTML = '';
        partners.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.companyName}</td>
                    <td>${p.email}</td>
                    <td>${p.phone}</td>
                    <td>${p.isApproved ? '<span style="color:var(--success-color)">Approved</span>' : '<span style="color:var(--warning-color)">Pending</span>'}</td>
                    <td>
                        ${!p.isApproved ? `<button class="btn btn-success btn-sm approve-btn" data-id="${p._id}">Approve</button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.dataset.id;
                await apiFetch(`/api/admin/partners/${id}/approve`, { method: 'PUT' });
                fetchAllPartners(); // Refresh
            };
        });
    }

    // --- Section 3: Manage Packages ---
    document.getElementById('addPackageBtn').onclick = () => showPackageForm();
    
    async function fetchAllPackages() {
        const res = await apiFetch('/api/admin/packages');
        const packages = await res.json();
        const tbody = document.getElementById('packages-table-body');
        tbody.innerHTML = '';
        packages.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>$${p.price}</td>
                    <td>${p.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-pkg-btn" data-id="${p._id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-pkg-btn" data-id="${p._id}">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        document.querySelectorAll('.edit-pkg-btn').forEach(btn => {
            btn.onclick = (e) => {
                const pkg = packages.find(p => p._id === e.target.dataset.id);
                showPackageForm(pkg);
            };
        });
        document.querySelectorAll('.delete-pkg-btn').forEach(btn => {
            btn.onclick = async (e) => {
                if (!confirm('Are you sure?')) return;
                await apiFetch(`/api/admin/packages/${e.target.dataset.id}`, { method: 'DELETE' });
                fetchAllPackages(); // Refresh
            };
        });
    }
    
    function showPackageForm(pkg = null) {
        const isEdit = pkg !== null;
        modalBody.innerHTML = `
            <h2>${isEdit ? 'Edit' : 'Add'} Package</h2>
            <form id="package-form">
                <input type="hidden" id="pkgId" value="${isEdit ? pkg._id : ''}">
                <div class="form-group">
                    <label for="pkgName">Package Name</label>
                    <input type="text" id="pkgName" value="${isEdit ? pkg.name : ''}" required>
                </div>
                <div class="form-group">
                    <label for="pkgDesc">Description</label>
                    <textarea id="pkgDesc" required>${isEdit ? pkg.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="pkgPrice">Price</label>
                    <input type="number" id="pkgPrice" value="${isEdit ? pkg.price : ''}" required>
                </div>
                <div class="form-group">
                    <label for="pkgFeatures">Features (comma-separated)</label>
                    <input type="text" id="pkgFeatures" value="${isEdit ? pkg.features.join(', ') : ''}">
                </div>
                <div class="form-group">
                    <label for="pkgImage">Image URL</label>
                    <input type="text" id="pkgImage" value="${isEdit ? pkg.image : ''}">
                </div>
                <div class="form-group">
                    <label for="pkgActive">Is Active?</label>
                    <select id="pkgActive">
                        <option value="true" ${isEdit && pkg.isActive ? 'selected' : ''}>Yes</option>
                        <option value="false" ${isEdit && !pkg.isActive ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-full">${isEdit ? 'Update' : 'Create'} Package</button>
            </form>
        `;
        showModal();
        
        document.getElementById('package-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = isEdit ? `/api/admin/packages/${pkg._id}` : '/api/admin/packages';
            const method = isEdit ? 'PUT' : 'POST';
            
            const body = {
                name: document.getElementById('pkgName').value,
                description: document.getElementById('pkgDesc').value,
                price: parseFloat(document.getElementById('pkgPrice').value),
                features: document.getElementById('pkgFeatures').value.split(',').map(f => f.trim()),
                image: document.getElementById('pkgImage').value,
                isActive: document.getElementById('pkgActive').value === 'true'
            };
            
            await apiFetch(url, { method, body: JSON.stringify(body) });
            closeModal();
            fetchAllPackages(); // Refresh
        });
    }

    // Initial Load
    fetchAllOrders();
});