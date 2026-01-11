import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './member-form.html',
  styleUrl: './member-form.css'
})
export class MemberFormComponent implements OnInit {
  memberForm: FormGroup;
  isEditMode: boolean = false;
  memberId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService
  ) {
    this.memberForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      membershipId: ['', [Validators.required]],
      role: ['Member']
    });
  }

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') || '';
    if (this.memberId) {
      this.isEditMode = true;
      this.loadMember();
    }
  }

  loadMember(): void {
    this.isLoading = true;
    this.memberService.getMember(this.memberId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.memberForm.patchValue(response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error loading member. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const memberData = this.memberForm.value;

      if (this.isEditMode) {
        this.memberService.updateMember(this.memberId, memberData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.router.navigate(['/members', this.memberId]);
            } else {
              this.errorMessage = response.message || 'Error updating member';
            }
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Error updating member. Please try again.';
            }
          }
        });
      } else {
        this.memberService.createMember(memberData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success && response.data) {
              const memberId = response.data._id || response.data.id;
              if (memberId) {
                this.router.navigate(['/members', memberId]);
              } else {
                this.errorMessage = 'Member created but ID not found';
              }
            } else {
              this.errorMessage = response.message || 'Error creating member';
            }
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Error creating member. Please try again.';
            }
          }
        });
      }
    }
  }
}
