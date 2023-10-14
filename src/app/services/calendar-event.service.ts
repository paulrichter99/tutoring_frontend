import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalendarEvent } from '../interface/calendar';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  backendUrl = "http://192.168.178.28:8085/api";

  constructor(private http: HttpClient) {

  }

  getAllEvents(){
    return this.http.get(this.backendUrl + "/calendarEvent/all").pipe();
  }

  saveEvent(calendarEvent:CalendarEvent){
    return this.http.put(this.backendUrl + "/calendarEvent/" + calendarEvent.id, calendarEvent);
  }
}
