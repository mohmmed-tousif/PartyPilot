import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Package from '../models/Package.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON manually (cross-compatible method)
const usersJsonPath = path.join(__dirname, 'data', 'users.json');
const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
const packagesJsonPath = path.join(__dirname, 'data', 'packages.json');
const packagesData = JSON.parse(fs.readFileSync(packagesJsonPath, 'utf-8'));


await connectDB();

// Clear old data (optional but usually desired)
await User.deleteMany({});
await Package.deleteMany({});

// Insert seed users
for (const u of usersData) {
  await User.create({
    role: u.role,
    email: u.email,
    passwordHash: await bcrypt.hash(u.password, 10),
    isVerified: true
  });
}
await Package.insertMany(packagesData);
console.log('✅ Seed complete');
process.exit();
