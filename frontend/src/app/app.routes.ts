import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'books',
    loadComponent: () => import('./components/book-list/book-list').then(m => m.BookListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'books/new',
    loadComponent: () => import('./components/book-form/book-form').then(m => m.BookFormComponent),
    canActivate: [authGuard] // Any authenticated user can request to add books
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./components/book-detail/book-detail').then(m => m.BookDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'books/:id/edit',
    loadComponent: () => import('./components/book-form/book-form').then(m => m.BookFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'members',
    loadComponent: () => import('./components/member-list/member-list').then(m => m.MemberListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members/new',
    loadComponent: () => import('./components/member-form/member-form').then(m => m.MemberFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'members/:id',
    loadComponent: () => import('./components/member-detail/member-detail').then(m => m.MemberDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'members/:id/edit',
    loadComponent: () => import('./components/member-form/member-form').then(m => m.MemberFormComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/book-dashboard/book-dashboard').then(m => m.BookDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/pending-books',
    loadComponent: () => import('./components/pending-books/pending-books').then(m => m.PendingBooksComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: '/books'
  }
];
