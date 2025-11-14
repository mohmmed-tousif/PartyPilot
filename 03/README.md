## Run

1. `cp .env.example .env` and fill `MONGO_URI` & `JWT_SECRET`
2. `npm install`
3. (optional) start MongoDB locally or via Docker:
   - `docker run -d --name mongo -p 27017:27017 mongo`
4. `npm run seed` (creates admin/partner + packages)
5. `npm run dev`
6. Open http://localhost:3000

## Default seeded users

- Partner: partner@example.com / partner123
- Admin: admin@example.com / admin123

## API quick links

- GET `/health`
- GET `/api/packages`
- POST `/api/auth/customer/request-otp`
- POST `/api/auth/customer/verify-otp`
- POST `/api/auth/partner/login`
- POST `/api/auth/admin/login`
- POST `/api/orders` (JWT)
- POST `/api/orders/:id/accept` (JWT Partner)
- POST `/api/orders/:id/status` (role-restricted)
- GET `/api/admin/revenue` (JWT Admin)

## Status rules

- received → accepted → partner_reached → setup_complete → ready_for_pickup → picked_up
- received → declined
- received|accepted → cancelled (admin only – TODO gate if needed)

## Security

- helmet, hpp, cors, compression enabled
- JWT in Authorization header (Bearer)
- Request validation via express-validator (example for orders)

## Notes

- OTP is logged to console (stub). Replace email stub when ready.
