# Library Management System - Frontend

Angular frontend application for the Library Management System.

## Features

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin vs Member)
  - Protected routes with guards

- **Books Management**
  - View all books with search and filter
  - Book details view
  - Create/Edit books (Admin only)
  - Delete books (Admin only)
  - Book dashboard with statistics (Admin)

- **Members Management**
  - View all members
  - Member details view
  - Create/Edit members (Admin only)
  - Delete members (Admin only)
  - Member dashboard with statistics (Admin)

## Tech Stack

- Angular 19
- Bootstrap 5
- RxJS
- TypeScript

## Development

1. Install dependencies:
```bash
npm install
```

2. Update environment files:
   - `src/environments/environment.ts` - Development API URL
   - `src/environments/environment.prod.ts` - Production API URL

3. Start development server:
```bash
ng serve
```

4. Navigate to `http://localhost:4200`

## Build for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Update `environment.prod.ts` with your production API URL

### Netlify
1. Build the project: `ng build --configuration production`
2. Deploy the `dist/frontend` folder to Netlify
3. Update `environment.prod.ts` with your production API URL

## Environment Configuration

Make sure to update `src/environments/environment.prod.ts` with your production backend API URL before deploying.
