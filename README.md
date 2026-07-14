# Clodfare — Server (API)

Express + MongoDB (Mongoose) backend for the Clodfare crowdfunding platform.

## Setup
```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Environment Variables
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clodfare
ACCESS_TOKEN_SECRET=your_long_random_secret
IMGIBB_API_KEY=your_imgbb_key
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@clodfare.com
ADMIN_PASSWORD=Admin@123
```

## API Endpoints
- `POST /api/auth/register|login|google-login`, `GET /api/auth/me`
- `GET|DELETE|PATCH /api/users[/...]`, `GET /api/users/admin/stats`
- `GET|POST|PATCH|DELETE /api/campaigns[/...]`, admin approve/reject/suspend
- `POST|GET /api/contributions[/...]`, creator approve/reject
- `GET|POST /api/withdrawals[/...]`, admin approve
- `GET|PATCH /api/notifications[/...]`
- `POST|GET /api/payments[/...]`
- `POST|GET|PATCH /api/reports[/...]`
- `POST /api/upload` (imgBB)

Auth uses `Authorization: Bearer <token>` headers.
Role-based middleware restricts Creator/Admin routes.
