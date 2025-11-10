export const ORDER_FLOW = [
  'received',
  'accepted',
  'partner_reached',
  'setup_complete',
  'ready_for_pickup',
  'picked_up'
];

export const ALLOWED = {
  received: ['accepted', 'declined', 'cancelled'],
  accepted: ['partner_reached', 'cancelled'],
  partner_reached: ['setup_complete', 'cancelled'],
  setup_complete: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['picked_up', 'cancelled']
  // picked_up, declined, cancelled are terminals
};

export function canTransition(from, to) {
  const nexts = ALLOWED[from] || [];
  return nexts.includes(to);
}
