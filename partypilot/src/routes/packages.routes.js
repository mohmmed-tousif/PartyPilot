import { Router } from 'express';
import { getAllPackages, getOnePackage, createPackage, updatePackage, deletePackage } from '../controllers/packages.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';

const router = Router();

router.get('/', getAllPackages);
router.get('/:slug', getOnePackage);

router.post('/', requireAuth, requireRole('admin'), createPackage);
router.put('/:id', requireAuth, requireRole('admin'), updatePackage);
router.delete('/:id', requireAuth, requireRole('admin'), deletePackage);

router.get("/", async (req, res) => {
  const packages = await Package.find({ isActive: true });
  res.json({ ok: true, packages });
});


export default router;
