// frontend/customer/customer.js
// Improved customer dashboard: search, filters, favorites, ratings and real-time order updates
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token) { window.location.href = '/'; return; }

    // Global UI
    const packagesGrid = document.getElementById('packages-grid');
    const ordersGrid = document.getElementById('orders-grid');
    const modal = document.getElementById('mainModal');
    const modalBody = document.getElementById('modal-body');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');

    // Filters
    const packageSearchInput = document.getElementById('packageSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBySelect = document.getElementById('sortBy');

    // Socket (optional)
    let socket = null;
    try {
        if (typeof io !== 'undefined') {
            socket = io();
            socket.on('connect', () => { console.log('Socket connected'); socket.emit('joinRoom', userId); });
            socket.on('orderStatusChanged', (data) => { console.log('Order update', data); fetchMyOrders(); });
        }
    } catch (e) {
        console.warn('Socket.IO not available:', e);
    }

    // Modal helpers
    modal.addEventListener('click', (e) => { if (e.target.classList.contains('modal') || e.target.classList.contains('close-btn')) closeModal(); });
    function showModal() { modal.style.display = 'block'; }
    function closeModal() { modal.style.display = 'none'; }

    // Tabs
    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
        if (tab.dataset.target === 'packages') fetchPackages();
        if (tab.dataset.target === 'my-orders') fetchMyOrders();
        if (tab.dataset.target === 'profile') fetchProfile();
    }));

    // Logout
    logoutBtn.onclick = () => { localStorage.clear(); window.location.href = '/'; };

    // API utils
    const authHeaders = () => ({ 'Authorization': `Bearer ${token}` });

    // Favorites cache
    let favoritesCache = [];

    // Debounce
    let searchTimer = null;
    packageSearchInput?.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(fetchPackages, 300); });
    categoryFilter?.addEventListener('change', fetchPackages);
    sortBySelect?.addEventListener('change', fetchPackages);

    // Fetch favorites
    async function fetchFavorites() {
        try {
            const res = await fetch('/api/auth/customer/favorites', { headers: authHeaders() });
            favoritesCache = res.ok ? await res.json() : [];
        } catch (e) { favoritesCache = []; }
    }

    // Fetch packages with filters
    async function fetchPackages() {
        console.log('Fetching packages...');
        const q = encodeURIComponent(packageSearchInput?.value || '');
        const category = encodeURIComponent(categoryFilter?.value || '');
        const sortBy = encodeURIComponent(sortBySelect?.value || 'newest');
        const url = `/api/orders/packages?q=${q}&category=${category}&sortBy=${sortBy}&limit=100`;
        console.log('Packages URL:', url);

        try {
            const res = await fetch(url, { headers: authHeaders() });
            console.log('Packages response status:', res.status);
            if (!res.ok) {
                console.error('Failed to fetch packages:', res.statusText);
                return packagesGrid.innerHTML = '<p>Unable to load packages.</p>';
            }
            const pkgs = await res.json();
            console.log('Received packages:', pkgs.length);
            await fetchFavorites();
            const activePackages = pkgs.filter(p => p.isActive);
            console.log('Active packages:', activePackages.length);
            renderPackages(activePackages);
        } catch (error) {
            console.error('Error fetching packages:', error);
            packagesGrid.innerHTML = '<p>Error loading packages. Please refresh the page.</p>';
        }
    }

    function renderPackages(packages) {
        if (!packages || packages.length === 0) { packagesGrid.innerHTML = '<p>No packages available.</p>'; return; }
        packagesGrid.innerHTML = '';
        packages.forEach(pkg => {
            const isFav = favoritesCache && favoritesCache.some(f => f._id === pkg._id);
            const imageUrl = (pkg.images && pkg.images.length ? pkg.images[0] : (pkg.image || '/assets/img/placeholder.png'));

            const card = document.createElement('div');
            card.className = 'card package-card';
            card.innerHTML = `
                <img src="${imageUrl}" alt="${pkg.name}" onerror="this.src='https://via.placeholder.com/400x300'">
                <div class="package-card-body">
                    <h3>${pkg.name}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
                        <div class="package-card-price">$${pkg.price}</div>
                        <div class="rating" title="${pkg.rating || 0} stars">
                            <div class="stars">${renderStars(pkg.rating || 0)}</div>
                            <div style="font-size:0.9rem; color:var(--text-light);">${pkg.rating || 0} (${pkg.ratingCount || 0})</div>
                        </div>
                    </div>
                    <p>${pkg.description}</p>
                    <ul>${(pkg.features||[]).map(f => `<li>${f}</li>`).join('')}</ul>
                    <div class="package-actions">
                        <button class="btn btn-primary btn-full btn-book" data-id="${pkg._id}" data-price="${pkg.price}">Book Now</button>
                        <button class="btn btn-secondary btn-sm btn-rate" data-id="${pkg._id}">Rate</button>
                        <div class="favorite-heart ${isFav ? 'active' : ''}" data-id="${pkg._id}" title="Save to favorites">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.86C14.46 4.99 15.96 4 17.5 4 20 4 22 6 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                    </div>
                </div>
            `;

            // Book action
            card.querySelector('.btn-book').addEventListener('click', () => showOrderModal(pkg));

            // Rate action
            card.querySelector('.btn-rate').addEventListener('click', async (e) => {
                const pkgId = e.target.dataset.id;
                const value = prompt('Rate this package 1–5 (you can use decimals like 4.5)');
                const rating = Number(value);
                if (!rating || rating < 1 || rating > 5) return alert('Invalid rating');

                const r = await fetch(`/api/orders/packages/${pkgId}/rate`, { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ rating }) });
                if (r.ok) { alert('Thanks for rating!'); fetchPackages(); } else alert('Failed to submit rating');
            });

            // Favorite heart
            const heart = card.querySelector('.favorite-heart');
            heart.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = heart.dataset.id;
                if (heart.classList.contains('active')) {
                    await fetch(`/api/auth/customer/favorites/${id}`, { method: 'DELETE', headers: authHeaders() });
                    heart.classList.remove('active');
                    favoritesCache = favoritesCache.filter(f => f._id !== id);
                } else {
                    await fetch(`/api/auth/customer/favorites/${id}`, { method: 'POST', headers: authHeaders() });
                    heart.classList.add('active');
                    favoritesCache.push({ _id: id });
                }
            });

            packagesGrid.appendChild(card);
        });
    }

    // Stars helper
    function renderStars(value) {
        const full = Math.floor(value);
        const half = value - full >= 0.5;
        let out = '';
        for (let i = 0; i < full; i++) out += '<svg viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.896 4.664 23.165l1.402-8.167L0.132 9.21l8.2-1.193z"/></svg>';
        if (half) out += '<svg viewBox="0 0 24 24"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.896V.587z"/></svg>';
        return out;
    }

    // Profile
    async function fetchProfile() {
        const res = await fetch('/api/auth/customer/profile', { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        document.getElementById('fullName').value = data.fullName || '';
        document.getElementById('address').value = data.address || '';
    }

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const address = document.getElementById('address').value;
        await fetch('/api/auth/customer/profile', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, address }) });
        alert('Profile Updated!');
    });

    // Orders
    async function fetchMyOrders() {
        const res = await fetch('/api/orders/myorders', { headers: authHeaders() });
        if (!res.ok) return ordersGrid.innerHTML = '<p>Could not load orders.</p>';
        const orders = await res.json(); renderOrders(orders);
    }

    function renderOrders(orders) {
        if (!orders || orders.length === 0) return ordersGrid.innerHTML = '<p>You have no active orders.</p>';
        ordersGrid.innerHTML = '';
        orders.forEach(order => ordersGrid.appendChild(createOrderCard(order)));
    }

    function createOrderCard(order) {
        const card = document.createElement('div'); card.className = 'card order-card'; card.setAttribute('data-order-id', order._id);
        const allStatuses = ['Received','Accepted','Partner Reached','Setup Complete','Ready for Pickup','Picked Up'];
        const currentIndex = allStatuses.indexOf(order.status);

        let statusHTML = '<ul class="status-tracker">';
        allStatuses.forEach((s, i) => { if (order.status === 'Declined') return; const completed = i <= currentIndex ? 'completed' : ''; statusHTML += `<li class="status-step ${completed}">${s}</li>`; });
        statusHTML += '</ul>';
        if (order.status === 'Declined') statusHTML = '<p style="color: var(--danger-color); font-weight: bold;">This order was declined.</p>';

        card.innerHTML = `
            <div class="order-card-header">
                <div><h3>${order.package.name}</h3><p>Order #${order._id.slice(-6)}</p></div>
                <span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span>
            </div>
            <div class="order-card-body" id="status-body-${order._id}">
                <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                <p><strong>Partner:</strong> ${order.assignedPartner ? order.assignedPartner.companyName : 'Pending...'}</p>
                ${statusHTML}
            </div>
        `;

        return card;
    }

    // Book modal
    function showOrderModal(pkg) {
        modalBody.innerHTML = `
            <h2>Book: ${pkg.name}</h2>
            <form id="order-form">
                <input type="hidden" id="packageId" value="${pkg._id}">
                <div class="form-group"><label for="eventDate">Event Date</label><input type="date" id="eventDate" required></div>
                <div class="form-group"><label for="address">Event Address</label><textarea id="orderAddress" placeholder="Full address for the event" required></textarea></div>
                <div class="form-group"><label>Payment</label><select id="paymentType"><option value="25%">Pay 25% Deposit ($${(pkg.price * 0.25).toFixed(2)})</option><option value="100%">Pay 100% Full ($${pkg.price.toFixed(2)})</option></select></div>
                <button type="submit" class="btn btn-primary btn-full">Confirm Booking</button>
            </form>`;

        showModal();
        document.getElementById('order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const paymentType = document.getElementById('paymentType').value;
                const price = pkg.price;
                const paymentAmount = paymentType === '100%' ? price : price * 0.25;
                const orderData = {
                    packageId: document.getElementById('packageId').value,
                    eventDate: document.getElementById('eventDate').value,
                    address: document.getElementById('orderAddress').value,
                    paymentType,
                    paymentAmount
                };

                console.log('Placing order:', orderData);

                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        ...authHeaders(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                if (res.ok) {
                    const result = await res.json();
                    console.log('Order placed successfully:', result);
                    alert('Order placed successfully!');
                    closeModal();
                    document.querySelector('.nav-tab[data-target="my-orders"]').click();
                } else {
                    const error = await res.json();
                    console.error('Failed to place order:', error);
                    alert('Failed to place order: ' + (error.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Error placing order: ' + error.message);
            }
        });
    }

    // Initial load
    fetchPackages();
});