export function setupOrdersNamespace(ns) {
  ns.on('connection', (socket) => {
    const { userId } = socket.handshake.auth;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
}
