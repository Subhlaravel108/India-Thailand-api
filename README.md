# Tours Backend - Fastify + MongoDB

Professional REST API for Tours application with OTP email verification.

## 🚀 Features

- User Registration with OTP verification
- Email-based OTP system
- Password hashing with bcrypt
- Input validation
- Clean, modular architecture
- Fastify framework for high performance

## 📁 Project Structure

```
Tours/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── auth.controller.js   # Authentication logic
├── models/
│   └── user.model.js        # User schema/model
├── routes/
│   ├── auth.routes.js       # Auth routes
│   └── user.routes.js       # User routes
├── utils/
│   ├── email.js             # Email utility for OTP
│   ├── validators.js        # Input validation
│   └── requestParser.js     # Request parsing utility
├── middleware/              # Middleware (future)
├── services/               # Business logic services (future)
├── index.js                # Main server file
├── .env                    # Environment variables
└── package.json
```

## 🛠️ Tech Stack

- **Fastify** - Fast web framework
- **MongoDB** - NoSQL database
- **@fastify/mongodb** - MongoDB plugin
- **@fastify/formbody** - Form data support
- **@fastify/multipart** - Multipart form data
- **bcryptjs** - Password hashing
- **nodemailer** - Email sending
- **dotenv** - Environment variables

## ⚙️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/Tours
PORT=3000
NODE_ENV=development
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
```

3. Start MongoDB:
```bash
mongod
```

4. Run server:
```bash
npm run dev
```

Server runs on: **http://localhost:3000**

## 📖 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- Name: Required, 2-50 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for OTP.",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "emailSent": true
  }
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Users

#### Get All Users
```http
GET /api/users
```

## 🔧 Configuration

### Email Setup (Gmail)

1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Add to `.env` file

## 📝 Scripts

- `npm start` - Start in production
- `npm run dev` - Start in development mode

## 🏗️ Architecture

- **Clean Code** - Modular and maintainable
- **Separation of Concerns** - Controllers, Routes, Utils separated
- **Error Handling** - Comprehensive error responses
- **Validation** - Input validation on all routes
- **Security** - Password hashing and OTP verification

