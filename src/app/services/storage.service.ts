import { Injectable } from '@angular/core';
import { User } from '../interface/user';
import { ACCESS_TOKEN, USER_DATA } from '../variables/variables';

@Injectable({
  providedIn: 'root'
})


export class StorageService {

  constructor() { }

  saveAccessToken(token: string){
    localStorage.setItem(ACCESS_TOKEN, token);
  }

  getAccessToken(){
    return localStorage.getItem(ACCESS_TOKEN);
  }

  saveUserData(user:User){
    localStorage.setItem(USER_DATA, JSON.stringify(user));
  }

  getLocalUserData(): User | null{
    if(localStorage.getItem(USER_DATA) != null){
      return JSON.parse(localStorage.getItem(USER_DATA)!);
    }
    return null;
  }

  removeLocalUserData(){
    localStorage.removeItem(USER_DATA);
  }
}
