import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-detail.html',
  styleUrl: './member-detail.css'
})
export class MemberDetailComponent implements OnInit {
  member: Member | null = null;
  isLoading: boolean = false;
  memberId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') || '';
    this.loadMember();
  }

  loadMember(): void {
    this.isLoading = true;
    this.memberService.getMember(this.memberId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.member = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load member. Please try again.'));
        this.router.navigate(['/members']);
      }
    });
  }

  getBorrowedBooks(): Book[] {
    if (!this.member?.borrowedBooks) {
      return [];
    }
    // Filter out string IDs and return only Book objects
    return this.member.borrowedBooks.filter((book): book is Book => 
      typeof book === 'object' && book !== null && 'title' in book
    );
  }

  getBorrowedBookIds(): string[] {
    if (!this.member?.borrowedBooks) {
      return [];
    }
    // Filter out Book objects and return only string IDs
    return this.member.borrowedBooks.filter((book): book is string => 
      typeof book === 'string'
    );
  }

  deleteMember(): void {
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(this.memberId).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/members']);
          } else {
            alert('Error: ' + (response.message || 'Failed to delete member'));
          }
        },
        error: (error) => {
          console.error('Error deleting member:', error);
          alert('Error: ' + (error.error?.message || 'Failed to delete member. Please try again.'));
        }
      });
    }
  }
}
