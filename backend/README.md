# Express.js Monolithic Architecture Backend

A production-ready, clean, modular monolithic backend structure built with **Node.js**, **Express.js**, and modern **ES Modules (`import`/`export`)**.

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/              # Application configurations & DB settings
│   │   ├── db.js            # Database connection handler
│   │   └── env.js           # Environment variables configuration
│   ├── controllers/         # Request handling & HTTP response layer
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── middlewares/         # Custom Express middlewares
│   │   ├── auth.middleware.js # JWT / authentication guard
│   │   └── error.middleware.js# Global error handling middleware
│   ├── models/              # Data access models / DB entities
│   │   └── user.model.js
│   ├── routes/              # Express route definitions
│   │   ├── auth.routes.js   # /api/v1/auth routes
│   │   ├── health.routes.js # /api/v1/health status
│   │   ├── user.routes.js   # /api/v1/users routes
│   │   └── index.js         # Main API router aggregator
│   ├── services/            # Core business logic layer
│   │   ├── auth.service.js
│   │   └── user.service.js
│   ├── utils/               # Helper utilities & helpers
│   │   ├── apiError.js      # Custom error class
│   │   ├── apiResponse.js   # Standardized JSON response wrapper
│   │   └── asyncHandler.js  # Async error catching wrapper
│   ├── app.js               # Express application initialization & middleware setup
│   └── server.js            # Server entry point & process listeners
├── .env                     # Local environment variables
├── .env.example             # Template for environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Package manifest & scripts
└── README.md                # Documentation
```

---

## 🏛️ Architecture Overview (Layered Monolith)

This template follows the **Controller - Service - Model (Repository)** pattern for monolithic applications:

1. **Routes (`src/routes/`)**: Define HTTP verbs, endpoints, and attach middlewares (auth, validation).
2. **Controllers (`src/controllers/`)**: Extract request params/body/query, invoke business services, and return standardized HTTP responses (`ApiResponse`).
3. **Services (`src/services/`)**: Contain core business logic, validations, and domain rules. Decoupled from HTTP requests/responses.
4. **Models (`src/models/`)**: Abstract database persistence (Mongoose, Prisma, Sequelize, etc.).
5. **Middlewares (`src/middlewares/`)**: Centralized authorization, logging, and error handling.
6. **Utils (`src/utils/`)**: Standardized error handling (`ApiError`), standard JSON responses (`ApiResponse`), and async error catching (`asyncHandler`).

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create or verify `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*
DB_URI=mongodb://localhost:27017/my_monolith_db
JWT_SECRET=supersecretjwtkey123
```

### 3. Run Application

* **Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```
* **Production mode:**
  ```bash
  npm start
  ```
* **Seeding users database:**
  ```bash
  node seedUsers.js
  ```

---

## 👥 Seeded User Accounts

The database comes pre-seeded with three default accounts representing the platform's roles:

| Name | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Site Admin** | `admin@example.com` | `password123` | `admin` | Site System Admin. Access to Super Admin Panel to manage all users & edit roles. |
| **Cinema Manager** | `manager@example.com` | `password123` | `cinema_manager` | Cinema Manager. Access to Manager Panel to configure movies, halls, and showtimes. |
| **Regular User** | `user@example.com` | `password123` | `user` | Standard customer account to browse movies, book tickets, and view bookings. |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Server Health Status | No |
| `POST` | `/api/v1/auth/register` | Register new user | No |
| `POST` | `/api/v1/auth/login` | User login | No |
| `GET` | `/api/v1/users` | Get all users | Yes (`Bearer token`) |
| `GET` | `/api/v1/users/:id` | Get user by ID | Yes (`Bearer token`) |
| `POST` | `/api/v1/users` | Create user | Yes (`Bearer token`) |

---

## 📦 Installed Packages

* **express**: Fast, unopinionated web framework for Node.js.
* **dotenv**: Load environment variables from `.env` file.
* **cors**: Enable Cross-Origin Resource Sharing.
* **helmet**: Secure Express app with HTTP headers.
* **morgan**: HTTP request logger middleware.
* **nodemon** *(dev)*: Automatically restart node application on file changes.
