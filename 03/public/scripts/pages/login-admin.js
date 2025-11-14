import { toast } from '../main.js';

const toggle = document.getElementById('togglePw');
const input = document.getElementById('password');
toggle?.addEventListener('click', () => {
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(isPw));
  toggle.textContent = isPw ? 'Hide' : 'Show';
});

document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
  const email = document.getElementById('email').value.trim();
  const password = input.value;
  if (!email || !password) return toast('Enter email and password', 'error');
  // Next phase: POST /api/auth/admin/login
  toast('Logged in (stub). Redirecting…');
  setTimeout(() => (window.location.href = '/admin.html'), 700);
});
