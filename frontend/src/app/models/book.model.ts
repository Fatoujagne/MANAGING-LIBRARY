export interface Book {
  _id?: string;
  id?: string; // Alias for _id (some APIs return id instead)
  title: string;
  author: string;
  ISBN: string;
  category: string;
  availability: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookResponse {
  success: boolean;
  data: Book;
  message?: string; // Optional message for error cases
}

export interface BooksResponse {
  success: boolean;
  count: number;
  data: Book[];
}
