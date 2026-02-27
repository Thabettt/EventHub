# 🎫 EventHub

A full-stack event management platform where organizers create events, users discover and book tickets, and admins govern the platform — complete with Stripe payments, Google OAuth, real-time analytics, and Docker-ready deployment.

> **Note:** EventHub was initially developed locally before being uploaded to GitHub. As a full-time student, I typically implement multiple features in focused sessions and commit them together rather than pushing every small change.

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe)](https://stripe.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Deployment](#-docker-deployment)
- [Architecture](#-architecture)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👤 Users

- Browse and search events by category, location, date, and popularity
- Book tickets with real-time availability tracking
- Secure checkout via Stripe payment integration
- View booking history, download tickets, and manage profile
- Google OAuth and email/password authentication
- Password reset via email

### 🎪 Organizers

- Create, edit, and delete events with image uploads (Cloudinary)
- Dashboard with revenue analytics, ticket sales charts, and attendee management
- Track event performance with monthly revenue breakdowns
- View detailed attendee lists and individual booking history

### 🛡️ Admins

- Approve or reject event submissions before they go live
- Platform-wide analytics: users, events, bookings, and revenue
- Manage user accounts — update roles, delete users
- Full oversight of all platform activity

### 🔐 Security

- JWT authentication with HttpOnly cookies (no tokens in localStorage)
- Silent token refresh with automatic retry queue
- Role-based access control across all routes
- Rate limiting, Helmet security headers, and payload size limits
- Graceful shutdown handling for clean deployments

---

## 🛠️ Tech Stack

| Layer            | Technology                                                   |
| ---------------- | ------------------------------------------------------------ |
| **Frontend**     | React 19, React Router 7, Tailwind CSS, Framer Motion, Axios |
| **Backend**      | Node.js ≥20, Express.js, Mongoose ODM                        |
| **Database**     | MongoDB Atlas                                                |
| **Payments**     | Stripe (Checkout Sessions + Webhooks)                        |
| **Auth**         | JWT (HttpOnly cookies), Google OAuth 2.0                     |
| **File Uploads** | Cloudinary (via Multer)                                      |
| **Email**        | Nodemailer (SMTP/Gmail)                                      |
| **Logging**      | Winston + Morgan                                             |
| **DevOps**       | Docker, Docker Compose, Nginx, multi-stage builds            |
| **Build Tool**   | Vite 6                                                       |

---

## 📁 Project Structure

```
EventHub/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # Route handlers (auth, events, bookings, payments, etc.)
│   ├── middleware/          # Auth, error handling, file upload, role checks
│   ├── models/             # Mongoose schemas (User, Event, Booking, RefreshToken)
│   ├── routes/             # Express route definitions
│   ├── utils/              # Logger, email sender, helpers
│   ├── server.js           # App entry point
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Footer, Cards, etc.)
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── hooks/          # Custom hooks (useAuth, useDeviceDetection, etc.)
│   │   ├── pages/          # Route pages organized by role
│   │   │   ├── admin/      # Admin dashboard, event approval, user management
│   │   │   ├── auth/       # Login, register, password reset
│   │   │   ├── organizer/  # Organizer dashboard, event CRUD, attendees, analytics
│   │   │   ├── events/     # Event listing, event details
│   │   │   ├── user/       # Profile, tickets
│   │   │   └── bookings/   # Booking success page
│   │   ├── services/       # API service layer (axios instances)
│   │   └── utils/          # Formatting helpers
│   ├── nginx.conf          # Production Nginx config
│   ├── Dockerfile          # Multi-stage build (Node → Nginx)
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 9
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Stripe** account (for payments — [test mode](https://stripe.com/docs/testing) works)
- **Cloudinary** account (for image uploads)
- **Google Cloud** project (for OAuth — [setup guide](https://developers.google.com/identity/sign-in/web/sign-in))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Thabettt/EventHub.git
cd EventHub

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Configure Environment

```bash
# 4. Create .env files from examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 5. Fill in your real values in both .env files
#    (see Environment Variables section below)
```

### Run Locally

```bash
# 6. Start the backend (from /backend)
npm run dev

# 7. Start the frontend (from /frontend — in a separate terminal)
npm run dev
```

The app will be available at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3003/api

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable                | Description                        | Example                                                                                |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `PORT`                  | Server port                        | `3003`                                                                                 |
| `NODE_ENV`              | Environment mode                   | `development`                                                                          |
| `FRONTEND_URL`          | Frontend origin (CORS + redirects) | `http://localhost:5173`                                                                |
| `MONGO_URI`             | MongoDB connection string          | `mongodb://localhost:27017/eventhub`                                                   |
| `JWT_SECRET`            | Secret key for signing JWTs        | (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID             | `xxxxx.apps.googleusercontent.com`                                                     |
| `STRIPE_SECRET_KEY`     | Stripe secret key                  | `sk_test_...`                                                                          |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret      | `whsec_...`                                                                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name              | `your_cloud_name`                                                                      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                 | `123456789`                                                                            |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret              | `abc123...`                                                                            |
| `SMTP_HOST`             | Email SMTP host                    | `smtp.gmail.com`                                                                       |
| `SMTP_PORT`             | Email SMTP port                    | `465`                                                                                  |
| `SMTP_SECURE`           | Use TLS                            | `true`                                                                                 |
| `EMAIL_USERNAME`        | SMTP email address                 | `you@gmail.com`                                                                        |
| `EMAIL_PASSWORD`        | SMTP app-specific password         | `xxxx xxxx xxxx xxxx`                                                                  |

### Frontend (`frontend/.env`)

| Variable                 | Description                           | Example                            |
| ------------------------ | ------------------------------------- | ---------------------------------- |
| `VITE_API_URL`           | Backend API URL (must include `/api`) | `http://localhost:3003/api`        |
| `VITE_GOOGLE_CLIENT_ID`  | Google OAuth client ID                | `xxxxx.apps.googleusercontent.com` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key                | `pk_test_...`                      |

> **How it connects:** The frontend reads `VITE_API_URL` for all API calls. The backend reads `FRONTEND_URL` for CORS and redirect URLs. Change the port on one side → update the corresponding URL on the other. One variable per side, everything follows.

> ⚠️ **Never commit `.env` files.** Only `.env.example` files are tracked in git.

---

## 🐳 Docker Deployment

The project includes production-ready Docker configuration with multi-stage builds and health checks.

### Quick Start

```bash
# 1. Create a root .env file for docker-compose
cp backend/.env.example .env

# 2. Add frontend build-time vars to the same .env
#    VITE_API_URL=https://your-domain.com/api
#    VITE_GOOGLE_CLIENT_ID=your_client_id
#    VITE_STRIPE_PUBLIC_KEY=pk_live_...

# 3. Update FRONTEND_URL for production
#    FRONTEND_URL=https://your-domain.com

# 4. Build and run
docker-compose up --build -d
```

### What Happens

| Service      | Container           | Port   | Description                                |
| ------------ | ------------------- | ------ | ------------------------------------------ |
| **Backend**  | `eventhub-backend`  | `3003` | Express API with health check at `/health` |
| **Frontend** | `eventhub-frontend` | `80`   | Nginx serving the production React build   |

- Frontend waits for backend health check to pass before starting
- Backend auto-restarts on crash (`unless-stopped`)
- Frontend uses multi-stage build: Node.js builds the app → Nginx serves static files
- Nginx handles client-side routing, gzip compression, and security headers

### Production `.env` Values

```env
# Backend
FRONTEND_URL=https://your-domain.com
PORT=3003

# Frontend (build-time — baked into the JS bundle)
VITE_API_URL=https://your-domain.com/api
```

---

## 🏗️ Architecture

### Frontend

- **Component-based** React with functional components and hooks
- **AuthContext** provides global auth state with silent token refresh
- **Service layer** (`services/*.js`) — each domain has its own axios instance
- **Protected routes** with role-based guards (`admin`, `organizer`, `user`)
- **Smooth animations** via Framer Motion and Lenis smooth scrolling

### Backend

- **MVC pattern** — models, controllers, and routes are cleanly separated
- **Middleware chain:** Helmet → Cookie Parser → Rate Limiter → CORS → Morgan → Routes → Error Handler
- **Stripe Webhooks** — raw body parsing before `express.json()` for signature verification
- **Graceful shutdown** — handles `SIGTERM`/`SIGINT`, closes HTTP server and MongoDB connection
- **Centralized error handler** with consistent error response format

### Data Flow

```
Browser → Vite Dev Proxy (/api → :3003) → Express → MongoDB
                                        → Stripe (payments)
                                        → Cloudinary (images)
                                        → Nodemailer (emails)
```

In production, Nginx replaces the Vite proxy and serves the static frontend bundle.

---

## 📡 API Routes

| Method   | Route                                   | Description                       | Auth      |
| -------- | --------------------------------------- | --------------------------------- | --------- |
| `POST`   | `/api/auth/register`                    | Register a new user               | —         |
| `POST`   | `/api/auth/login`                       | Login with email/password         | —         |
| `POST`   | `/api/auth/google`                      | Google OAuth login                | —         |
| `POST`   | `/api/auth/logout`                      | Logout (clears cookies)           | ✅        |
| `POST`   | `/api/auth/refresh`                     | Silent token refresh              | ✅        |
| `POST`   | `/api/auth/forgot-password`             | Send password reset email         | —         |
| `PUT`    | `/api/auth/reset-password/:token`       | Reset password                    | —         |
|          |                                         |                                   |           |
| `GET`    | `/api/events`                           | List events (with filters)        | —         |
| `GET`    | `/api/events/:id`                       | Get event details                 | —         |
| `POST`   | `/api/events`                           | Create event                      | Organizer |
| `PUT`    | `/api/events/:id`                       | Update event                      | Organizer |
| `DELETE` | `/api/events/:id`                       | Delete event                      | Organizer |
| `GET`    | `/api/events/organizer`                 | Get organizer's events            | Organizer |
| `PUT`    | `/api/events/:id/approve`               | Approve event                     | Admin     |
| `PUT`    | `/api/events/:id/reject`                | Reject event                      | Admin     |
|          |                                         |                                   |           |
| `POST`   | `/api/bookings/events/:id`              | Book tickets                      | ✅        |
| `GET`    | `/api/bookings/me`                      | Get user's bookings               | ✅        |
| `GET`    | `/api/bookings/organizer`               | Get organizer's bookings          | Organizer |
|          |                                         |                                   |           |
| `POST`   | `/api/payments/create-checkout-session` | Create Stripe session             | ✅        |
| `POST`   | `/api/payments/webhook`                 | Stripe webhook handler            | —         |
| `GET`    | `/api/payments/session-status`          | Check payment status              | ✅        |
|          |                                         |                                   |           |
| `GET`    | `/api/users/me`                         | Get current user profile          | ✅        |
| `PUT`    | `/api/users/me`                         | Update profile                    | ✅        |
| `PUT`    | `/api/users/me/password`                | Change password                   | ✅        |
| `GET`    | `/api/users`                            | List all users                    | Admin     |
| `PATCH`  | `/api/users/:id/role`                   | Update user role                  | Admin     |
| `DELETE` | `/api/users/:id`                        | Delete user                       | Admin     |
|          |                                         |                                   |           |
| `POST`   | `/api/upload/image`                     | Upload image to Cloudinary        | ✅        |
|          |                                         |                                   |           |
| `GET`    | `/api/admin/dashboard`                  | Admin dashboard stats             | Admin     |
| `GET`    | `/api/admin/analytics/*`                | Platform analytics                | Admin     |
|          |                                         |                                   |           |
| `GET`    | `/health`                               | Health check (for load balancers) | —         |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [ISC License](https://opensource.org/licenses/ISC).
