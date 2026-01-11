import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';

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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.members = [];
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load members. Please try again.'));
      }
    });
  }
}
