import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css'
})
export class MemberDashboardComponent implements OnInit {
  members: Member[] = [];
  isLoading: boolean = false;
  stats = {
    total: 0,
    admins: 0,
    regularMembers: 0
  };

  constructor(private memberService: MemberService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.isLoading = true;
    this.memberService.getMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.members = response.data;
        } else {
          this.members = [];
        }
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.members = [];
        this.calculateStats();
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load members. Please try again.'));
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.members.length;
    this.stats.admins = this.members.filter(m => m.role === 'Admin').length;
    this.stats.regularMembers = this.stats.total - this.stats.admins;
  }

  deleteMember(id: string): void {
    if (confirm('Are you sure you want to delete this member?')) {
      this.memberService.deleteMember(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMembers();
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
