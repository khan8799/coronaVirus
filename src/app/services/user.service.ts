import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
  ) { }

  login(userObject): Observable<any> {
    return  this.http.post<any>('Users/login', userObject);
  }

  getUserList(searchObject): Observable<any> {
    return this.http.post<any>('Users/assignedUser', searchObject);
  }
}
