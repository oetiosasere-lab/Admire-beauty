# ADMIRE BEAUTY
## Full-Stack Makeup Artist Website & Appointment Booking Platform

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TailwindCSS-F7E7CE?style=flat&logo=react)](./frontend)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-8C7A6B?style=flat&logo=node.js)](./backend)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20%2B%20RLS-3ECF8E?style=flat&logo=supabase)](./backend/supabase_schema.sql)

Admire Beauty is a digital presence and appointment platform built for a professional makeup artist brand. Designed with a luxury aesthetic (Cream, Champagne, Warm Taupe, Nude, and Gold), the platform balances an editorial brand showcase with an appointment booking system, client concierge, and administrative control dashboard.

---

## 🏛 Platform Architecture

The repository is organized into two independent, production-ready projects:

```
Admire beauty/
├── frontend/                     # React + Tailwind CSS client (Vercel)
│   ├── src/
│   │   ├── components/           # Public site sections, booking modal, auth
│   │   ├── context/              # Authentication & session provider
│   │   ├── pages/                # Home, Client Portal, and Admin Dashboard
│   │   └── services/api.js       # Centralized REST client
│   └── README.md
├── backend/                      # Node.js + Express REST API (Render)
│   ├── src/
│   │   ├── config/               # Supabase service-role client & fallback store
│   │   ├── controllers/          # Booking, Services, Availability, Admin
│   │   ├── middleware/           # Auth token & Admin-role guards
│   │   └── services/             # Atomic booking engine & slot calculation
│   ├── supabase_schema.sql       # Complete PostgreSQL schema & RLS policies
│   ├── test_api.js               # End-to-end automated testing script
│   └── README.md
└── README.md                     # Master documentation & deployment guide
```

---

## 💎 Features Overview

### 1. Public Customer Experience
- **Hero & Story:** Editorial typography, headline, brand introduction, and primary CTAs.
- **Dynamic Services:** Birthday Glam, Bridal Makeup, Photoshoot Makeup, and Full Glam with live pricing and duration tags fetched from the backend.
- **Editorial Portfolio:** Category-filtered image gallery (All, Bridal, Glam, Editorial, Evening) with close-up lightbox preview.
- **Authentic About Me:** Warm personal story exploring the artist's childhood journey and lifelong passion for makeup.
- **Studio Inquiries & Socials:** Inquiries form, Instagram gallery preview, studio location in Central London, and hours.

### 2. Appointment Booking System
- **Dynamic Slot Generation:** Calculates open time slots based on service duration, buffer time, weekly business hours, existing bookings, and blocked holidays.
- **Double Booking Prevention:** Validates time intervals to guarantee zero overlap. Rejects conflicts with atomic database checks (`409 Conflict`).
- **Confirmation Screen:** Displays booking reference (`AB-2026-XXXX`), appointment summary, and explicit **Pending Artist Approval** status.

### 3. Customer Accounts & Concierge
- **Client Authentication:** Register, login, and profile access.
- **My Appointments:** Track status (`pending`, `confirmed`, `completed`, `cancelled`) and cancel pending requests.
- **Support Concierge:** Submit support requests and chat in real-time response threads with the artist.

### 4. Comprehensive Business Owner Dashboard (`/admin`)
- **Dashboard Overview:** Live database metrics (Total Bookings, Pending, Confirmed, Completed, Cancelled, Customers, and Service Distribution).
- **Booking Manager:** Search, filter by status/service/date, confirm, cancel, mark completed, reschedule appointments, and write internal notes.
- **Calendar Scheduler:** Month, week, and day schedule visualization.
- **Service Catalog:** Full CRUD control to update prices, descriptions, durations, and active statuses.
- **Availability Management:** Configure daily operating hours, slot duration, buffer times, and block holiday dates.
- **Client Directory:** Search clients, view contact details, and inspect booking history.
- **Support Desk:** Resolve client inquiries and send studio replies.
- **Business Analytics:** Monthly booking volume bar graph, popular services, and payment status note.

---

## 🗄 Supabase Database Setup

The database schema, triggers, and Row Level Security (RLS) policies are provided in [`backend/supabase_schema.sql`](file:///c:/Users/etios/Desktop/Admire%20beauty/backend/supabase_schema.sql).

### Tables:
1. `profiles`: User accounts linked with `auth.users`, storing `full_name`, `email`, `phone`, and `role` (`customer` or `admin`).
2. `services`: Available makeup services with `price`, `duration`, `image_url`, and `is_active`.
3. `availability`: Business hours and buffer configuration by day of week (0 = Sunday ... 6 = Saturday).
4. `blocked_dates`: Studio closures, holidays, and vacations.
5. `bookings`: Appointment records with unique `booking_reference`, foreign keys, appointment date, time intervals, status, and `admin_notes`.
6. `support_tickets`: Client support tickets with status tracking.
7. `support_replies`: Discussion thread replies between client and admin.

### To Apply Database Schema:
1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to **SQL Editor** -> **New query**.
3. Copy the contents of [`backend/supabase_schema.sql`](file:///c:/Users/etios/Desktop/Admire%20beauty/backend/supabase_schema.sql) and paste them into the query runner.
4. Click **Run**.
5. To promote a user to administrator, run:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

---

## 🔐 Security & Access Control

- **Service Role Key Isolation:** `SUPABASE_SERVICE_ROLE_KEY` is restricted exclusively to the backend. It is **never** bundled or exposed in frontend code.
- **Row Level Security (RLS):** Customers can only read and modify their own bookings and tickets. Admins have system-wide access verified at both the backend route level and database level.
- **Admin Verification:** The backend middleware verifies the JWT and validates `req.user.role === 'admin'`. Role spoofing on the client is completely blocked.
- **Input Sanitization:** All incoming requests are validated with `express-validator`.
- **CORS:** Accepts requests only from approved origins (local development and authorized Vercel production domains).

---

## 🚀 Running Locally

### Step 1: Start Backend Server
```bash
cd backend
npm install
node test_api.js       # Runs 8 end-to-end automated tests
npm run dev            # Starts backend on http://localhost:5000
```

### Step 2: Start Frontend Application
In a new terminal:
```bash
cd frontend
npm install
npm run dev            # Starts frontend on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

> **Instant Demo Access:** The sign-in modal contains quick-access buttons for **Demo Client** and **Demo Admin**, allowing immediate evaluation of both customer and business management features right out of the box!

---

## ☁️ Production Deployment

### 1. Backend on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Point to the repository with **Root Directory**: `backend`.
3. Build Command: `npm install` | Start Command: `node src/server.js`.
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `CORS_ORIGIN`: `https://your-frontend-app.vercel.app`
   - `SUPABASE_URL`: `https://<your-project-id>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<your-supabase-service-role-key>`

### 2. Frontend on Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set Framework Preset to **Vite**.
4. Add environment variable:
   - `VITE_API_BASE_URL`: `https://<your-render-app>.onrender.com/api`
5. Click **Deploy**.
