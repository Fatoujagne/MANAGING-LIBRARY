import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css'
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  selectedCategory: string = '';

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
          this.filteredBooks = response.data;
        } else {
          this.books = [];
          this.filteredBooks = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
        this.filteredBooks = [];
        this.isLoading = false;
        alert('Error: ' + (error.error?.message || 'Failed to load books. Please try again.'));
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = !this.searchTerm || 
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.ISBN.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || book.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  getCategories(): string[] {
    return [...new Set(this.books.map(book => book.category))];
  }
}
