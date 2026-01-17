import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Login Component
 * 
 * Handles user authentication with email and password.
 * Displays clear error notifications for login failures.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Handle form submission
   * Validates form and attempts to login user
   */
  onSubmit(): void {
    // Clear previous errors
    this.clearError();
    
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showError = false;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          const user = this.authService.getCurrentUser();
          if (user?.role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/books']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.handleLoginError(error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle login errors and display appropriate messages
   */
  private handleLoginError(error: any): void {
    let message = 'Login failed. Please try again.';
    
    // Check for different error types
    if (error.error) {
      // Backend error message
      if (error.error.message) {
        message = error.error.message;
      } else if (error.error.errors && Array.isArray(error.error.errors)) {
        // Validation errors from backend
        message = error.error.errors.map((e: any) => e.msg || e.message).join(', ');
      } else if (typeof error.error === 'string') {
        message = error.error;
      }
    } else if (error.message) {
      // Network or other errors
      if (error.message.includes('Http failure') || error.message.includes('Network')) {
        message = 'Network error. Please check your connection and try again.';
      } else {
        message = error.message;
      }
    }
    
    // Handle specific HTTP status codes
    if (error.status === 401) {
      message = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.status === 0) {
      message = 'Unable to connect to server. Please check your connection.';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }
    
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  /**
   * Clear error message and hide notification
   */
  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }
}
