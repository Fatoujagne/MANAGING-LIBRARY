# Backend-Frontend Connection Guide

## Current Configuration

### Backend
- **URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`
- **Status**: ✅ Running
- **CORS**: Enabled for `http://localhost:4200`

### Frontend
- **URL**: `http://localhost:4200`
- **API Base**: `http://localhost:5000/api` (configured in `environment.ts`)
- **Status**: Starting...

## Connection Status

Both servers should be running:
- Backend on port **5000**
- Frontend on port **4200**

## Testing the Connection

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Expected: `{"status":"OK","message":"Server is running"}`

2. **Frontend Access**:
   Open browser: `http://localhost:4200`

3. **Test Authentication**:
   - Navigate to Register/Login page
   - Create an account or login
   - Verify API calls are working

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Books
- `GET /api/books` - Get all books (requires auth)
- `GET /api/books/:id` - Get book by ID (requires auth)
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Members
- `GET /api/members` - Get all members (requires auth)
- `GET /api/members/:id` - Get member by ID (requires auth)
- `POST /api/members` - Create member (Admin only)
- `PUT /api/members/:id` - Update member (Admin only)
- `DELETE /api/members/:id` - Delete member (Admin only)

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify backend CORS configuration includes `http://localhost:4200`
2. Check that backend is running on port 5000
3. Restart backend server after CORS changes

### Connection Refused
- Verify backend is running: `netstat -ano | findstr :5000`
- Check backend logs for errors
- Verify MongoDB connection (if using database)

### API Not Responding
- Check browser Network tab for failed requests
- Verify API URL in `frontend/src/environments/environment.ts`
- Test backend directly with curl/Postman

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend starting on port 4200
3. ✅ CORS configured
4. ⏳ Test login/register functionality
5. ⏳ Test book/member CRUD operations
