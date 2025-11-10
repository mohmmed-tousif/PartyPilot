export function setupOrdersNamespace(ns) {
  ns.on('connection', (socket) => {
    const { userId } = socket.handshake.auth;
    if (userId) socket.join(`user:${userId}`);
  });
}

export function emitOrderEvent(io, order, event) {
  io.of('/orders').to(`user:${order.customerId}`).emit(event, order);
  if (order.partnerId) {
    io.of('/orders').to(`user:${order.partnerId}`).emit(event, order);
  }
}
