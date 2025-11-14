/**
 * Small global utilities: year, toasts, intersection observer reveals.
 */

// Footer year
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear().toString();
});

// Toast system (simple)
export function toast(msg, type = 'info') {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.style.position = 'fixed';
    host.style.right = '16px';
    host.style.bottom = '16px';
    host.style.display = 'grid';
    host.style.gap = '10px';
    host.style.zIndex = '9999';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.padding = '12px 14px';
  el.style.borderRadius = '12px';
  el.style.background = type === 'error' ? 'var(--danger)' : 'var(--card)';
  el.style.color = 'white';
  el.style.boxShadow = 'var(--shadow)';
  host.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// Intersection observer for .reveal
(function () {
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((e) => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in');
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((e) => io.observe(e));
})();
