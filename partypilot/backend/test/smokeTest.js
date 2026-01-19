const base = process.env.BASE_URL || 'http://localhost:3000';
const doFetch = async (url, opts) => {
  if (typeof fetch !== 'undefined') return fetch(url, opts);
  const nf = await import('node-fetch');
  return nf.default(url, opts);
};
(async () => {
  try {
    console.log('Testing packages endpoint...');
    const p = await doFetch(`${base}/api/orders/packages`);
    console.log('/api/orders/packages', p.status);

    console.log('Testing admin stats endpoint (should require auth)...');
    const s = await doFetch(`${base}/api/admin/dashboard/stats`);
    console.log('/api/admin/dashboard/stats', s.status);

    console.log('Done. Run the server locally before running this test.');
  } catch (err) {
    console.error('Test failed', err.message);
    process.exit(1);
  }
})();
