/**
 * Entry point: creates HTTP server, mounts Express app and Socket.IO.
 * For now: minimal health + static files from /public.
 */
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { initSockets } from './sockets/index.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 3000;
await connectDB(); // connect before server starts
// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO with basic CORS (refined later with env)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize namespaces (handlers filled in later phases)
initSockets(io);
app.set('io', io); // allow controllers to emit socket events via req.app.get('io')
// Start server
server.listen(PORT, () => {
  console.log(`✅ PartyPilot server running on http://localhost:${PORT}`);
});
