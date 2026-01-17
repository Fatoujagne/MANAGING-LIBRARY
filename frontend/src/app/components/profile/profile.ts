import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Profile Component
 * 
 * Displays the current user's profile information.
 * Handles loading states and errors gracefully.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  private subscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // First try to get user from local storage (faster)
    this.user = this.authService.getCurrentUser();
    
    // Then load fresh data from API
    this.loadProfile();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Load user profile from the API
   * Includes error handling to prevent infinite loading
   */
  loadProfile(): void {
    // Don't reload if already loading
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Unsubscribe from previous subscription if exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Load profile with proper error handling
    this.subscription = this.authService.getProfile()
      .pipe(
        catchError((error) => {
          console.error('Error loading profile:', error);
          // Return a safe fallback to prevent infinite loading
          return of({ success: false, user: null });
        })
      )
      .subscribe({
        next: (response) => {
          // Always set loading to false when we get a response (success or error)
          this.isLoading = false;
          
          if (response && response.success && response.user) {
            // Update user from API response
            this.user = response.user;
          } else {
            // If API call fails, use cached user from service
            if (!this.user) {
              this.user = this.authService.getCurrentUser();
            }
            if (!this.user) {
              this.errorMessage = 'Unable to load profile. Please try logging in again.';
            }
          }
        },
        error: (error) => {
          // This should not happen due to catchError, but just in case
          console.error('Unexpected error loading profile:', error);
          this.isLoading = false;
          
          // Fallback to current user from service
          if (!this.user) {
            this.user = this.authService.getCurrentUser();
          }
          
          if (!this.user) {
            this.errorMessage = error.error?.message || 'Failed to load profile. Please try again.';
          }
        }
      });
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
