import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest, User } from '../interface/user';
import { UserSettings } from '../interface/userSettings';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public baseUrl = environment.apiUrl + "/user";

  constructor(private httpClient: HttpClient) { }

  public loginUser(loginRequest: LoginRequest): Observable<any> {
    return this.httpClient.post(this.baseUrl + "/login", loginRequest);
  }

  // TODO: check the usage: Should only get used by parent components

  public getUserData(): Observable<any> {
    return this.httpClient.get(this.baseUrl + "/me").pipe();
  }

  public getUsers(): Observable<any> {
    return this.httpClient.get(this.baseUrl + "/allForEvent").pipe();
  }

  public saveUserSettings(userSettings: UserSettings){
    return this.httpClient.put(this.baseUrl + "/settings", userSettings).pipe();
  }

  public uploadProfilePicture(file: File){
    var formData: FormData = new FormData();
    formData.append('file', file);

    return this.httpClient.post(this.baseUrl + "/profilePicture" , formData).pipe();
  }
}
