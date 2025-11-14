import { toast } from './main.js';

export function connectOrdersSocket(userId) {
  // global `io` provided by /socket.io/socket.io.js
  const socket = io('/orders', { auth: { userId } });

  socket.on('connect', () => toast('Connected for live updates'));
  socket.on('disconnect', () => toast('Disconnected from live updates', 'error'));

  // Standard events from server
  socket.on('order:created', (o) => toast(`Order created: ${o._id}`));
  socket.on('order:accepted', (o) => toast(`Order accepted: ${o._id}`));
  socket.on('order:statusUpdated', (o) => toast(`Status → ${o.status}`));

  return socket;
}

