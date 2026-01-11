import { Book } from './book.model';

export interface Member {
  _id?: string;
  id?: string; // Alias for _id (some APIs return id instead)
  name: string;
  email: string;
  membershipId: string;
  role: 'Admin' | 'Member';
  borrowedBooks?: Book[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberResponse {
  success: boolean;
  data: Member;
  message?: string; // Optional message for error cases
}

export interface MembersResponse {
  success: boolean;
  count: number;
  data: Member[];
}
