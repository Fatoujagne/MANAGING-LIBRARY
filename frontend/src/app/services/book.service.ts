import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Book, BookResponse, BooksResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(): Observable<BooksResponse> {
    return this.http.get<BooksResponse>(this.apiUrl);
  }

  getBook(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.apiUrl}/${id}`);
  }

  createBook(book: Partial<Book>): Observable<BookResponse> {
    return this.http.post<BookResponse>(this.apiUrl, book);
  }

  updateBook(id: string, book: Partial<Book>): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.apiUrl}/${id}`, book);
  }

  deleteBook(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
