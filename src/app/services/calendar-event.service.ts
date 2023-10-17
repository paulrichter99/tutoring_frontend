import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalendarEvent } from '../interface/calendar';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  public baseUrl = "http://localhost:8085/api";

  constructor(private http: HttpClient) {

  }

  getAllEventsForAdmin(){
    return this.http.get(this.baseUrl + "/calendarEvent/all/admin").pipe();
  }

  getAllEventsForAnyUser(){
    return this.http.get(this.baseUrl + "/calendarEvent/all/user").pipe();
  }

  saveEvent(calendarEvent:CalendarEvent){
    return this.http.post(this.baseUrl + "/calendarEvent", calendarEvent);
  }

  updateEvent(calendarEvent:CalendarEvent){
    return this.http.put(this.baseUrl + "/calendarEvent/" + calendarEvent.id, calendarEvent);
  }
}
