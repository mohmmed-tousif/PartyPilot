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
            const assignBtn = !order.assignedPartner ? `<button class="btn btn-primary btn-sm assign-btn" data-order-id="${order._id}">Assign Partner</button>` : '';
            tbody.innerHTML += `
                <tr>
                    <td>${order._id.slice(-6)}</td>
                    <td>${order.customer?.fullName || 'N/A'}</td>
                    <td>${order.package?.name || 'N/A'}</td>
                    <td>${new Date(order.eventDate).toLocaleDateString()}</td>
                    <td>${order.assignedPartner?.companyName || '<i>Unassigned</i>'}</td>
                    <td><span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span></td>
                    <td>${assignBtn}</td>
                </tr>
            `;
        });
        
        // Add event listeners for assign buttons
        document.querySelectorAll('.assign-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const orderId = e.target.dataset.orderId;
                await showAssignPartnerModal(orderId);
            };
        });
    }
    
    async function showAssignPartnerModal(orderId) {
        const partnersRes = await apiFetch('/api/admin/partners');
        const partners = await partnersRes.json();
        const approvedPartners = partners.filter(p => p.isApproved);
        
        if (approvedPartners.length === 0) {
            alert('No approved partners available');
            return;
        }
        
        modalBody.innerHTML = `
            <h2>Assign Partner to Order</h2>
            <form id="assign-partner-form">
                <div class="form-group">
                    <label for="partnerSelect">Select Partner</label>
                    <select id="partnerSelect" required>
                        <option value="">-- Select Partner --</option>
                        ${approvedPartners.map(p => `<option value="${p._id}">${p.companyName} (${p.email})</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Assign Partner</button>
            </form>
        `;
        showModal();
        
        document.getElementById('assign-partner-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const partnerId = document.getElementById('partnerSelect').value;
            
            const res = await apiFetch(`/api/admin/orders/${orderId}/assign`, {
                method: 'PUT',
                body: JSON.stringify({ partnerId })
            });
            
            if (res.ok) {
                alert('Partner assigned successfully!');
                closeModal();
                fetchAllOrders();
            } else {
                const error = await res.json();
                alert('Failed to assign partner: ' + (error.message || 'Unknown error'));
            }
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
    const adminPackageSearch = document.getElementById('adminPackageSearch');
    adminPackageSearch?.addEventListener('input', () => fetchAllPackages());

    async function fetchAllPackages() {
        const q = adminPackageSearch?.value || '';
        const url = `/api/admin/packages?q=${encodeURIComponent(q)}&limit=200`;
        const res = await apiFetch(url);
        const packages = await res.json();
        const tbody = document.getElementById('packages-table-body');
        tbody.innerHTML = '';
        packages.forEach(p => {
            const imageUrl = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'https://via.placeholder.com/400x300');
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <img src="${imageUrl}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" onerror="this.src='https://via.placeholder.com/60x60'">
                            <span>${p.name}</span>
                        </div>
                    </td>
                    <td>$${p.price}</td>
                    <td>${p.rating || 0} (${p.ratingCount || 0})</td>
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
        const currentImage = isEdit ? ((pkg.images && pkg.images.length > 0) ? pkg.images[0] : (pkg.image || '')) : '';
        const currentImages = isEdit ? (pkg.images && pkg.images.length > 0 ? pkg.images.join(', ') : (pkg.image || '')) : '';
        
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
                    <label for="pkgImages">Image URLs (comma-separated for multiple images)</label>
                    <input type="text" id="pkgImages" value="${currentImages}" placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg">
                    <small style="color: var(--text-light); font-size: 0.9rem;">Enter one or more image URLs separated by commas</small>
                </div>
                <div class="form-group" id="imagePreviewContainer" style="display: ${currentImage ? 'block' : 'none'};">
                    <label>Image Preview</label>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
                        <img id="imagePreview" src="${currentImage}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);" onerror="this.style.display='none'">
                    </div>
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
        
        // Add image preview functionality
        const imagesInput = document.getElementById('pkgImages');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');
        
        imagesInput.addEventListener('input', function() {
            const urls = this.value.split(',').map(url => url.trim()).filter(url => url);
            if (urls.length > 0) {
                const firstUrl = urls[0];
                imagePreview.src = firstUrl;
                previewContainer.style.display = 'block';
                imagePreview.onerror = function() {
                    this.style.display = 'none';
                };
                imagePreview.onload = function() {
                    this.style.display = 'block';
                };
            } else {
                previewContainer.style.display = 'none';
            }
        });
        
        document.getElementById('package-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const url = isEdit ? `/api/admin/packages/${pkg._id}` : '/api/admin/packages';
            const method = isEdit ? 'PUT' : 'POST';
            
            const imagesInput = document.getElementById('pkgImages').value;
            const images = imagesInput.split(',').map(url => url.trim()).filter(url => url);
            
            const body = {
                name: document.getElementById('pkgName').value,
                description: document.getElementById('pkgDesc').value,
                price: parseFloat(document.getElementById('pkgPrice').value),
                features: document.getElementById('pkgFeatures').value.split(',').map(f => f.trim()).filter(f => f),
                images: images.length > 0 ? images : undefined,
                image: images.length > 0 ? images[0] : undefined, // Keep for backward compatibility
                isActive: document.getElementById('pkgActive').value === 'true'
            };
            
            await apiFetch(url, { method, body: JSON.stringify(body) });
            closeModal();
            fetchAllPackages(); // Refresh
        });
    }

    // Initial Load
    fetchAllOrders();
    fetchAllPackages();
    fetchAllPartners();
    fetchStats();

    // --- Dashboard Stats ---
    async function fetchStats() {
        const res = await apiFetch('/api/admin/dashboard/stats');
        if (!res.ok) return;
        const s = await res.json();
        document.getElementById('statPackages').innerText = s.totalPackages;
        document.getElementById('statOrders').innerText = s.totalOrders;
        document.getElementById('statPartners').innerText = s.totalPartners;
        document.getElementById('statPending').innerText = s.pendingPartners;

        // Draw charts (requires Chart.js)
        try {
            const approved = (s.totalPartners || 0) - (s.pendingPartners || 0);
            const pending = s.pendingPartners || 0;
            const partnersCtx = document.getElementById('partnersChart');
            if (partnersCtx) {
                new Chart(partnersCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Approved', 'Pending'],
                        datasets: [{
                            data: [approved, pending],
                            backgroundColor: ['#4caf50', '#ffc107']
                        }]
                    },
                    options: { plugins: { legend: { position: 'bottom' } } }
                });
            }

            const catalogCtx = document.getElementById('catalogOrdersChart');
            if (catalogCtx) {
                new Chart(catalogCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Total Packages', 'Total Orders'],
                        datasets: [{
                            label: 'Count',
                            data: [s.totalPackages || 0, s.totalOrders || 0],
                            backgroundColor: ['#6a11cb', '#2575fc']
                        }]
                    },
                    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                });
            }
        } catch (e) { console.warn('Chart render failed', e); }
    }
});