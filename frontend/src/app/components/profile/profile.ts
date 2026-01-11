import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.user = response.user;
        } else {
          // Fallback to current user from service
          this.user = this.authService.getCurrentUser();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Fallback to current user from service
        this.user = this.authService.getCurrentUser();
        this.isLoading = false;
        if (!this.user) {
          alert('Error: ' + (error.error?.message || 'Failed to load profile. Please try again.'));
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
