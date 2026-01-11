import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Member, MemberResponse, MembersResponse } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<MembersResponse> {
    return this.http.get<MembersResponse>(this.apiUrl);
  }

  getMember(id: string): Observable<MemberResponse> {
    return this.http.get<MemberResponse>(`${this.apiUrl}/${id}`);
  }

  createMember(member: Partial<Member>): Observable<MemberResponse> {
    return this.http.post<MemberResponse>(this.apiUrl, member);
  }

  updateMember(id: string, member: Partial<Member>): Observable<MemberResponse> {
    return this.http.put<MemberResponse>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
