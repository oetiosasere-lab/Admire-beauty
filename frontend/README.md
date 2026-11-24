# Admire Beauty — Luxury Frontend Web Application

The responsive, editorial React client application for **Admire Beauty** — a luxury makeup artist brand and appointment booking platform.

---

## ✨ Design Direction & Aesthetic

- **Palette:** Cream (`#FAF7F2`), Champagne (`#F7E7CE`), Warm Taupe (`#8C7A6B`), Soft Beige, Rich Espresso (`#1A1615`), and Gold accents (`#C5934C`).
- **Typography:**
  - Headings: Serif elegance (`Cormorant Garamond` & `Playfair Display`).
  - Interface & Body: Clean modern sans-serif (`Plus Jakarta Sans`).
- **Experience:** Feminine, editorial, minimal, and warm. Designed to evoke high-end beauty houses rather than generic booking templates.

---

## 🚀 Key Features

1. **Public Website:**
   - **Hero Section:** Editorial imagery, luxury headline, brand introduction, and primary "Book Your Appointment" and "Explore My Work" CTAs.
   - **Services Showcase:** Birthday Glam, Bridal Makeup, Photoshoot Makeup, Full Glam with dynamic starting prices, duration tags, and booking hooks.
   - **Visual Portfolio:** Image gallery with category filtering (All, Bridal, Glam, Editorial, Evening) and full-screen close-up lightbox.
   - **Authentic About Me Story:** Personal story tracing the artist's childhood journey into makeup passion.
   - **Contact & Inquiries:** Inquiry form, Instagram feed preview, studio details, and direct contact.

2. **Booking Wizard:**
   - Step 1: Service selection.
   - Step 2: Date selection with disabled blocked dates, followed by dynamic calculation of available slots.
   - Step 3: Contact information (guest or authenticated customer).
   - Step 4: Confirmation screen showing reference code (`AB-2026-XXXX`), appointment summary, and explicit **PENDING ARTIST CONFIRMATION** status.

3. **Customer Portal (`/account`):**
   - View upcoming and historical appointments.
   - Status indicators (Pending, Confirmed, Completed, Cancelled).
   - Cancel pending appointments.
   - Support Helpdesk: create support tickets and converse directly with the studio.

4. **Executive Admin Dashboard (`/admin`):**
   - **Role Guard:** Accessible only to authenticated users with `role: admin`.
   - **Overview:** Real-time business statistics, service breakdown, upcoming appointments, and recent activity log.
   - **Bookings Management:** Search, status filters, confirm/complete/cancel buttons, reschedule modal, and internal notes.
   - **Calendar View:** Month, week, and day scheduling visualization.
   - **Services Catalog:** Add, edit descriptions, adjust prices/durations, and toggle active states.
   - **Availability Management:** Set weekly opening hours, buffer times, and block holiday dates.
   - **Client Directory:** Search client profiles and booking history.
   - **Support Desk:** Reply to customer tickets and manage ticket statuses.
   - **Analytics:** Monthly booking trends and service popularity.

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.jsx        # Login, registration & quick demo switch
│   │   ├── booking/
│   │   │   └── BookingModal.jsx     # 4-step booking wizard & confirmation screen
│   │   ├── common/
│   │   │   ├── Modal.jsx
│   │   │   └── Notification.jsx
│   │   ├── home/
│   │   │   ├── HeroSection.jsx
│   │   │   ├── ServicesSection.jsx
│   │   │   ├── PortfolioSection.jsx
│   │   │   ├── AboutSection.jsx
│   │   │   └── ContactSection.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx           # Sticky luxury nav with mobile drawer
│   │       └── Footer.jsx
│   ├── context/
│   │   └── AuthContext.jsx          # Session state, login, register, role checks
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx      # Admin sidebar, guard, and frame
│   │   │   ├── AdminOverview.jsx    # Live stats cards & charts
│   │   │   ├── AdminBookings.jsx    # Filterable booking tables & actions
│   │   │   ├── AdminCalendar.jsx    # Month / week / day schedule
│   │   │   ├── AdminServices.jsx    # CRUD service manager
│   │   │   ├── AdminAvailability.jsx# Weekly hours & holiday dates
│   │   │   ├── AdminCustomers.jsx   # Client directory
│   │   │   ├── AdminSupport.jsx     # Support ticket helpdesk
│   │   │   ├── AdminAnalytics.jsx   # Business volume & popular services
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── CustomerDashboard.jsx    # Client portal: appointments & support
│   │   └── HomePage.jsx             # Public landing page
│   ├── services/
│   │   └── api.js                   # Unified REST client with auth headers
│   ├── App.jsx
│   ├── index.css                    # Tailwind + luxury fonts & scrollbar
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env.example
```

---

## 🛠 Local Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Production build
npm run build
```

---

## 📋 Environment Configuration

Create a `.env` file in `frontend/`:

```env
# Backend REST API endpoint (In production, your Render URL)
VITE_API_BASE_URL=http://localhost:5000/api

# Optional: Supabase client-side config (Anon/Publishable key only)
# Note: NEVER expose the service-role key in frontend!
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

---

## ☁️ Deployment to Vercel

1. Push your code to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Add the Environment Variable:
   - `VITE_API_BASE_URL`: `https://admire-beauty-api.onrender.com/api` (your backend Render URL).
6. Click **Deploy**.
