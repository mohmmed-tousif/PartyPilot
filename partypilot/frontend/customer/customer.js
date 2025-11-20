// frontend/customer/customer.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
        window.location.href = '/';
        return;
    }

    // --- Global Elements ---
    const packagesGrid = document.getElementById('packages-grid');
    const ordersGrid = document.getElementById('orders-grid');
    const modal = document.getElementById('mainModal');
    const modalBody = document.getElementById('modal-body');
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // --- Socket.IO Setup ---
    const socket = io();
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socket.emit('joinRoom', userId); // Join customer-specific room
    });

    socket.on('orderStatusChanged', (data) => {
        // data = { orderId: '...', newStatus: '...' }
        console.log('Order update received!', data);
        updateOrderStatusUI(data.orderId, data.newStatus);
        // Optionally, show a notification
    });

    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
            
            // Load content when tab is clicked
            if (tab.dataset.target === 'packages') fetchPackages();
            if (tab.dataset.target === 'my-orders') fetchMyOrders();
            if (tab.dataset.target === 'profile') fetchProfile();
        });
    });

    // --- Modal Logic ---
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-btn')) {
            closeModal();
        }
    });
    function showModal() { modal.style.display = 'block'; }
    function closeModal() { modal.style.display = 'none'; }

    // --- Logout ---
    logoutBtn.onclick = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    // --- API Functions ---
    
    // 1. Packages
    async function fetchPackages() {
        const res = await fetch('/api/orders/packages', { // Uses the public order route
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const packages = await res.json();
            renderPackages(packages.filter(p => p.isActive)); // Only show active
        }
    }

    function renderPackages(packages) {
        if (packages.length === 0) {
            packagesGrid.innerHTML = '<p>No packages available at this time.</p>';
            return;
        }
        packagesGrid.innerHTML = '';
        packages.forEach(pkg => {
            const card = document.createElement('div');
            card.className = 'card package-card';
            card.innerHTML = `
                <img src="${pkg.image}" alt="${pkg.name}">
                <div class="package-card-body">
                    <h3>${pkg.name}</h3>
                    <div class="package-card-price">$${pkg.price}</div>
                    <p>${pkg.description}</p>
                    <ul>
                        ${pkg.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    <button class="btn btn-primary btn-full" data-id="${pkg._id}" data-price="${pkg.price}">Book Now</button>
                </div>
            `;
            card.querySelector('button').onclick = () => showOrderModal(pkg);
            packagesGrid.appendChild(card);
        });
    }

    // 2. Profile
    async function fetchProfile() {
        // This endpoint needs to be created, for simplicity, we'll just populate form
        // const res = await fetch('/api/auth/customer/profile', {
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await res.json();
        // document.getElementById('fullName').value = data.fullName || '';
        // document.getElementById('address').value = data.address || '';
    }
    
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const address = document.getElementById('address').value;
        
        await fetch('/api/auth/customer/profile', {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, address })
        });
        alert('Profile Updated!');
    });

    // 3. My Orders
    async function fetchMyOrders() {
        const res = await fetch('/api/orders/myorders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const orders = await res.json();
            renderOrders(orders);
        } else {
            ordersGrid.innerHTML = '<p>Could not load orders.</p>';
        }
    }

    function renderOrders(orders) {
        if (orders.length === 0) {
            ordersGrid.innerHTML = '<p>You have no active orders.</p>';
            return;
        }
        ordersGrid.innerHTML = '';
        orders.forEach(order => {
            ordersGrid.appendChild(createOrderCard(order));
        });
    }

    function createOrderCard(order) {
        const card = document.createElement('div');
        card.className = 'card order-card';
        card.setAttribute('data-order-id', order._id); 

        const allStatuses = ['Received', 'Accepted', 'Partner Reached', 'Setup Complete', 'Ready for Pickup', 'Picked Up'];
        const currentStatusIndex = allStatuses.indexOf(order.status);
        
        let statusHTML = '<ul class="status-tracker">';
        allStatuses.forEach((status, index) => {
            if(order.status === 'Declined') return; // Skip if declined
            const isCompleted = index <= currentStatusIndex ? 'completed' : '';
            statusHTML += `<li class="status-step ${isCompleted}">${status}</li>`;
        });
        statusHTML += '</ul>';
        
        if (order.status === 'Declined') {
            statusHTML = '<p style="color: var(--danger-color); font-weight: bold;">This order was declined.</p>';
        }

        card.innerHTML = `
            <div class="order-card-header">
                <div>
                    <h3>${order.package.name}</h3>
                    <p>Order #${order._id.slice(-6)}</p>
                </div>
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

    function updateOrderStatusUI(orderId, newStatus) {
        const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
        if (!orderCard) return;

        // Re-fetch and re-render the card for simplicity
        fetchMyOrders();
    }
    
    // 4. Create Order
   // 4. Create Order with Dummy Payment Flow
    function showOrderModal(pkg) {
        // 1. Show the Booking Form first
        modalBody.innerHTML = `
            <h2>Book: ${pkg.name}</h2>
            <form id="order-form">
                <input type="hidden" id="packageId" value="${pkg._id}">
                <div class="form-group">
                    <label for="eventDate">Event Date</label>
                    <input type="date" id="eventDate" required>
                </div>
                <div class="form-group">
                    <label for="address">Event Address</label>
                    <textarea id="orderAddress" placeholder="Full address for the event" required></textarea>
                </div>
                <div class="form-group">
                    <label>Payment</label>
                    <select id="paymentType">
                        <option value="25%">Pay 25% Deposit ($${(pkg.price * 0.25).toFixed(2)})</option>
                        <option value="100%">Pay 100% Full ($${pkg.price.toFixed(2)})</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-full">Proceed to Payment</button>
            </form>
        `;
        showModal();
        
        // 2. Handle "Proceed" Click
        document.getElementById('order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Capture the data, but don't send it yet!
            const paymentType = document.getElementById('paymentType').value;
            const price = pkg.price;
            const paymentAmount = paymentType === '100%' ? price : price * 0.25;

            // Prepare the data object
            const pendingOrderData = {
                packageId: document.getElementById('packageId').value,
                eventDate: document.getElementById('eventDate').value,
                address: document.getElementById('orderAddress').value,
                paymentType: paymentType,
                paymentAmount: paymentAmount
            };

            // Close Booking Modal & Open Payment Modal
            closeModal(); 
            openPaymentModal(pendingOrderData);
        });
    }

    // --- NEW: Payment Modal Logic ---
    function openPaymentModal(orderData) {
        const paymentModal = document.getElementById('paymentModal');
        const amountDisplay = document.getElementById('payAmountDisplay');
        const payBtn = document.getElementById('confirmPaymentBtn');
        const cancelBtn = document.getElementById('cancelPaymentBtn');
        const loader = document.getElementById('paymentLoader');
        
        // Elements for toggling
        const cardSection = document.getElementById('payment-card-section');
        const upiSection = document.getElementById('payment-upi-section');
        const radios = document.getElementsByName('paymentMethod');
        const upiInput = document.getElementById('upiIdInput');

        // Reset UI State
        paymentModal.style.display = 'block';
        amountDisplay.innerText = `$${orderData.paymentAmount.toFixed(2)}`;
        payBtn.style.display = 'block';
        cancelBtn.style.display = 'block';
        loader.style.display = 'none';
        
        // Reset to Card default
        radios[0].checked = true;
        cardSection.style.display = 'block';
        upiSection.style.display = 'none';
        upiInput.value = ''; // Clear previous input

        // --- Toggle Logic ---
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'upi') {
                    cardSection.style.display = 'none';
                    upiSection.style.display = 'block';
                } else {
                    cardSection.style.display = 'block';
                    upiSection.style.display = 'none';
                }
            });
        });

        // Handle Cancel
        cancelBtn.onclick = () => {
            paymentModal.style.display = 'none';
        };

        // Handle Pay Now
        payBtn.onclick = async () => {
            // Simple Validation for UPI
            if (upiSection.style.display === 'block' && upiInput.value.trim() === '') {
                alert('Please enter a valid UPI ID');
                return;
            }

            // 1. Show Loader
            payBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            loader.style.display = 'block';

            // 2. Fake Delay (2 seconds)
            setTimeout(async () => {
                try {
                    // 3. Send to backend
                    const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderData)
                    });
                    
                    if (res.ok) {
                        alert('Payment Successful! Order Placed.');
                        paymentModal.style.display = 'none';
                        document.querySelector('.nav-tab[data-target="my-orders"]').click();
                    } else {
                        throw new Error('API Error');
                    }
                } catch (err) {
                    alert('Payment Failed. Please try again.');
                    paymentModal.style.display = 'none';
                }
            }, 2000);
        };
    }

    // Initial Load
    fetchPackages();
});