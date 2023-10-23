import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, User } from '../interface/user';
import { BASE_URL } from '../variables/variables';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public baseUrl = BASE_URL + "/user";

  constructor(private httpClient: HttpClient) { }

  public loginUser(loginRequest: LoginRequest): Observable<any> {
    return this.httpClient.post(this.baseUrl + "/login", loginRequest);
  }

  // TODO: check the usage: Should only get used by parent components

  public getUserData(): Observable<any> {
    return this.httpClient.get(this.baseUrl + "/me").pipe();
  }

  public getUsers(): Observable<any> {
    return this.httpClient.get(this.baseUrl + "/all").pipe();
  }
}
