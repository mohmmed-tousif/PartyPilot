import { listPackages, getPackageBySlug, adminCreatePackage, adminUpdatePackage, adminDeletePackage } from '../services/package.service.js';

export async function getAllPackages(_req, res, next) {
  try { res.json({ ok: true, packages: await listPackages() }); } catch (e) { next(e); }
}
export async function getOnePackage(req, res, next) {
  try {
    const pkg = await getPackageBySlug(req.params.slug);
    if (!pkg) return res.status(404).json({ ok: false, message: 'Not found' });
    res.json({ ok: true, package: pkg });
  } catch (e) { next(e); }
}
export async function createPackage(req, res, next) {
  try { res.json({ ok: true, package: await adminCreatePackage(req.body) }); } catch (e) { next(e); }
}
export async function updatePackage(req, res, next) {
  try { res.json({ ok: true, package: await adminUpdatePackage(req.params.id, req.body) }); } catch (e) { next(e); }
}
export async function deletePackage(req, res, next) {
  try { await adminDeletePackage(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
}
