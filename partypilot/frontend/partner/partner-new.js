// frontend/partner/partner-new.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token || localStorage.getItem('role') !== 'partner') {
        localStorage.clear();
        window.location.href = '/';
        return;
    }

    // Global Elements
    const myOrdersGrid = document.getElementById('my-orders-grid');
    const newOrdersGrid = document.getElementById('new-orders-grid');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const locationStatus = document.getElementById('locationStatus');
    const mapContainer = document.getElementById('map');

    // Stats Elements
    const statActive = document.getElementById('statActive');
    const statCompleted = document.getElementById('statCompleted');
    const statAvailable = document.getElementById('statAvailable');
    const statEarnings = document.getElementById('statEarnings');

    // Google Maps variables
    let map, marker;
    let locationUpdateInterval;
    let isLocationSharing = false;

    // Socket.IO Setup
    const socket = io();
    socket.on('connect', () => console.log('Partner socket connected:', socket.id));

    // Tab Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.style.display = 'none');
            
            tab.classList.add('active');
            const targetSection = document.getElementById(tab.dataset.target);
            targetSection.style.display = 'block';
            
            if (tab.dataset.target === 'my-orders') fetchMyOrders();
            if (tab.dataset.target === 'new-orders') fetchNewOrders();
        });
    });

    // Logout
    logoutBtn.onclick = () => {
        if (locationUpdateInterval) clearInterval(locationUpdateInterval);
        localStorage.clear();
        window.location.href = '/';
    };

    // API Helper
    const apiFetch = async (url, options = {}) => {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const res = await fetch(url, options);
        if (res.status === 401) {
            alert('Session expired');
            logoutBtn.click();
        }
        return res;
    };

    // Google Maps Location Tracking
    enableLocationBtn.onclick = () => {
        if (isLocationSharing) {
            stopLocationSharing();
        } else {
            startLocationSharing();
        }
    };

    function startLocationSharing() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Initialize map
            if (!map) {
                mapContainer.style.display = 'block';
                map = new google.maps.Map(mapContainer, {
                    center: { lat, lng },
                    zoom: 15,
                    styles: [
                        {
                            featureType: 'poi',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });

                marker = new google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    title: 'Your Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#FF6B9D',
                        fillOpacity: 1,
                        strokeColor: 'white',
                        strokeWeight: 3
                    }
                });
            }

            // Update location on server
            updateLocationOnServer(lat, lng);

            // Start continuous updates every 30 seconds
            locationUpdateInterval = setInterval(() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const newLat = pos.coords.latitude;
                    const newLng = pos.coords.longitude;
                    
                    // Update marker
                    marker.setPosition({ lat: newLat, lng: newLng });
                    map.setCenter({ lat: newLat, lng: newLng });
                    
                    // Update server
                    updateLocationOnServer(newLat, newLng);
                });
            }, 30000); // 30 seconds

            isLocationSharing = true;
            enableLocationBtn.textContent = 'Disable Location Sharing';
            enableLocationBtn.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
            locationStatus.textContent = 'Location Sharing Active';
            locationStatus.classList.add('active');
            locationStatus.style.background = '#E8F5E9';
            locationStatus.style.color = '#2E7D32';

        }, (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to get your location. Please enable location services.');
        });
    }

    function stopLocationSharing() {
        if (locationUpdateInterval) {
            clearInterval(locationUpdateInterval);
        }
        
        isLocationSharing = false;
        enableLocationBtn.textContent = 'Enable Location Sharing';
        enableLocationBtn.style.background = 'linear-gradient(135deg, #2196F3, #03A9F4)';
        locationStatus.textContent = 'Location Sharing Off';
        locationStatus.classList.remove('active');
        locationStatus.style.background = '#FFEBEE';
        locationStatus.style.color = '#C62828';
    }

    async function updateLocationOnServer(lat, lng) {
        try {
            await apiFetch('/api/partner/location', {
                method: 'PUT',
                body: JSON.stringify({ latitude: lat, longitude: lng })
            });
            console.log('Location updated on server');
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    }

    // Fetch My Orders
    async function fetchMyOrders() {
        const res = await apiFetch('/api/partner/orders/my');
        if (res.ok) {
            const orders = await res.json();
            renderMyOrders(orders);
            updateStats(orders, 'active');
        }
    }

    function renderMyOrders(orders) {
        if (orders.length === 0) {
            myOrdersGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 3rem;">You have no assigned orders.</p>';
            return;
        }
        
        myOrdersGrid.innerHTML = '';
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card-modern';
            
            const imageUrl = (order.package.images && order.package.images.length > 0) 
                ? order.package.images[0] 
                : (order.package.image || 'https://via.placeholder.com/400x300');
            
            const statusOptions = ['Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up'];
            const currentStatusIndex = statusOptions.indexOf(order.status);
            
            let statusSelector = '';
            if (currentStatusIndex < statusOptions.length - 1) {
                statusSelector = `
                    <div style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
                        <select class="status-select" data-order-id="${order._id}" style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 2px solid var(--light-gray); font-family: inherit;">
                            <option value="">-- Update Status --</option>
                            ${statusOptions.slice(currentStatusIndex + 1).map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary update-status-btn" data-order-id="${order._id}">Update</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="order-header-modern">
                    <div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${order.package.name}</h3>
                        <p style="color: var(--gray); font-size: 0.9rem;">Order #${order._id.slice(-6)}</p>
                    </div>
                    <span class="order-badge badge-active">${order.status}</span>
                </div>
                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1.5rem;">
                    <img src="${imageUrl}" alt="${order.package.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md);" onerror="this.src='https://via.placeholder.com/100x100'">
                    <div>
                        <p style="margin-bottom: 0.5rem;"><strong>Customer:</strong> ${order.customer.fullName || 'N/A'}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Phone:</strong> ${order.customer.phone || 'N/A'}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Address:</strong> ${order.customer.address || order.address}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Amount:</strong> <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">$${order.paymentAmount}</span></p>
                    </div>
                </div>
                ${statusSelector}
            `;
            
            const updateBtn = card.querySelector('.update-status-btn');
            if (updateBtn) {
                updateBtn.addEventListener('click', handleStatusUpdate);
            }
            
            myOrdersGrid.appendChild(card);
        });
    }

    async function handleStatusUpdate(e) {
        const orderId = e.target.dataset.orderId;
        const select = document.querySelector(`.status-select[data-order-id="${orderId}"]`);
        const newStatus = select.value;

        if (!newStatus) {
            alert('Please select a new status.');
            return;
        }

        const res = await apiFetch(`/api/partner/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            alert('Status updated successfully!');
            fetchMyOrders();
        } else {
            alert('Failed to update status.');
        }
    }

    // Fetch New Orders
    async function fetchNewOrders() {
        const res = await apiFetch('/api/partner/orders/new');
        if (res.ok) {
            const orders = await res.json();
            renderNewOrders(orders);
            updateStats(orders, 'available');
        }
    }

    function renderNewOrders(orders) {
        if (orders.length === 0) {
            newOrdersGrid.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 3rem;">No new orders available right now.</p>';
            return;
        }
        
        newOrdersGrid.innerHTML = '';
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card-modern';
            
            const imageUrl = (order.package.images && order.package.images.length > 0) 
                ? order.package.images[0] 
                : (order.package.image || 'https://via.placeholder.com/400x300');
            
            card.innerHTML = `
                <div class="order-header-modern">
                    <div>
                        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${order.package.name}</h3>
                        <p style="color: var(--gray); font-size: 0.9rem;">Order #${order._id.slice(-6)}</p>
                    </div>
                    <span class="order-badge badge-new">New Order</span>
                </div>
                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1.5rem;">
                    <img src="${imageUrl}" alt="${order.package.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md);" onerror="this.src='https://via.placeholder.com/100x100'">
                    <div>
                        <p style="margin-bottom: 0.5rem;"><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Address:</strong> ${order.address || order.customer.address}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Package Price:</strong> $${order.package.price}</p>
                        <p style="margin-bottom: 0.5rem;"><strong>Your Payout:</strong> <span style="font-size: 1.25rem; font-weight: 700; color: #4CAF50;">$${(order.package.price * 0.75).toFixed(2)}</span></p>
                    </div>
                </div>
                <button class="btn btn-primary btn-full accept-order-btn" data-order-id="${order._id}" style="margin-top: 1rem; background: linear-gradient(135deg, #4CAF50, #8BC34A);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: inline; margin-right: 0.5rem;">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Accept Order
                </button>
            `;
            
            card.querySelector('.accept-order-btn').addEventListener('click', acceptOrder);
            newOrdersGrid.appendChild(card);
        });
    }

    async function acceptOrder(e) {
        const orderId = e.target.dataset.orderId;
        if (!confirm('Are you sure you want to accept this order?')) {
            return;
        }
        
        const res = await apiFetch(`/api/partner/orders/${orderId}/accept`, {
            method: 'PUT'
        });
        
        if (res.ok) {
            alert('Order accepted successfully!');
            document.querySelector('.nav-tab[data-target="my-orders"]').click();
        } else {
            const data = await res.json();
            alert(`Failed to accept: ${data.message}`);
            fetchNewOrders();
        }
    }

    // Update Stats
    function updateStats(orders, type) {
        if (type === 'active') {
            statActive.textContent = orders.length;
            const completed = orders.filter(o => o.status === 'Picked Up');
            statCompleted.textContent = completed.length;
            const totalEarnings = orders.reduce((sum, o) => sum + (o.paymentAmount * 0.75), 0);
            statEarnings.textContent = '$' + totalEarnings.toFixed(2);
        } else if (type === 'available') {
            statAvailable.textContent = orders.length;
        }
    }

    // Initial Load
    fetchMyOrders();
    fetchNewOrders();
});
