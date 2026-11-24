# Admire Beauty — Backend REST API

This is the Node.js and Express REST API backend for **Admire Beauty**, responsible for business logic, booking management, atomic slot availability calculation, double-booking prevention, support tickets, and Supabase database interactions with Row Level Security (RLS).

---

## 🚀 Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4.x
- **Database & Auth:** Supabase PostgreSQL & Supabase Auth
- **Security:** Helmet, CORS origin restriction, Express-Validator, Express-Rate-Limit
- **Logging:** Morgan
- **Hosting Target:** Render (Web Service)

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client & fallback mock store
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe, logout
│   │   ├── servicesController.js # Public service listings
│   │   ├── bookingsController.js # Booking creation, my bookings, cancellations
│   │   ├── availabilityController.js # Working schedule & dynamic slot engine
│   │   ├── supportController.js  # Support ticket creation & thread replies
│   │   └── adminController.js    # Comprehensive business dashboard operations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & admin role guard
│   │   ├── validator.js          # Request payload sanitization
│   │   └── errorHandler.js       # Centralized error & 404 handlers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── servicesRoutes.js
│   │   ├── bookingsRoutes.js
│   │   ├── availabilityRoutes.js
│   │   ├── supportRoutes.js
│   │   └── adminRoutes.js
│   └── server.js                 # Express app initialization & server startup
├── supabase_schema.sql           # Complete SQL schema, triggers, and RLS policies
├── test_api.js                   # Automated test suite (8 end-to-end tests)
├── package.json
└── .env.example
```

---

## 🔒 Security Architecture

1. **Service Role Key Isolation:** The Supabase `SUPABASE_SERVICE_ROLE_KEY` is maintained **only** within this backend environment. It is never exposed to the frontend.
2. **Admin Authorization Guard:** Administrative endpoints (`/api/admin/*`) require both a valid token (`requireAuth`) and role verification against the database (`requireAdmin`).
3. **Double Booking Prevention:** The booking service checks existing reservations on the requested appointment date and validates time intervals `[startTime, endTime)` to guarantee that no conflicting slots can be booked.
4. **CORS:** Accepts requests only from authorized frontend origins (e.g., local dev port 5173 and Vercel domains).

---

## 📋 Environment Variables

Create a `.env` file in `backend/` with the following variables:

```env
PORT=5000
NODE_ENV=development

# Allowed CORS origins (comma-separated for multiple domains)
CORS_ORIGIN=http://localhost:5173,https://admirebeauty.vercel.app

# Supabase Credentials (from Supabase Dashboard -> Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
```

*Note: If `SUPABASE_URL` is omitted during local development, the backend automatically operates in fallback demo store mode, allowing full functionality and instant testing.*

---

## 🛠 Local Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
node test_api.js

# 3. Start development server with live reload
npm run dev

# 4. Start production server
npm start
```

---

## 🌐 API Endpoint Reference

### Public & Authentication
- `GET /api/health` — Health check endpoint
- `POST /api/auth/register` — Register customer account
- `POST /api/auth/login` — Sign in (customer or admin)
- `POST /api/auth/logout` — End session
- `GET /api/auth/me` — Authenticated profile (requires Bearer token)

### Services & Availability
- `GET /api/services` — List active makeup services
- `GET /api/services/:id` — Service details
- `GET /api/availability` — Weekly hours overview or dynamic date slots (`?date=YYYY-MM-DD&serviceId=...`)
- `GET /api/availability/blocked-dates` — List of studio closures and holidays

### Bookings
- `POST /api/bookings` — Create a new appointment (atomic conflict check)
- `GET /api/bookings/my-bookings` — Customer view own appointments
- `GET /api/bookings/:id` — Single booking details
- `PATCH /api/bookings/:id/cancel` — Customer cancel own pending request

### Support Concierge
- `POST /api/support/tickets` — Submit support ticket
- `GET /api/support/tickets` — Client view their tickets
- `GET /api/support/tickets/:id` — View ticket thread
- `POST /api/support/tickets/:id/replies` — Post message reply

### Admin (Requires `admin` role)
- `GET /api/admin/dashboard` — Live business stats, upcoming, recent activity
- `GET /api/admin/bookings` — Search, filter, and list all bookings
- `PATCH /api/admin/bookings/:id` — Confirm, cancel, complete, reschedule, admin notes
- `GET /api/admin/customers` — Customer directory & booking history
- `GET /api/admin/services` — Full service catalog (including inactive)
- `POST /api/admin/services` — Create new makeup service
- `PATCH /api/admin/services/:id` — Update service rate, duration, details, status
- `DELETE /api/admin/services/:id` — Archive service
- `GET /api/admin/availability` — View schedule and blocked dates
- `POST /api/admin/availability` — Update weekly working hours & buffer times
- `POST /api/admin/blocked-dates` — Add blocked holiday date
- `DELETE /api/admin/blocked-dates/:id` — Remove blocked date
- `GET /api/admin/support/tickets` — Manage customer support tickets
- `PATCH /api/admin/support/tickets/:id` — Update ticket status
- `GET /api/admin/analytics` — Monthly trends, popular services, status breakdown

---

## ☁️ Deployment to Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set the **Root Directory** to `backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node src/server.js`.
5. Add the environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`
   - `SUPABASE_URL=https://<project-id>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<your-secret-service-role-key>`
6. Deploy! Render will provide your public backend URL (e.g., `https://admire-beauty-api.onrender.com`).
