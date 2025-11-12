// src/server.js
import http from 'http';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

await connectDB(); // connect DB before listening

// create server
const server = http.createServer(app);

// init sockets (returns io instance)
const io = initSockets(server);

// make io available to controllers via req.app.get('io')
app.set('io', io);

// start server
server.listen(PORT, () => {
  console.log(`✅ PartyPilot server running on http://localhost:${PORT}`);
});
