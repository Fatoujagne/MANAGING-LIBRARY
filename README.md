# Library Management System

A full-stack library management application built with Angular (Frontend) and Node.js/Express (Backend) with MongoDB Atlas.

## Features

- 🔐 User Authentication (JWT-based)
- 👥 Role-based Access Control (Admin/Member)
- 📚 Book Management (CRUD operations)
- 👤 Member Management (CRUD operations)
- 📊 Admin Dashboard with Statistics
- 🔍 Search and Filter Books
- 📱 Responsive Design

## Tech Stack

### Frontend
- Angular 21
- TypeScript
- Bootstrap 5
- RxJS

### Backend
- Node.js
- Express.js
- MongoDB (MongoDB Atlas)
- Mongoose
- JWT Authentication
- Express Validator

## Project Structure

```
Library Project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   └── models/
│   │   └── environments/
│   └── angular.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas account (or local MongoDB)

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
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create member (Admin only)
- `PUT /api/members/:id` - Update member (Admin only)
- `DELETE /api/members/:id` - Delete member (Admin only)

## Development

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:4200`

## License

This project is open source and available under the MIT License.

## Author

Fatou Jagne
