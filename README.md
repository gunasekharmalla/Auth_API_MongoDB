                                                                    Auth API with MongoDB Atlas

A simple authentication and user management API built with Node.js, Express, JWT, and MongoDB Atlas.
It supports user registration, login, Forgot-password, Password-reset, JWT-based authentication, role-based authorization, and CRUD operations.

Deployed live on Render:
          LIVE LINK:  https://auth-api-mongodb.onrender.com

🚀 Features

User Signup & Login with password hashing (bcrypt).
JWT Authentication with middleware.
Role-based Authorization (user / admin).
Password reset (user / admin).
MongoDB Atlas for database (cloud-hosted).
Environment variables for secrets and configs.


🛠️ Tech Stack

Node.js + Express.js
MongoDB Atlas (Mongoose ODM)
JWT (jsonwebtoken)
Password reset with nodemailer
bcryptjs for password hashing
dotenv for environment config

📂 Project Structure
├── src/
│   ├── dbschema/        # Mongoose schemas
│   ├── middlewares/   # Auth & role middlewares
│   |-- routes/        # end points (register, login..)
│   └── server.js         # Entry point
├── .env               # Environment variables
├── package.json
└── README.md

⚙️ Installation & Setup

Clone the repo:

git clone https://github.com/your-username/auth-api-mongodb.git
cd auth-api-mongodb

Install dependencies:

npm install (all libraries used in package.json)
Create a .env file in root:
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/test
JWT_SECRET=yourSecretKey
JWT_EMAIL_USER = from mail to send reset link
JWT_EMAIL_PASS = your 16digit google gmail app password

Run locally:

npm start
API runs at http://localhost:5000.


🔑 API Endpoints
Auth

(→ Register new user with name, email, password, role)

POST /signup
{
  "name": "sample",
  "email": "sample@example.com",
  "password": "pass123",
  "role": "user"
}

→ Login and get JWT

POST /login 
{
  "email": "sample@example.com",
  "password": "pass123"
}

User Routes

GET /profile → Get logged-in user’s profile
(Requires Authorization: Bearer <token>)

GET /users → Get all users (admin only)
(Requires Authorization: Bearer <token>)

DELETE /users/:email → Delete user by email (admin only)

POST /forgot-password -> (user / admin)  get token 

POST /reset-password  -> verify token and give new password via req.body

🔒 Security

Passwords are hashed with bcrypt.
Tokens generated with JWT.
Role-based middleware ensures only admins can access /users & delete routes.




===================================================
