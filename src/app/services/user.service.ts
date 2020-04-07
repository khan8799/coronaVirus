import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  token;
  constructor(
    private http: HttpClient,
  ) {
  }

  login(userObject): Observable<any> {
    return  this.http.post<any>('Users/login', userObject);
  }

  getUserList(searchObject): Observable<any> {
    this.token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/assignedUser?accessToken=' + this.token, searchObject);
  }

  userForm(searchObject): Observable<any> {
    this.token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/fieldForm?accessToken=' + this.token, searchObject);
  }

  blockList(districtObject): Observable<any> {
    this.token = localStorage.getItem('accessToken');
    return this.http.post<any>('Location/block?accessToken=' + this.token, districtObject).pipe(map(res => res.data));
  }

  panchayatList(blockObject): Observable<any> {
    this.token = localStorage.getItem('accessToken');
    return this.http.post<any>('Location/gramPanchayat?accessToken=' + this.token, blockObject).pipe(map(res => res.data));
  }

  checkEntrySlot(checkEntryObject): Observable<any> {
    this.token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/checkEntrySlot?accessToken=' + this.token, checkEntryObject);
  }
}
