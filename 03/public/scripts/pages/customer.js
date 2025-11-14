import { api } from '../api.js';
import { toast } from '../main.js';
import { connectOrdersSocket } from '../sockets.js';

function token() { return localStorage.getItem('token'); }
if (!token()) location.href = '/login-customer.html';

let userId = null;
const cart = [];

const grid = document.getElementById('pkgGrid');
const cartList = document.getElementById('cartList');

// --- Safe show() fallback (no multi-screen crash) ---
function show(screen) {
  const target = document.getElementById(`screen-${screen}`);
  if (target) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    target.classList.remove('hidden');
  } else {
    console.log(`show("${screen}") → single-section mode`);
  }
}

// --- Init after DOM ready ---
document.addEventListener('DOMContentLoaded', () => init());

async function init() {
  try {
   const res = await api('/api/profile/me');
   const user = res.user || (res.ok ? res.user : null);

   // Prefill form if profile data exists
const form = document.getElementById("profileForm");
if (user.profile) {
  for (const key in user.profile) {
    if (form[key]) form[key].value = user.profile[key] ?? "";
  }
}


    userId = user.id || user._id;

    // Connect sockets safely
    connectOrdersSocket(userId);

    if (!user.profile || !user.profile.fullName) {
      show('profile');
    } else {
      await loadPackages();
      await loadOrders();
    }
  } catch (e) {
    console.error('Init error:', e);
    show('profile');
  }
}

// --- Load packages grid ---
async function loadPackages() {
  try {
    show('packages');

    const res = await api('/api/packages');
    const packages = res.packages || res.data || [];
    console.log('✅ Loaded packages:', packages);

    if (!grid) return;
    grid.innerHTML = '';

    if (!packages.length) {
      grid.innerHTML = '<p class="muted">No packages available.</p>';
      return;
    }

    packages.forEach(pkg => {
      const el = document.createElement('div');
      el.className = 'card feature';
      el.innerHTML = `
        <h3>${pkg.title} – ₹${pkg.price}</h3>
        <p class="muted">${pkg.description || ''}</p>
        <button class="btn small" data-id="${pkg._id}">Add to Cart</button>
      `;
      grid.appendChild(el);
    });

    grid.onclick = e => {
      const id = e.target.dataset.id;
      if (!id) return;
      const pkg = packages.find(x => x._id === id);
      addToCart(pkg);
    };
  } catch (err) {
    console.error('Package load error:', err);
  }
}

// --- Add to cart ---
function addToCart(pkg) {
  if (!pkg) return;
  const existing = cart.find(i => i.packageId === pkg._id);
  if (existing) existing.qty += 1;
  else cart.push({ packageId: pkg._id, title: pkg.title, qty: 1, price: pkg.price });
  renderCart();
  toast(`${pkg.title} added to cart`);
}

// --- Render + remove cart items ---
function renderCart() {
  if (!cartList) return;
  if (!cart.length) {
    cartList.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cartList.innerHTML = cart.map((item, i) => `
    <div class="card">
      <div class="flex" style="justify-content:space-between;">
        <div>${item.title}</div>
        <div>₹${item.price} × ${item.qty}</div>
      </div>
      <button class="btn small outline" data-remove="${i}">Remove</button>
    </div>
  `).join('');

  cartList.onclick = e => {
    const idx = e.target.dataset.remove;
    if (idx !== undefined) {
      cart.splice(idx, 1);
      renderCart();
      toast('Item removed');
    }
  };
}

// --- Save profile ---
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  const res = await api('/api/profile/customer', { method: 'POST', body });
  if (res.ok) {
    toast('Profile saved!');
    // Refill form with updated data
    const user = res.user;
    for (const key in user.profile) {
      if (e.target[key]) e.target[key].value = user.profile[key] ?? '';
    }
    loadPackages();
    loadOrders();
  } else {
    toast('Error saving profile', 'error');
  }
});


