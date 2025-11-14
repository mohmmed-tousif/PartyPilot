import { api } from '../api.js';
import { toast } from '../main.js';
import { connectOrdersSocket } from '../sockets.js';

function token(){ return localStorage.getItem('token'); }
if(!token()) location.href='/login-partner.html';

let userId=null;

(async function init(){
  const me = await api('/api/profile/me');
  userId = (me.user?.id || me.user?._id);
  connectOrdersSocket(userId);
  await refreshAll();
})();

async function refreshAll() {
  await Promise.all([loadIncoming(), loadMine(), loadBulletins(), loadKpis()]);
}

async function loadIncoming() {
  const { orders } = await api('/api/orders/partner/incoming');
  const box = document.getElementById('incoming');
  if(!orders.length) return box.textContent='No incoming orders.';
  box.innerHTML = orders.map(o => renderIncoming(o)).join('');
  box.onclick = async (e)=>{
    const acc = e.target.closest('[data-accept]'); const dec = e.target.closest('[data-decline]');
    if(acc){ await api(`/api/orders/${acc.dataset.accept}/accept`, { method:'POST' }); toast('Accepted'); refreshAll(); }
    if(dec){ await api(`/api/orders/${dec.dataset.decline}/status`, { method:'POST', body:{ status:'declined' } }); toast('Declined'); refreshAll(); }
  };
}

function renderIncoming(o){
  return `<div class="card order-card" style="margin-bottom:10px;">
    <div><strong>${o._id}</strong></div>
    <div>Total: ₹${o.payment.totalAmount}</div>
    <div class="actions">
      <button class="btn small" data-accept="${o._id}">Accept</button>
      <button class="btn small outline" data-decline="${o._id}">Decline</button>
    </div>
  </div>`;
}

async function loadMine() {
  // simple approach: reuse /orders/my?role=partner — if not present, show accepted from admin route later
  const res = await api('/api/admin/revenue'); // placeholder to ensure admin reachable; real partner orders would be a dedicated endpoint (future)
  // For now pull accepted by refetching incoming (none) + show quick message:
  document.getElementById('myOrders').textContent = 'After accepting, orders move out of Incoming.';
}

async function loadBulletins(){
  try{
    const { bulletins } = await api('/api/admin/bulletins');
    document.getElementById('bulletins').innerHTML = (bulletins||[]).map(b=>`
      <div class="card" style="margin-bottom:10px;">
        <strong>${b.title}</strong> — <span class="muted">${new Date(b.createdAt).toLocaleString()}</span>
        <div>${b.message}</div>
      </div>`).join('');
  }catch(_){ document.getElementById('bulletins').textContent='No bulletins.';}
}

async function loadKpis(){
  // Minimal placeholders; real KPIs via dedicated endpoint if needed
  document.getElementById('kpiToday').textContent = '—';
  document.getElementById('kpiWeek').textContent = '—';
  document.getElementById('kpiMonth').textContent = '—';
  document.getElementById('kpiEarnings').textContent = '₹—';
}
