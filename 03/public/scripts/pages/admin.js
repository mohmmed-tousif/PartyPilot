import { api } from '../api.js';
import { toast } from '../main.js';

const pkgBox = document.getElementById('pkgList');
const pkgForm = document.getElementById('pkgForm');

async function loadRevenue() {
  const { revenue } = await api('/api/admin/revenue');
  document.getElementById('rev').textContent =
    `Orders: ${revenue.count||0} | Total: ₹${revenue.totalAmount||0} | Paid: ₹${revenue.totalPaid||0}`;
}

async function loadPackages() {
  const { packages } = await api('/api/packages');
  pkgBox.innerHTML = `<table class="table">
    <thead><tr><th>Title</th><th>Slug</th><th>Price</th><th>Actions</th></tr></thead>
    <tbody>
      ${packages.map(p=>`<tr data-id="${p._id}">
        <td contenteditable="true" data-k="title">${p.title}</td>
        <td contenteditable="true" data-k="slug">${p.slug}</td>
        <td contenteditable="true" data-k="price">${p.price}</td>
        <td class="row-actions">
          <button class="btn small outline" data-save="${p._id}">Save</button>
          <button class="btn small" data-del="${p._id}">Delete</button>
        </td>
      </tr>`).join('')}
    </tbody>
  </table>`;

  pkgBox.onclick = async (e)=>{
    const save = e.target.closest('[data-save]'); const del = e.target.closest('[data-del]');
    if(save){
      const id = save.dataset.save;
      const row = pkgBox.querySelector(`tr[data-id="${id}"]`);
      const body = Object.fromEntries([...row.querySelectorAll('[data-k]')].map(td=>[td.dataset.k, td.textContent.trim()]));
      body.price = Number(body.price||0);
      await api(`/api/packages/${id}`, { method:'PUT', body });
      toast('Updated');
      loadPackages();
    }
    if(del){
      const id = del.dataset.del;
      await api(`/api/packages/${id}`, { method:'DELETE' });
      toast('Deleted');
      loadPackages();
    }
  };
}

pkgForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(pkgForm);
  const body = Object.fromEntries(fd.entries());
  body.price = Number(body.price||0);
  await api('/api/packages', { method:'POST', body });
  toast('Created');
  pkgForm.reset();
  loadPackages();
});

async function loadBulletins() {
  const { bulletins } = await api('/api/admin/bulletins');
  document.getElementById('buls').innerHTML = bulletins.map(b=>`
    <div class="card" style="margin-bottom:10px;">
      <strong>${b.title}</strong> – <span class="muted">${new Date(b.createdAt).toLocaleString()}</span>
      <div>${b.message}</div>
    </div>`).join('');
}

document.getElementById('bulForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target).entries());
  await api('/api/admin/bulletins', { method:'POST', body });
  toast('Bulletin posted');
  e.target.reset();
  loadBulletins();
});

loadRevenue(); loadPackages(); loadBulletins();
