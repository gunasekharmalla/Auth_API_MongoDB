                                                                    Auth API with MongoDB Atlas

A production-hardened authentication and user management API built with Node.js, Express, JWT, and MongoDB Atlas.
Supports user registration, login, role-based authorization, admin user management, and a full forgot/reset password flow with email delivery via SendGrid.

Deployed live on Render:
          LIVE LINK:  https://auth-api-mongodb.onrender.com

🚀 Features

- User signup & login with password hashing (bcrypt, 10 salt rounds).
- JWT authentication via middleware (`Authorization: Bearer <token>`).
- Role-based authorization (`user` / `admin`) — new registrations are always created as `user`; admin accounts must be provisioned directly in the database, not through the public API.
- Server-side input validation on every route (Zod) — malformed requests get a structured `400` with field-level error details, never a silent failure or a generic crash.
- Centralized error handling — all uncaught/thrown errors flow through a single error-handling middleware, which respects a `statuscode` set on the error (e.g. an expired reset token correctly returns `400`, not a generic `500`).
- Forgot-password / reset-password flow via a signed, time-limited JWT reset token emailed through SendGrid — deliberately does **not** require an active login session (see Security section for why).
- MongoDB Atlas for data storage (Mongoose ODM).
- Environment-based configuration — no secrets committed to the repo.

🛠️ Tech Stack

- Node.js + Express 5
- MongoDB Atlas (Mongoose)
- JWT (`jsonwebtoken`)
- Zod (request validation)
- bcrypt (password hashing)
- nodemailer + nodemailer-sendgrid-transport (password reset emails)
- dotenv (environment config)

📂 Project Structure
```
.
├── dbschema/            # Mongoose schemas (User)
├── middleware/          # Auth.js (JWT verification), RoleAuth.js (role gating)
├── routes/              # route.js — all API endpoints
├── validation/          # Zod schemas (validation.js, loginschema.js)
├── server.js            # Entry point — Express app, DB connection, error handler
├── .env                 # Environment variables (not committed)
└── package.json
```

⚙️ Installation & Setup

Clone the repo:
```
git clone https://github.com/gunasekharmalla/Auth_API_MongoDB.git
cd Auth_API_MongoDB
```

Install dependencies:
```
npm install
```

Create a `.env` file in the project root:
```
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
JWT_SECRET=yourSecretKey
SENDGRID_API_KEY=your-sendgrid-api-key
```
> Note: the app currently listens on a fixed port (5000) — `PORT` is not yet read from the environment.

Run locally:
```
npm start
```
API runs at `http://localhost:5000`.

🔑 API Endpoints

**Auth**

`POST /register` — register a new user. Always created with role `user`.
```json
{
  "name": "sample",
  "email": "sample@example.com",
  "password": "pass123"
}
```
Validation errors return `400` with `{ message, error: [...] }` (Zod issue details).

`POST /login` — authenticate and receive a JWT (1h expiry).
```json
{
  "email": "sample@example.com",
  "password": "pass123"
}
```
Returns `404` for an unknown email or an incorrect password (no distinction is currently made between the two in the response — see Security notes).

**User Routes** *(require `Authorization: Bearer <token>`)*

`GET /profile` — get the logged-in user's own profile.

`GET /users` — list all users, passwords excluded. **Admin only.**

`DELETE /users/:email` — delete a user by email. **Admin only.**

**Password Recovery** *(no `Authorization` header required — see Security notes)*

`POST /forgot-password` — request a reset link.
```json
{ "email": "sample@example.com" }
```
Looks up the user, generates a short-lived (2h) JWT reset token, and emails a reset link via SendGrid. Always validate the email exists before this returns success — no email enumeration protection is implemented yet.

`POST /reset-password/:token` — complete the reset. Token comes from the URL (the emailed link), new password in the body.
```json
{ "password": "newpass123" }
```
An invalid or expired token correctly returns `400`, not a `500`.

🔒 Security

- Passwords hashed with bcrypt before storage — plaintext is never persisted.
- JWTs signed with a server-side secret (`JWT_SECRET`); session tokens expire in 1h, reset tokens in 2h.
- Role-based middleware (`RoleAuth`) restricts `/users` and `DELETE /users/:email` to admins.
- `/forgot-password` and `/reset-password/:token` deliberately skip session (`Authorization`) authentication: a user who forgot their password can't have a valid session in the first place. Instead, the signed reset token itself — proof of access to the emailed link — is the credential for that one action.
- All request bodies/params are validated with Zod before touching business logic or the database.
- `.env` is git-ignored; no credentials are committed.

**Known gaps (being worked through, tracked honestly rather than hidden):**
- No rate limiting yet — auth endpoints are not yet protected against brute-force/credential-stuffing attempts.
- No `helmet` security headers yet.
- `/login` and `/forgot-password` don't yet mask user-enumeration (different code paths are inferable from response codes/timing).
- No automated tests yet.
- Logging is currently `console.log`, not structured.

🌱 Development Workflow

This project follows a two-branch model:
- `main` — always stable, deployable code.
- `development` — active work; changes are tested here before merging into `main`.

Each improvement (validation, error handling, security hardening, etc.) is developed and verified on `development`, then merged into `main` via pull request once confirmed working.
