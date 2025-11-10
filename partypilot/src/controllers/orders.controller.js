import { createOrder, listCustomerOrders, listPartnerIncoming, acceptOrder } from '../services/order.service.js';
import { updateOrderStatus } from '../services/order.service.js';

export async function createOrderController(req, res, next) {
  try {
    const order = await createOrder(req.user.id, req.body);
    const io = req.app.get('io');
    io?.of('/orders').to(`user:${req.user.id}`).emit('order:created', order);
    res.json({ ok: true, order });
  } catch (err) { next(err); }
}

export async function customerOrdersController(req, res, next) {
  try {
    const orders = await listCustomerOrders(req.user.id);
    res.json({ ok: true, orders });
  } catch (err) { next(err); }
}

export async function partnerIncomingController(req, res, next) {
  try {
    const orders = await listPartnerIncoming(req.user.id);
    res.json({ ok: true, orders });
  } catch (err) { next(err); }
}

export async function acceptOrderController(req, res, next) {
  try {
    const updated = await acceptOrder(req.params.id, req.user.id);
    const io = req.app.get('io');
    io?.of('/orders').to(`user:${updated.customerId}`).emit('order:accepted', updated);
    res.json({ ok: true, order: updated });
  } catch (err) { next(err); }
}

 export async function updateStatusController(req, res, next) {
   try {
     const updated = await updateOrderStatus({
       orderId: req.params.id,
       nextStatus: req.body.status,
       actor: req.user
     });
     const io = req.app.get('io');
     // notify both sides if possible
     io?.of('/orders').to(`user:${updated.customerId}`).emit('order:statusUpdated', updated);
     if (updated.partnerId) io?.of('/orders').to(`user:${updated.partnerId}`).emit('order:statusUpdated', updated);
     res.json({ ok: true, order: updated });
   } catch (err) { next(err); }
 }