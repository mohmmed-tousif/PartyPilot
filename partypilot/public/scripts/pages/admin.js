import { api } from '../api.js';
import { toast } from '../main.js';

async function loadRevenue() {
  const { revenue } = await api('/api/admin/revenue');
  document.getElementById('rev').textContent =
    `Orders: ${revenue.count || 0} | Total: ₹${revenue.totalAmount || 0} | Paid: ₹${revenue.totalPaid || 0}`;
}

async function loadPackages() {
  const { packages } = await api('/api/packages');
  const box = document.getElementById('pkgList');
  box.innerHTML = packages.map(p => `<div class="card" style="margin-bottom:10px;">
    <strong>${p.title}</strong> – ₹${p.price} <small class="muted">/${p.slug}</small>
  </div>`).join('');
}

document.getElementById('pkgForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.price = Number(body.price || 0);
  await api('/api/packages', { method: 'POST', body });
  toast('Package created');
  e.target.reset();
  loadPackages();
});

async function loadBulletins() {
  const { bulletins } = await api('/api/admin/bulletins');
  document.getElementById('buls').innerHTML = bulletins.map(b => `<div class="card" style="margin-bottom:10px;">
    <strong>${b.title}</strong> – ${new Date(b.createdAt).toLocaleString()}<div class="muted">${b.message}</div>
  </div>`).join('');
}

document.getElementById('bulForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  await api('/api/admin/bulletins', { method: 'POST', body });
  toast('Bulletin posted');
  e.target.reset();
  loadBulletins();
});

loadRevenue();
loadPackages();
loadBulletins();
