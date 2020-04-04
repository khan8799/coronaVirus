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
    return of({token: 'abcd'});
    return  this.http.post<any>('UserProfile/Login', userObject);
  }

  getUserList(searchObject): Observable<any> {
    return of([1, 2, 3, 4]);
    return this.http.get<any>('Wallet/TopUpPlans', searchObject);
  }
}
