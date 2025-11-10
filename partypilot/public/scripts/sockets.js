// Load Socket.IO client from CDN-free path if bundled on server; otherwise add script tag in HTML if needed.
// Here we assume socket.io served by server at /socket.io/socket.io.js
export function connectOrdersSocket(userId) {
  // @ts-ignore global io from Socket.IO client
  const socket = io('/orders', { auth: { userId } });
  return socket;
}
