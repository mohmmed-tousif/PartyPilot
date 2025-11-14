// frontend/partner/partner.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token || localStorage.getItem('role') !== 'partner') {
        localStorage.clear();
        window.location.href = '/';
        return;
    }

    // --- Global Elements ---
    const myOrdersGrid = document.getElementById('my-orders-grid');
    const newOrdersGrid = document.getElementById('new-orders-grid');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- Socket.IO Setup ---
    const socket = io();
    socket.on('connect', () => console.log('Socket connected:', socket.id));

    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
            
            if (tab.dataset.target === 'my-orders') fetchMyOrders();
            if (tab.dataset.target === 'new-orders') fetchNewOrders();
        });
    });

    // --- Logout ---
    logoutBtn.onclick = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- API Functions ---
    
    const apiFetch = async (url, options = {}) => {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        return await fetch(url, options);
    };

    // 1. My Assigned Orders
    async function fetchMyOrders() {
        const res = await apiFetch('/api/partner/orders/my');
        if (res.ok) {
            const orders = await res.json();
            renderMyOrders(orders);
        } else if (res.status === 401) {
            alert('Your session expired or you are not authorized.');
            logoutBtn.click();
        }
    }
    
    function renderMyOrders(orders) {
        if (orders.length === 0) {
            myOrdersGrid.innerHTML = '<p>You have no assigned orders.</p>';
            return;
        }
        myOrdersGrid.innerHTML = '';
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'card order-card';
            
            const statusOptions = ['Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up'];
            const currentStatusIndex = statusOptions.indexOf(order.status);
            
            let statusSelector = '';
            if (currentStatusIndex < statusOptions.length - 1) {
                statusSelector = `
                    <div class="form-group" style="margin-top: 1rem;">
                        <select class="status-select" data-order-id="${order._id}">
                            <option value="">-- Update Status --</option>
                            ${statusOptions.slice(currentStatusIndex + 1).map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary btn-sm update-status-btn" data-order-id="${order._id}">Update</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="order-card-header">
                    <div>
                        <h3>${order.package.name}</h3>
                        <p>Order #${order._id.slice(-6)}</p>
                    </div>
                    <span class="order-status status-${order.status.replace(' ', '-')}">${order.status}</span>
                </div>
                <div class="order-card-body">
                    <p><strong>Customer:</strong> ${order.customer.fullName}</p>
                    <p><strong>Phone:</strong> ${order.customer.phone}</p>
                    <p><strong>Address:</strong> ${order.customer.address}</p>
                    <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                    ${statusSelector}
                </div>
            `;
            
            card.querySelector('.update-status-btn')?.addEventListener('click', handleStatusUpdate);
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
            alert('Status updated!');
            fetchMyOrders(); // Refresh the list
        } else {
            alert('Failed to update status.');
        }
    }

    // 2. New Available Orders
    async function fetchNewOrders() {
        const res = await apiFetch('/api/partner/orders/new');
        if (res.ok) {
            const orders = await res.json();
            renderNewOrders(orders);
        }
    }

    function renderNewOrders(orders) {
        if (orders.length === 0) {
            newOrdersGrid.innerHTML = '<p>No new orders available right now.</p>';
            return;
        }
        newOrdersGrid.innerHTML = '';
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'card order-card';
            card.innerHTML = `
                <div class="order-card-header">
                    <h3>${order.package.name}</h3>
                    <span class="order-status status-Received">New</span>
                </div>
                <div class="order-card-body">
                    <p><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</p>
                    <p><strong>Address:</strong> ${order.customer.address}</p>
                    <p><strong>Payout:</strong> $${(order.package.price * 0.75).toFixed(2)} (Approx.)</p>
                    <button class="btn btn-success btn-full accept-order-btn" data-order-id="${order._id}">Accept Order</button>
                </div>
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
            alert('Order accepted!');
            document.querySelector('.nav-tab[data-target="my-orders"]').click(); // Switch to My Orders
        } else {
            const data = await res.json();
            alert(`Failed to accept: ${data.message}`);
            fetchNewOrders(); // Refresh list, someone else might have taken it
        }
    }

    // Initial Load
    fetchMyOrders();
});