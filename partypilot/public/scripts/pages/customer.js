import { api } from '../api.js';
import { toast } from '../main.js';

const cart = [];

async function loadPackages() {
  const { packages } = await api('/api/packages');
  const grid = document.getElementById('pkgGrid');
  grid.innerHTML = '';
  packages.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'card feature';
    el.innerHTML = `<h3>${p.title} – ₹${p.price}</h3><p class="muted">${p.description || ''}</p>
      <button class="btn" data-id="${p._id}">Add to Cart</button>`;
    grid.appendChild(el);
  });
  grid.addEventListener('click', (e) => {
    const id = e.target?.dataset?.id;
    if (!id) return;
    const pkg = packages.find((x) => x._id === id);
    cart.push({ packageId: id, qty: 1, title: pkg.title, price: pkg.price });
    renderCart();
  });
}

function renderCart() {
  const list = document.getElementById('cartList');
  if (!cart.length) { list.textContent = 'Cart is empty.'; return; }
  list.innerHTML = cart.map((c, i) => `<div>#${i + 1} ${c.title} – ₹${c.price}</div>`).join('');
}

async function loadOrders() {
  try {
    const { orders } = await api('/api/orders/my');
    const box = document.getElementById('orders');
    if (!orders.length) return (box.textContent = 'No orders yet.');
    box.innerHTML = orders.map(o => `<div class="card" style="margin-bottom:12px;">
      <div><strong>Order:</strong> ${o._id}</div>
      <div>Status: ${o.status}</div>
      <div>Paid: ₹${o.payment.amountPaid} / Total: ₹${o.payment.totalAmount}</div>
    </div>`).join('');
  } catch (e) { /* ignore until wired */ }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  await api('/api/profile/customer', { method: 'POST', body });
  toast('Profile saved');
});

async function checkout(payPercent) {
  if (!cart.length) return toast('Add items first', 'error');
  const { total } = await api('/api/cart/price', { method: 'POST', body: { items: cart } });
  await api('/api/payments/mock', { method: 'POST', body: { totalAmount: total, payPercent } });
  const { order } = await api('/api/orders', { method: 'POST', body: { items: cart, payPercent } });
  toast('Order placed!');
  cart.length = 0; renderCart(); loadOrders();
}

document.getElementById('pay25')?.addEventListener('click', () => checkout(25));
document.getElementById('pay100')?.addEventListener('click', () => checkout(100));

loadPackages();
renderCart();
loadOrders();
