import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
  ) {
  }

  login(userObject): Observable<any> {
    return  this.http.post<any>('Users/login', userObject);
  }

  getUserList(searchObject): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/assignedUser?accessToken=' + token, searchObject);
  }

  userForm(searchObject): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/fieldForm?accessToken=' + token, searchObject);
  }

  blockList(districtObject): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<any>('Location/block?accessToken=' + token, districtObject).pipe(map(res => res.data));
  }

  panchayatList(blockObject): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<any>('Location/gramPanchayat?accessToken=' + token, blockObject).pipe(map(res => res.data));
  }

  checkEntrySlot(checkEntryObject): Observable<any> {
    const token = localStorage.getItem('accessToken');
    return this.http.post<any>('Users/checkEntrySlot?accessToken=' + token, checkEntryObject);
  }
}
