import { Injectable } from '@angular/core';
import { User } from '../interface/user';
import { ACCESS_TOKEN, USER_DATA } from '../variables/variables';
import { UserSettings } from '../interface/userSettings';

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

  /* This is only for local/browser settings e.g. colors */
  saveLocalUserSettings(userSettings: UserSettings){
    localStorage.setItem('userSettings', JSON.stringify(userSettings))
  }

  getLocalUserSettings(): UserSettings | null {
    const userSettingsString = localStorage.getItem('userSettings');
    if(!userSettingsString) { return null; }

    return JSON.parse(userSettingsString);
  }

  saveAllUser(allUser: User[]){
    localStorage.setItem('users', JSON.stringify(allUser))
  }

  getAllUser(): User[] | null{
    const usersString = localStorage.getItem('users');
    if(!usersString) { return null; }

    return JSON.parse(usersString);
  }
}
