import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { MemberService } from '../../services/member.service';
import { Book } from '../../models/book.model';

/**
 * Book Dashboard Component
 * 
 * Displays comprehensive statistics and management interface for the digital library.
 * Shows collection statistics, recent additions, and quick actions.
 */
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
    unavailable: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    categories: 0,
    totalMembers: 0
  };
  recentBooks: Book[] = [];
  topCategories: { name: string; count: number }[] = [];

  constructor(
    private bookService: BookService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  /**
   * Load all dashboard data including books and members
   */
  loadBooks(): void {
    this.isLoading = true;
    
    // Load books
    this.bookService.getBooks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.books = response.data;
        } else {
          this.books = [];
        }
        this.calculateStats();
        this.loadPendingBooks();
        this.loadMembers();
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
        this.calculateStats();
        this.isLoading = false;
      }
    });
  }

  /**
   * Load pending books count
   */
  loadPendingBooks(): void {
    this.bookService.getPendingBooks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.pending = response.data.length;
          this.calculateStats();
        }
      },
      error: (error) => {
        // If error, just set to 0
        this.stats.pending = 0;
      }
    });
  }

  /**
   * Load members count
   */
  loadMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.totalMembers = response.data.length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.stats.totalMembers = 0;
        this.isLoading = false;
      }
    });
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateStats(): void {
    this.stats.total = this.books.length;
    this.stats.available = this.books.filter(b => b.availability).length;
    this.stats.unavailable = this.stats.total - this.stats.available;
    this.stats.approved = this.books.filter(b => b.approvalStatus === 'approved').length;
    this.stats.rejected = this.books.filter(b => b.approvalStatus === 'rejected').length;
    
    // Calculate unique categories
    const categories = new Set(this.books.map(b => b.category));
    this.stats.categories = categories.size;
    
    // Get top categories
    const categoryCounts = new Map<string, number>();
    this.books.forEach(book => {
      const count = categoryCounts.get(book.category) || 0;
      categoryCounts.set(book.category, count + 1);
    });
    
    this.topCategories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories
    
    // Get recent books (last 5)
    this.recentBooks = [...this.books]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }

  /**
   * Calculate availability percentage
   */
  getAvailabilityPercentage(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.available / this.stats.total) * 100);
  }

  /**
   * Delete a book from the collection
   */
  deleteBook(id: string): void {
    if (confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      this.bookService.deleteBook(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBooks();
          } else {
            alert('Error: ' + (response.message || 'Failed to delete collection'));
          }
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Error: ' + (error.error?.message || 'Failed to delete collection. Please try again.'));
        }
      });
    }
  }
}
