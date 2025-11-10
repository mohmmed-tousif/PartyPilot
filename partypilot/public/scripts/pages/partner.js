import { api } from '../api.js';
import { toast } from '../main.js';

async function loadIncoming() {
  const { orders } = await api('/api/orders/partner/incoming');
  const box = document.getElementById('incoming');
  if (!orders.length) return (box.textContent = 'No incoming orders.');
  box.innerHTML = orders.map(o => `
    <div class="card" style="margin-bottom:10px;">
      <div><strong>${o._id}</strong></div>
      <div>Total: ₹${o.payment.totalAmount}</div>
      <button class="btn" data-accept="${o._id}">Accept</button>
    </div>`).join('');
  box.onclick = async (e) => {
    const id = e.target?.dataset?.accept;
    if (!id) return;
    await api(`/api/orders/${id}/accept`, { method: 'POST' });
    toast('Order accepted');
    loadIncoming();
  };
}

document.getElementById('statusForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const orderId = fd.get('orderId');
  const status = fd.get('status');
  await api(`/api/orders/${orderId}/status`, { method: 'POST', body: { status } });
  toast('Status updated');
  (e.target).reset();
});

loadIncoming();
