// src/sockets/orders.namespace.js
/**
 * Orders namespace setup + emit helper
 * - setupOrdersNamespace(io): attaches /orders and joins rooms "user:<userId>"
 * - emitOrderEvent(io, order, event): sends event to customer and partner rooms
 */
export function setupOrdersNamespace(io) {
  const nsp = io.of('/orders');

  nsp.on('connection', (socket) => {
    const { userId } = socket.handshake.auth || {};
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    console.log(`✅ Socket connected for user ${userId}`);
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected for user ${userId}`);
    });
  });

  console.log('✅ Orders namespace ready at /orders');
}

export function emitOrderEvent(io, order, event) {
  if (!io || !order) return;
  try {
    if (order.customerId) io.of('/orders').to(`user:${order.customerId}`).emit(event, order);
    if (order.partnerId) io.of('/orders').to(`user:${order.partnerId}`).emit(event, order);
  } catch (err) {
    console.error('Socket emit error:', err);
  }
}
