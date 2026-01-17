# 📚 LibraryManagement

A comprehensive full-stack digital library platform built with **Angular** (Frontend) and **Node.js/Express** (Backend) with **MongoDB Atlas**. LibraryManagement provides complete collection and member management with role-based access control, content approval workflow, and user role management.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Admin and Member roles with different permissions
- **User Profile Management** - View and manage user profiles
- **Role Management** - Admins can assign roles to users

### 📚 Book Management
- **Book Request System** - Any authenticated user can request to add books
- **Admin Approval Workflow** - Books require admin approval before being visible to all users
- **Book Status Tracking** - Track books as pending, approved, or rejected
- **Complete CRUD Operations** - Create, read, update, and delete books (with proper permissions)
- **Book Availability** - Track which books are available for borrowing
- **Request Tracking** - See who requested each book and when it was reviewed

### 👥 Member Management
- **Member Registration** - Admins can create and manage library members
- **Borrowed Books Tracking** - Track which books each member has borrowed
- **Member Profiles** - Complete member information management
- **Complete CRUD Operations** - Full member lifecycle management

### 🛡️ Security Features
- **Password Hashing** - Bcrypt with salt rounds for secure password storage
- **JWT Token Expiration** - Tokens expire after 30 days
- **Input Validation** - Express-validator for request validation
- **CORS Configuration** - Secure cross-origin resource sharing
- **Error Handling** - Comprehensive error handling and user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **Angular 21** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Bootstrap 5** - Responsive UI framework
- **RxJS** - Reactive programming for async operations
- **Angular Standalone Components** - Modern Angular architecture

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Express Validator** - Request validation
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
Library Project/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.js
│   │   ├── books.controller.js
│   │   └── members.controller.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.middleware.js
│   ├── models/               # Database models
│   │   ├── Book.model.js
│   │   ├── Member.model.js
│   │   └── User.model.js
│   ├── routes/                # API routes
│   │   ├── auth.routes.js
│   │   ├── books.routes.js
│   │   └── members.routes.js
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables (not in git)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Angular components
│   │   │   │   ├── book-dashboard/
│   │   │   │   ├── book-detail/
│   │   │   │   ├── book-form/
│   │   │   │   ├── book-list/
│   │   │   │   ├── login/
│   │   │   │   ├── member-dashboard/
│   │   │   │   ├── member-detail/
│   │   │   │   ├── member-form/
│   │   │   │   ├── member-list/
│   │   │   │   ├── profile/
│   │   │   │   └── register/
│   │   │   ├── guards/        # Route guards
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   │   ├── book.model.ts
│   │   │   │   ├── member.model.ts
│   │   │   │   └── user.model.ts
│   │   │   ├── services/      # Angular services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── book.service.ts
│   │   │   │   └── member.service.ts
│   │   │   ├── app.ts          # Root component
│   │   │   ├── app.routes.ts   # Routing configuration
│   │   │   └── app.config.ts   # App configuration
│   │   └── environments/      # Environment configs
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas) (or use local MongoDB)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fatoujagne/MANAGING-LIBRARY.git
   cd MANAGING-LIBRARY
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env  # If .env.example exists
   # Or create .env manually
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

5. **Start the backend server**
   ```bash
   npm start        # Production mode
   # OR
   npm run dev      # Development mode with nodemon (auto-restart)
   ```

6. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

7. **Access the application**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:5000`
   - API Health Check: `http://localhost:5000/api/health`

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?appName=Cluster0
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/library?appName=Cluster0

# JWT Secret Key (Generate a secure random string)
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_secure_jwt_secret_key_here
```

### Generating a Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL (if available)
openssl rand -hex 32
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Member"  // Optional, defaults to "Member"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Member"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin_token>
```

#### Get User by ID (Admin Only)
```http
GET /api/auth/users/:id
Authorization: Bearer <admin_token>
```

#### Update User Role (Admin Only)
```http
PUT /api/auth/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "Admin"  // or "Member"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/auth/users/:id
Authorization: Bearer <admin_token>
```

### Book Endpoints

