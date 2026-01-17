import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { Member } from '../../models/member.model';

/**
 * Member List Component
 * 
 * Displays a list of all library members.
 * Admins can see an "Add Member" button to create new members.
 */
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css'
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private memberService: MemberService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.memberService.getMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.members = response.data;
        } else {
          this.members = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.members = [];
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load members. Please try again.';
      }
    });
  }
}
