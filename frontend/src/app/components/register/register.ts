import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Register Component
 * 
 * Handles new user registration.
 * Displays clear error notifications for registration failures.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Member']
    });
  }

  /**
   * Handle form submission
   * Validates form and attempts to register new user
   */
  onSubmit(): void {
    // Clear previous errors
    this.clearError();
    
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showError = false;

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.isLoading = false;
          // Wait a moment for auth state to update
          setTimeout(() => {
            const user = this.authService.getCurrentUser();
            console.log('Current user after registration:', user);
            if (user?.role === 'Admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/books']);
            }
          }, 100);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          this.handleRegistrationError(error);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle registration errors and display appropriate messages
   */
  private handleRegistrationError(error: any): void {
    let message = 'Registration failed. Please try again.';
    
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
    if (error.status === 400) {
      if (message.includes('already exists') || message.includes('duplicate')) {
        message = 'An account with this email already exists. Please use a different email or try logging in.';
      }
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
