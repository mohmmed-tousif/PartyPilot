import { toast } from '../main.js';

document.getElementById('requestOtpBtn')?.addEventListener('click', async () => {
  const emailOrPhone = document.getElementById('emailOrPhone').value.trim();
  const res = await fetch('/api/auth/customer/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone })
  });
  if (res.ok) {
    document.getElementById('verifyBlock').classList.remove('hidden');
    toast('OTP sent!');
  } else toast('Error requesting OTP', 'error');
});

document.getElementById('verifyOtpBtn')?.addEventListener('click', async () => {
  const emailOrPhone = document.getElementById('emailOrPhone').value.trim();
  const code = document.getElementById('otp').value.trim();
  const res = await fetch('/api/auth/customer/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, code })
  });
  const data = await res.json();
  if (data.ok) {
    localStorage.setItem('token', data.token);
    toast('Welcome!');
    window.location.href = '/customer.html';
  } else toast(data.message, 'error');
});
