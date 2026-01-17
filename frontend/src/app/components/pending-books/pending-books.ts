import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

/**
 * Pending Books Component
 * 
 * This component displays all book requests that are pending admin approval.
 * Only accessible by administrators.
 * Admins can approve or reject book requests from this page.
 */
@Component({
  selector: 'app-pending-books',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-books.html',
  styleUrl: './pending-books.css'
})
export class PendingBooksComponent implements OnInit {
  pendingBooks: Book[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadPendingBooks();
  }

  /**
   * Load all pending book requests from the API
   */
  loadPendingBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.bookService.getPendingBooks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pendingBooks = response.data;
        } else {
          this.pendingBooks = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending books:', error);
        this.errorMessage = error.error?.message || 'Failed to load pending books. Please try again.';
        this.pendingBooks = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Approve a pending book request
   * This makes the book visible to all users
   */
  approveBook(bookId: string | undefined): void {
    if (!bookId) return;

    if (confirm('Are you sure you want to approve this book? It will become visible to all users.')) {
      this.bookService.approveBook(bookId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Book approved successfully!');
            this.loadPendingBooks(); // Reload the list
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

  /**
   * Reject a pending book request
   * This prevents the book from being visible to users
   */
  rejectBook(bookId: string | undefined): void {
    if (!bookId) return;

    if (confirm('Are you sure you want to reject this book request? It will not be visible to users.')) {
      this.bookService.rejectBook(bookId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Book rejected successfully!');
            this.loadPendingBooks(); // Reload the list
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

  /**
   * Format date for display
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}
