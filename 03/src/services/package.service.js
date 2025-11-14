import Package from '../models/Package.js';

export function listPackages() { return Package.find({ isActive: true }).sort({ createdAt: -1 }); }
export function getPackageBySlug(slug) { return Package.findOne({ slug, isActive: true }); }
export function adminCreatePackage(data) { return Package.create(data); }
export function adminUpdatePackage(id, data) { return Package.findByIdAndUpdate(id, data, { new: true }); }
export function adminDeletePackage(id) { return Package.findByIdAndDelete(id); }