// --- Checkout (25% / 100%) ---
async function checkout(payPercent) {
  if (!cart.length) return toast('Add items first', 'error');

  // 🪟 Step 1: Show UPI modal
  const modal = document.getElementById("upiModal");
  const upiInput = document.getElementById("upiIdInput");
  const amountEl = document.getElementById("upiAmountDisplay");
  const confirmBtn = document.getElementById("upiConfirm");
  const cancelBtn = document.getElementById("upiCancel");

  // calculate payable amount
  const { total } = await api("/api/cart/price", { method: "POST", body: { items: cart } });
  const payable = Math.round(total * (payPercent / 100));
  amountEl.innerHTML = `<strong>Payable Amount:</strong> ₹${payable}`;

  modal.classList.remove("hidden");
  upiInput.focus();

  // 🧠 Return a promise that resolves only after confirmation
  const confirmed = await new Promise(resolve => {
    const cleanup = () => {
      confirmBtn.onclick = cancelBtn.onclick = null;
      modal.classList.add("hidden");
    };

    confirmBtn.onclick = () => {
      const upi = upiInput.value.trim();
      if (!upi || !upi.includes("@")) {
        toast("Enter a valid UPI ID", "error");
        return;
      }
      cleanup();
      resolve(upi);
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(null);
    };
  });

  if (!confirmed) return toast("Payment cancelled");

  // 🪙 Step 2: Proceed with your normal mock payment + order creation
  try {
    await api("/api/payments/mock", {
      method: "POST",
      body: { totalAmount: total, payPercent, upiId: confirmed }
    });

    const res = await api("/api/orders", {
      method: "POST",
      body: { items: cart, payPercent }
    });

    if (res.ok) {
      toast("✅ Order placed successfully!");
      cart.length = 0;
      renderCart();
      loadOrders();
    } else {
      toast("Order failed: " + res.message, "error");
    }
  } catch (err) {
    console.error("Checkout error", err);
    toast("Checkout failed", "error");
  }
}


document.getElementById('pay25')?.addEventListener('click', () => checkout(25));
document.getElementById('pay100')?.addEventListener('click', () => checkout(100));

// --- Load orders ---
async function loadOrders() {
  show('orders');
  const { orders } = await api('/api/orders/my');
  const list = document.getElementById('orderList');
  if (!orders?.length) return (list.innerHTML = 'No orders yet.');

  list.innerHTML = orders.map(o => renderOrderCard(o)).join('');

  // expand / collapse order details
  list.querySelectorAll('.order-header').forEach(h => {
    h.onclick = () => {
      const id = h.dataset.toggle;
      const card = list.querySelector(`[data-id="${id}"]`);
      const details = card.querySelector('.order-details');
      const arrow = card.querySelector('.arrow');
      details.classList.toggle('hidden');
      arrow.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    };
  });

  // cancel order
  list.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.cancel;
      const confirmCancel = confirm('Are you sure you want to cancel this order?');
      if (!confirmCancel) return;
      const res = await api(`/api/orders/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        toast('Order cancelled');
        loadOrders();
      } else {
        toast('Failed to cancel order', 'error');
      }
    };
  });
}


function renderOrderCard(o) {
  const flow = ['received','accepted','partner_reached','setup_complete','ready_for_pickup','picked_up','cancelled'];
  const timeline = flow
    .map(s => `<span class="badge ${o.status === s ? 'state-active' : ''}">${s.replaceAll('_', ' ')}</span>`)
    .join(' ➜ ');

  const cancelAllowed = !['cancelled', 'picked_up'].includes(o.status);
  const orderItems = (o.items || [])
    .map(it => `<li>${it.title} – ₹${it.price} × ${it.qty}</li>`)
    .join('');

  return `
    <div class="card order-card" data-id="${o._id}">
      <div class="flex items-center justify-between cursor-pointer order-header" data-toggle="${o._id}">
        <div><strong>Order</strong> ${o._id.slice(-6)}</div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">${o.status.replaceAll('_',' ')}</span>
          <span class="arrow" style="transition:transform .3s;">▼</span>
        </div>
      </div>

      <div class="order-details hidden mt-3 text-sm text-gray-300">
        <ul class="mb-2">${orderItems || '<li>No item data</li>'}</ul>
        <div>Paid ₹${o.payment?.amountPaid ?? 0} / ₹${o.payment?.totalAmount ?? 0}</div>
        <div class="timeline mt-3 mb-3">${timeline}</div>
        ${
          cancelAllowed
            ? `<button class="btn small outline cancel-btn" data-cancel="${o._id}">Cancel Order</button>`
            : `<div class="text-gray-500 italic">Order ${o.status}</div>`
        }
      </div>
    </div>
  `;
}


// --- Initialize ---
renderCart();