#### Create Book Request (Any Authenticated User)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "ISBN": "978-0-7432-7356-5",
  "category": "Fiction",
  "availability": true
}
```

**Note:** Book is created with `approvalStatus: "pending"` and requires admin approval.

#### Get All Books
```http
GET /api/books
Authorization: Bearer <token>
```

**Response for Members:** Only approved books
**Response for Admins:** All books (pending, approved, rejected)

#### Get Pending Books (Admin Only)
```http
GET /api/books/pending
Authorization: Bearer <admin_token>
```

#### Get Book by ID
```http
GET /api/books/:id
Authorization: Bearer <token>
```

**Note:** Members can only view approved books. Admins can view any book.

#### Approve Book (Admin Only)
```http
PUT /api/books/:id/approve
Authorization: Bearer <admin_token>
```

#### Reject Book (Admin Only)
```http
PUT /api/books/:id/reject
Authorization: Bearer <admin_token>
```

#### Update Book (Admin Only)
```http
PUT /api/books/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "author": "Updated Author",
  "category": "Updated Category",
  "availability": false
}
```

#### Delete Book (Admin Only)
```http
DELETE /api/books/:id
Authorization: Bearer <admin_token>
```

### Member Endpoints

#### Create Member (Admin Only)
```http
POST /api/members
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "membershipId": "MEM001",
  "role": "Member",
  "borrowedBooks": []
}
```

#### Get All Members
```http
GET /api/members
Authorization: Bearer <token>
```

#### Get Member by ID
```http
GET /api/members/:id
Authorization: Bearer <token>
```

#### Update Member (Admin Only)
```http
PUT /api/members/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete Member (Admin Only)
```http
DELETE /api/members/:id
Authorization: Bearer <admin_token>
```

## 🔒 Role-Based Access Control

### Admin Permissions
- ✅ Create, update, and delete books
- ✅ Approve/reject book requests
- ✅ View all books (including pending/rejected)
- ✅ Create, update, and delete members
- ✅ View all users
- ✅ Assign roles to users
- ✅ Delete users (except themselves)

### Member Permissions
- ✅ View approved books only
- ✅ Request to add new books (creates pending book)
- ✅ View their own profile
- ✅ View all members
- ❌ Cannot approve/reject books
- ❌ Cannot manage users
- ❌ Cannot delete books

## 📊 Book Approval Workflow

1. **Book Request**: Any authenticated user (Member or Admin) can create a book request
2. **Pending Status**: Book is created with `approvalStatus: "pending"`
3. **Admin Review**: Admin views pending books via `GET /api/books/pending`
4. **Admin Decision**: Admin approves or rejects the book
5. **Visibility**: Approved books become visible to all users; rejected books remain hidden

## 🧪 Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get books (use token from login response)
curl -X GET http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API collection (if available)
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (set after login)
3. Test endpoints in order:
   - Register/Login → Get Token
   - Use token in Authorization header for protected routes

## 🐛 Troubleshooting

### Backend Issues

**Port Already in Use**
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000
# Kill the process or use a different port
PORT=5001 npm start
```

**MongoDB Connection Error**
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas IP whitelist
- Verify database user credentials
- Check network connectivity

**JWT Secret Error**
- Ensure `JWT_SECRET` is set in `.env`
- Generate a new secure secret if needed
- Restart server after changing `.env`

### Frontend Issues

**CORS Errors**
- Ensure backend CORS is configured for `http://localhost:4200`
- Check backend server is running
- Verify API base URL in `environment.ts`

**Authentication Errors**
- Check token is being sent in Authorization header
- Verify token hasn't expired (30 days)
- Ensure backend JWT_SECRET matches

## 📝 Code Documentation

All code is thoroughly documented with:
- **JSDoc comments** for functions and classes
- **Inline comments** explaining complex logic
- **Module-level documentation** describing purpose
- **Route documentation** with examples
- **Parameter and return type documentation**

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong JWT secrets** - Generate cryptographically random secrets
3. **Keep dependencies updated** - Regularly update npm packages
4. **Validate all inputs** - Use express-validator for request validation
5. **Hash passwords** - Never store plain text passwords
6. **Use HTTPS in production** - Encrypt data in transit
7. **Implement rate limiting** - Prevent abuse (consider adding)
8. **Regular security audits** - Use `npm audit` regularly

## 🚀 Deployment

### Backend Deployment (Heroku Example)

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set MONGO_URI=your_mongodb_uri
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify Example)

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Update environment variables** in `environment.prod.ts`

3. **Deploy** to your preferred hosting service

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Fatou Jagne**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the author.

---

**Made with ❤️ for LibraryManagement**
