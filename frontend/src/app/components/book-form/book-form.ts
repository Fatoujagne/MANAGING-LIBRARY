import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css'
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode: boolean = false;
  bookId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService
  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      ISBN: ['', [Validators.required]],
      category: ['', [Validators.required]],
      availability: [true]
    });
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id') || '';
    this.isAdmin = this.authService.isAdmin();
    if (this.bookId) {
      this.isEditMode = true;
      this.loadBook();
    }
  }

  loadBook(): void {
    this.isLoading = true;
    this.bookService.getBook(this.bookId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.bookForm.patchValue(response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error loading book. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const bookData = this.bookForm.value;

      if (this.isEditMode) {
        this.bookService.updateBook(this.bookId, bookData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.router.navigate(['/books', this.bookId]);
            } else {
              this.errorMessage = response.message || 'Error updating book';
            }
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Error updating book. Please try again.';
            }
          }
        });
      } else {
        this.bookService.createBook(bookData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success && response.data) {
              // Show success message
              const message = this.isAdmin 
                ? 'Book created successfully!' 
                : 'Book request submitted successfully! It will be reviewed by an admin.';
              alert(message);
              
              const bookId = response.data._id || response.data.id;
              if (bookId) {
                this.router.navigate(['/books', bookId]);
              } else {
                this.router.navigate(['/books']);
              }
            } else {
              this.errorMessage = response.message || 'Error creating book';
            }
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
            } else {
              this.errorMessage = error.error?.message || 'Error creating book. Please try again.';
            }
          }
        });
      }
    }
  }
}
