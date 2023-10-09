import { Injectable } from '@angular/core';
import { ACCESS_TOKEN } from '../variables/variables';

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
}
