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
}
