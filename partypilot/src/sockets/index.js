// src/sockets/index.js
import { Server } from 'socket.io';
import { setupOrdersNamespace } from './orders.namespace.js';

export function initSockets(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Setup namespaces
  setupOrdersNamespace(io);

  return io;
}
