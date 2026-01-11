# Library Management System - Backend API

A RESTful API backend for a library management system built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (Admin, Member)
  - Protected routes

- **Books Management**
  - Full CRUD operations
  - Fields: title, author, ISBN, category, availability
  - Admin-only create, update, delete operations

- **Members Management**
  - Full CRUD operations
  - Fields: name, email, membershipId, role, borrowedBooks
  - Relationship with Books entity
  - Admin-only create, update, delete operations

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- express-validator

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd library-backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

4. Start the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, email, password, role? }`
  - Access: Public

- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Access: Public

- `GET /api/auth/profile` - Get current user profile
  - Headers: `Authorization: Bearer <token>`
  - Access: Private

### Books

- `POST /api/books` - Create a new book
  - Body: `{ title, author, ISBN, category, availability? }`
  - Access: Private (Admin only)

- `GET /api/books` - Get all books
  - Access: Private

- `GET /api/books/:id` - Get book by ID
  - Access: Private

- `PUT /api/books/:id` - Update book
  - Body: `{ title?, author?, ISBN?, category?, availability? }`
  - Access: Private (Admin only)

- `DELETE /api/books/:id` - Delete book
  - Access: Private (Admin only)

### Members

- `POST /api/members` - Create a new member
  - Body: `{ name, email, membershipId, role?, borrowedBooks? }`
  - Access: Private (Admin only)

- `GET /api/members` - Get all members
  - Access: Private

- `GET /api/members/:id` - Get member by ID
  - Access: Private

- `PUT /api/members/:id` - Update member
  - Body: `{ name?, email?, membershipId?, role?, borrowedBooks? }`
  - Access: Private (Admin only)

- `DELETE /api/members/:id` - Delete member
  - Access: Private (Admin only)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Deployment

### Render

1. Connect your GitHub repository to Render
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (optional, Render will set this)
3. Build command: `npm install`
4. Start command: `npm start`

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will automatically detect Node.js and deploy

### Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```
5. Deploy: `git push heroku main`

## Project Structure

```
library-backend/
├── controllers/
│   ├── auth.controller.js
│   ├── books.controller.js
│   └── members.controller.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── User.model.js
│   ├── Book.model.js
│   └── Member.model.js
├── routes/
│   ├── auth.routes.js
│   ├── books.routes.js
│   └── members.routes.js
├── .env.example
├── .gitignore
├── package.json
├── Procfile
├── README.md
└── server.js
```

## Error Handling

The API uses consistent error responses:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## License

ISC
