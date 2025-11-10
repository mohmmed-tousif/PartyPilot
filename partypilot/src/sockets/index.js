/**
 * Socket.IO bootstrap: create namespaces and basic auth placeholder.
 * Real event handlers will be added in the next phases.
 */
export function initSockets(io) {
  // General connection log
  io.on('connection', (socket) => {
    // For now, open namespace. Later: require JWT on connection.
    // eslint-disable-next-line no-console
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Orders namespace (handlers added later)
  const ordersNs = io.of('/orders');
  ordersNs.on('connection', (socket) => {
    console.log(`🧭 /orders namespace connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🧭 /orders namespace disconnected: ${socket.id}`);
    });
  });
}
import { setupOrdersNamespace } from './orders.namespace.js';

export function initSockets(io) {
  const ordersNs = io.of('/orders');
  setupOrdersNamespace(ordersNs);
}