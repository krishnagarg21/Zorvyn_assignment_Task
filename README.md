# Finance Dashboard — Full-Stack Finance Data Processing & Access Control System

A production-grade full-stack application for financial data processing with role-based access control. Built with Node.js, Express, MongoDB, and React.

## 📋 Project Overview

This system provides a secure, multi-role finance management platform where:

- **Viewers** can browse transactions
- **Analysts** can create/edit transactions and view dashboard analytics
- **Admins** have full control including user management and data deletion

The architecture follows clean separation of concerns: routes → controllers → services → models. All access control is enforced at the middleware layer, not inside business logic. Dashboard analytics use MongoDB aggregation pipelines for efficient server-side computation.

## 🧱 Tech Stack

| Technology | Purpose | Why |
|---|---|---|
| **Node.js + Express** | Backend API server | Industry-standard, non-blocking I/O for API workloads |
| **MongoDB + Mongoose** | Database & ODM | Flexible schema for financial records, powerful aggregation pipeline |
| **JWT (jsonwebtoken)** | Authentication | Stateless auth, ideal for API-first architecture |
| **bcryptjs** | Password hashing | Proven, timing-safe password hashing with configurable salt rounds |
| **express-validator** | Input validation | Declarative validation chains with clean error formatting |
| **React + Vite** | Frontend SPA | Fast HMR, modern build tooling, component-based UI |
| **Recharts** | Data visualization | Lightweight, React-native charting for financial trends |
| **helmet + cors** | Security | HTTP security headers and controlled cross-origin access |

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+ 
- MongoDB running locally on `mongodb://localhost:27017` (or a remote URI)
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd finance-dashboard

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

Default `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Seed the Database

```bash
cd backend
npm run seed
# or: node src/seed.js
```

This creates 3 test users and 30 sample transactions.

### 4. Run the Application

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# → http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | admin@finance.com | admin123 |
| **ANALYST** | analyst@finance.com | analyst123 |
| **VIEWER** | viewer@finance.com | viewer123 |

## 📡 API Endpoints

### Authentication
| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | `/api/auth/register` | No | — | Register new user (default: VIEWER) |
| POST | `/api/auth/login` | No | — | Login, returns JWT |
| POST | `/api/auth/logout` | Yes | Any | Logout (client clears token) |

### User Management
| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| GET | `/api/users/me` | Yes | Any | Get own profile |
| GET | `/api/users` | Yes | ADMIN | List all users (paginated) |
| GET | `/api/users/:id` | Yes | ADMIN | Get single user |
| POST | `/api/users` | Yes | ADMIN | Create user with role |
| PATCH | `/api/users/:id` | Yes | ADMIN | Update user role/status |
| DELETE | `/api/users/:id` | Yes | ADMIN | Deactivate user |

### Transactions
| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| GET | `/api/transactions` | Yes | Any | List transactions (filtered + paginated) |
| GET | `/api/transactions/:id` | Yes | Any | Get single transaction |
| POST | `/api/transactions` | Yes | ANALYST, ADMIN | Create transaction |
| PATCH | `/api/transactions/:id` | Yes | ANALYST, ADMIN | Update transaction |
| DELETE | `/api/transactions/:id` | Yes | ADMIN | Soft delete transaction |

**Query Parameters for GET `/api/transactions`:**
- `?type=income|expense`
- `?category=food`
- `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `?page=1&limit=10`
- `?includeDeleted=true` (Admin only)

### Dashboard
| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| GET | `/api/dashboard/summary` | Yes | ANALYST, ADMIN | Income/expense/balance totals |
| GET | `/api/dashboard/category-breakdown` | Yes | ANALYST, ADMIN | Per-category breakdown |
| GET | `/api/dashboard/monthly-trend?year=2025` | Yes | ANALYST, ADMIN | Monthly income vs expense |
| GET | `/api/dashboard/recent-activity?limit=5` | Yes | ANALYST, ADMIN | Recent transactions |

## 🛡️ Role System

### Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| View transactions | ✅ | ✅ | ✅ |
| Create/Edit transactions | ❌ | ✅ | ✅ |
| Delete transactions | ❌ | ❌ | ✅ |
| View dashboard summaries | ❌ | ✅ | ✅ |
| View user list | ❌ | ❌ | ✅ |
| Create/Edit/Deactivate users | ❌ | ❌ | ✅ |

### How It Works

1. **`auth.middleware.js`** verifies the JWT token and attaches `req.user` (with `userId`, `email`, `role`, `name`)
2. **`role.middleware.js`** exports an `authorizeRoles(...roles)` factory that returns middleware checking if `req.user.role` is in the allowed list
3. **Routes** compose these middlewares: `authenticate → authorizeRoles('ADMIN') → controller`
4. **Controllers** never check roles — this is purely a middleware concern

## 📄 API Response Format

All responses use a consistent envelope:

```json
// Success
{
  "success": true,
  "message": "Transactions fetched",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 30, "totalPages": 3 }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

## 🏗️ Architecture Decisions

### Separation of Concerns
- **Routes** → only wire middleware + controller (no logic)
- **Controllers** → extract request data, call services, format responses
- **Services** → contain all business logic, call models
- **Models** → define schema, data-level validation, instance methods

### Soft Delete Pattern
- Transactions use `isDeleted: true` instead of physical deletion
- All listings and aggregations filter out soft-deleted records by default
- Only Admin can see deleted records with `?includeDeleted=true`

### Error Handling
- Custom `asyncHandler` wraps all async routes to forward errors to the global handler
- Services throw errors with `statusCode` for known error cases
- Global error handler catches Mongoose validation errors, duplicate keys, bad ObjectIds, and unknown errors
- No raw error objects ever leak to the client

## ⚠️ Assumptions Made

1. JWT logout is client-side (token removal). A production system would use Redis-backed token blacklisting
2. Users can self-register but always get the VIEWER role. Only Admins can assign higher roles
3. Soft-deleted transactions are hidden from all dashboard aggregations
4. Date filtering uses inclusive ranges (startDate ≤ date ≤ endDate)
5. Currency is displayed in INR (₹) in the frontend but stored as raw numbers in the DB

## 🔍 Known Limitations / Tradeoffs

1. **No refresh token pattern** — Using single JWT with 7-day expiry. A production system should implement refresh tokens with shorter access token lifetimes
2. **No rate limiting** — Should add `express-rate-limit` for login/register endpoints
3. **No file upload** — Receipt/invoice attachment not implemented
4. **No audit logging** — Changes to users/transactions aren't logged to an audit trail
5. **No test suite** — Unit and integration tests would be expected in a production codebase
6. **Client-side token storage** — JWT stored in localStorage (vulnerable to XSS). HttpOnly cookies would be more secure

## 📁 Project Structure

```
finance-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── constants/roles.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   └── Transaction.model.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── transaction.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── transaction.service.js
│   │   │   └── dashboard.service.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── user.validator.js
│   │   │   └── transaction.validator.js
│   │   ├── utils/
│   │   │   ├── apiResponse.js
│   │   │   └── asyncHandler.js
│   │   ├── seed.js
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── transactions.js
│   │   │   └── dashboard.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── Users.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## License

ISC
