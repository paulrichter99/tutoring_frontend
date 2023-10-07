import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  backendUrl = "http://localhost:8085/api";

  constructor(private http: HttpClient) {

  }

  getAllEvents(){
    return this.http.get(this.backendUrl + "/calendarEvent/all").pipe();
  }
}
