# CinePremium - Cinema Booking & Management Monorepo

Welcome to CinePremium! This monorepo contains the frontend client application and monolithic backend server.

## 👥 Seeded User Accounts

The database comes pre-seeded with three default accounts representing the platform's roles:

| Name | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Site Admin** | `admin@example.com` | `password123` | `admin` | Site System Admin. Access to Super Admin Panel to manage all users & edit roles. |
| **Cinema Manager** | `manager@example.com` | `password123` | `cinema_manager` | Cinema Manager. Access to Manager Panel to configure movies, halls, and showtimes. |
| **Regular User** | `user@example.com` | `password123` | `user` | Standard customer account to browse movies, book tickets, and view bookings. |

*Quick Tip: A "Quick Demo Login" widget has been integrated directly into the login screen allowing you to click and auto-fill any of these credentials with a single click.*

## 🚀 Getting Started

### Run both applications concurrently:
1. From the root directory, run:
   ```bash
   npm run dev
   ```
2. The frontend web application will start at `http://localhost:5174` (or `5173`).
3. The backend server will start at `http://localhost:5000`.

### Database Seeding:
*   To seed movies: `npm run seed:movies` (or `node seedMovies.js` inside the `backend` folder)
*   To seed users: `node seedUsers.js` inside the `backend` folder
*   To seed cinema halls: `node seedHalls.js` inside the `backend` folder
*   To seed showtimes: `node seedShowtimes.js` inside the `backend` folder
