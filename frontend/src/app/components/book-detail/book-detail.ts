import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.css'
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  isLoading: boolean = false;
  bookId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBook();
  }

  loadBook(): void {
    this.isLoading = true;
    this.bookService.getBook(this.bookId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.book = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load book. Please try again.'));
        this.router.navigate(['/books']);
      }
    });
  }

  deleteBook(): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.bookId).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/books']);
          } else {
            alert('Error: ' + (response.message || 'Failed to delete book'));
          }
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Error: ' + (error.error?.message || 'Failed to delete book. Please try again.'));
        }
      });
    }
  }

  approveBook(): void {
    if (!this.bookId) return;
    if (confirm('Are you sure you want to approve this book? It will become visible to all users.')) {
      this.bookService.approveBook(this.bookId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Book approved successfully!');
            this.loadBook(); // Reload to show updated status
          } else {
            alert('Error: ' + (response.message || 'Failed to approve book'));
          }
        },
        error: (error) => {
          console.error('Error approving book:', error);
          alert('Error: ' + (error.error?.message || 'Failed to approve book. Please try again.'));
        }
      });
    }
  }

  rejectBook(): void {
    if (!this.bookId) return;
    if (confirm('Are you sure you want to reject this book request? It will not be visible to users.')) {
      this.bookService.rejectBook(this.bookId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Book rejected successfully!');
            this.loadBook(); // Reload to show updated status
          } else {
            alert('Error: ' + (response.message || 'Failed to reject book'));
          }
        },
        error: (error) => {
          console.error('Error rejecting book:', error);
          alert('Error: ' + (error.error?.message || 'Failed to reject book. Please try again.'));
        }
      });
    }
  }
}
