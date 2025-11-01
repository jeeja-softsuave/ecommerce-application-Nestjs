# Nest E-commerce Backend (Scaffold)

Features:
- JWT-based authentication (register / login)
- Role-based authorization (admin / user)
- Products CRUD (admin) and listing/search (user)
- Orders (purchase) and notifications (email + SMS placeholder)
- TypeORM + MySQL

## Quick start

1. copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run start:dev`

## Example env vars (.env.example provided)

- DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
- JWT_SECRET, JWT_EXPIRES_IN
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
- SMS_PROVIDER_API_KEY, SMS_FROM

## Example curl flows

Register user:
```
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123","role":"user"}'
```

Login:
```
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123"}'
```

Create product (admin token):
```
curl -X POST http://localhost:3000/products -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"title":"Sample","description":"x","price":1999}'
```

Purchase (create order):
```
curl -X POST http://localhost:3000/orders -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"productId":1,"quantity":1}'
```

Notifications will attempt to send email via nodemailer and SMS via a provider placeholder.

