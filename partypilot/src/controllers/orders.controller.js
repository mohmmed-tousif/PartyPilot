// src/controllers/orders.controller.js
import { createOrder, listCustomerOrders, acceptOrder } from '../services/order.service.js';
import { emitOrderEvent } from '../sockets/orders.namespace.js';

export async function createOrderController(req, res) {
  try {
    const order = await createOrder(req.user?.id || req.user?._id, req.body);
    const io = req.app.get('io');
    emitOrderEvent(io, order, 'order:created');
    res.json({ ok: true, order });
  } catch (err) {
    console.error('createOrderController', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

export async function customerOrdersController(req, res) {
  try {
    const orders = await listCustomerOrders(req.user?.id || req.user?._id);
    res.json({ ok: true, orders });
  } catch (err) {
    console.error('customerOrdersController', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

export async function acceptOrderController(req, res) {
  try {
    const updated = await acceptOrder(req.params.id, req.user?.id || req.user?._id);
    const io = req.app.get('io');
    emitOrderEvent(io, updated, 'order:accepted');
    res.json({ ok: true, order: updated });
  } catch (err) {
    console.error('acceptOrderController', err);
    res.status(500).json({ ok: false, message: err.message });
  }
}

export async function cancelOrderController(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ ok: false, message: "Order not found" });
    if (['picked_up','cancelled'].includes(order.status))
      return res.status(400).json({ ok: false, message: "Cannot cancel at this stage" });

    order.status = 'cancelled';
    await order.save();
    return res.json({ ok: true, order });
  } catch (err) {
    console.error("cancelOrderController", err);
    res.status(500).json({ ok: false, message: "Cancel failed" });
  }
}
