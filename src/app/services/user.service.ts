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
  ) { }

  login(userObject): Observable<any> {
    return  this.http.post<any>('Users/login', userObject);
  }

  getUserList(searchObject): Observable<any> {
    return this.http.post<any>('Users/assignedUser', searchObject);
  }

  userForm(searchObject): Observable<any> {
    return this.http.post<any>('Users/fieldForm', searchObject);
  }

  blockList(districtObject): Observable<any> {
    return this.http.post<any>('Location/block', districtObject).pipe(map(res => res.data));
  }

  panchayatList(blockObject): Observable<any> {
    return this.http.post<any>('Location/gramPanchayat', blockObject).pipe(map(res => res.data));
  }

  checkEntrySlot(checkEntryObject): Observable<any> {
    return this.http.post<any>('Users/checkEntrySlot', checkEntryObject);
  }
}
