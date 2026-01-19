// Minimal test server
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on http://localhost:${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
});

// Keep alive
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
