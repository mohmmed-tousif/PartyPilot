import { setupOrdersNamespace } from './orders.namespace.js';

export function initSockets(io) {
  // Create namespace for order-related real-time updates
  const ordersNs = io.of('/orders');

  // Setup user room join handling
  setupOrdersNamespace(ordersNs);
}
