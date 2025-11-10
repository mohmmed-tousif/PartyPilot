import { body } from 'express-validator';

export const createOrderRules = [
  body('items').isArray({ min: 1 }),
  body('items.*.packageId').isString(),
  body('items.*.qty').optional().isInt({ min: 1 }),
  body('payPercent').isInt({ min: 25, max: 100 })
];
