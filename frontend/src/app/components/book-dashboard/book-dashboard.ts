import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-dashboard.html',
  styleUrl: './book-dashboard.css'
})
export class BookDashboardComponent implements OnInit {
  books: Book[] = [];
  isLoading: boolean = false;
  stats = {
    total: 0,
    available: 0,
    unavailable: 0
  };

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getBooks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.books = response.data;
        } else {
          this.books = [];
        }
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
        this.calculateStats();
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load books. Please try again.'));
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.books.length;
    this.stats.available = this.books.filter(b => b.availability).length;
    this.stats.unavailable = this.stats.total - this.stats.available;
  }

  deleteBook(id: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBooks();
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
