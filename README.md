# EventHub



A full-stack event management platform for organizing events and booking tickets. Built with React, Node.js, and MongoDB.

## Development Note

EventHub was initially developed locally before being uploaded to GitHub. As a full-time student, I typically implement multiple features in focused sessions and commit them together rather than pushing every small change. The project has continued to evolve with improvements, feature additions, and optimizations since its first upload.


[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## Overview

EventHub enables event organizers to create and manage events while users discover and book tickets. The platform features role-based dashboards for admins, organizers, and regular users, with real-time booking management and analytics.

**Key Features:**
- Role-based access control (Admin, Organizer, User)
- Event CRUD operations with image uploads
- Ticket booking system with availability tracking
- Revenue analytics and attendee management
- Responsive design with mobile/desktop layouts
- JWT authentication with token blacklisting

## Tech Stack

**Frontend:**
- React with React Router
- Tailwind CSS for styling
- Vite for build tooling
- Axios for API calls

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads

## Features by Role

### Users
- Browse and search events by category, location, and date
- Book tickets with real-time availability updates
- View booking history and manage profile
- Receive booking confirmations

### Organizers
- Create and manage events with detailed information
- Track ticket sales and revenue through dashboard
- View attendee lists and booking details
- Monitor event performance with analytics charts

### Admins
- Review and approve event submissions
- Monitor platform analytics (users, events, bookings, revenue)
- Manage user accounts and permissions

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Thabettt/EventHub.git
cd EventHub
```

**2. Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**3. Configure environment variables**

Create a `.env` file in the backend directory:

Backend `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eventhub
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**4. Start the development servers**
```bash
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`


## Architecture

**Frontend Architecture:**
- Component-based React structure
- Custom hooks for API integration (`useAuth`, `useDeviceDetection`)
- Service layer for API calls (`authService`, `eventService`, `bookingService`)
- Context API for global state management
- Protected routes for role-based access

**Backend Architecture:**
- MVC pattern with Express.js
- Mongoose models for data schemas
- JWT middleware for authentication
- Role-based authorization
- Centralized error handling

## Key Technologies Explained

**Why Vite?** Fast HMR, optimized builds, and modern dev experience

**Why Tailwind?** Utility-first approach enables rapid UI development and consistent theming

**Why JWT?** Stateless authentication suitable for SPA architecture

**Why MongoDB?** Flexible schema for event data and fast read operations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
