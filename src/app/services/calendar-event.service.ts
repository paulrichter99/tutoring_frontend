import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalendarDay, CalendarEvent } from '../interface/calendar';
import { BASE_URL, LOGGING } from '../variables/variables';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  public baseUrl = BASE_URL;

  constructor(private http: HttpClient) {

  }

  getAllEventsForAdmin(){
    return this.http.get(this.baseUrl + "/calendarEvent/all/admin").pipe();
  }

  getAllEventsForAnyUser(){
    return this.http.get(this.baseUrl + "/calendarEvent/all/user").pipe();
  }

  getCalendarEventsByDateRange(startDate: string, endDate: string){
    return this.http.get(this.baseUrl + "/calendarEvent/all?startDate=" + startDate + "&endDate=" + endDate).pipe();
  }

  saveEvent(calendarEvent:CalendarEvent, isPrivate: boolean){
    return this.http.post(this.baseUrl + "/calendarEvent?isPrivate=" + isPrivate, calendarEvent);
  }

  updateEvent(calendarEvent:CalendarEvent){
    return this.http.put(this.baseUrl + "/calendarEvent/" + calendarEvent.id, calendarEvent);
  }

  /*checkEventDateValidity(
      newDate: Date,
      eventDurationSelectElement: HTMLSelectElement,
      currentCalendarDay: CalendarDay,
      currentEvent: CalendarEvent): boolean{
    const newDuration = Number.parseInt(eventDurationSelectElement.value);
    let seenEventIds: number[] = [];

    for(let calendarDate of currentCalendarDay.hoursPerDay){
      // if calendarDate has an event and id is not the same as the edited/new event
      if(calendarDate.events && !(calendarDate.event.id == currentEvent.id)){
        // we now have to check if the newDate is interfering with the event in that time slot
        // check if we have seen the event id. we compare events not time-slots
        if(!seenEventIds.includes(calendarDate.event.id ? calendarDate.event.id : -2)){
          seenEventIds.push(calendarDate.event.id!);
        }else{
          continue;
        }

        const newEndTime = newDate.getTime() + (1000 * 60 * newDuration);
        const oldEndTime = calendarDate.dateTime.getTime() + (1000 * 60 * calendarDate.event.eventDuration);

        // check if the start time is less and end time is greater then my time-slot time
        if(newDate.getTime() < calendarDate.dateTime.getTime()
          && (newEndTime > calendarDate.dateTime.getTime())){
          if(LOGGING) console.error("The anticipated day is already occupied by another event (case 1 - endTime)")
          return false;
        }

        // if we get here, we know that the new end-time is not interfering with the old event
        // so we check if the start-time is interfering
        if( newEndTime > oldEndTime
            && oldEndTime > newDate.getTime()){
          if(LOGGING) console.error("The anticipated day is already occupied by another event (case 2 - startTime)")
          return false;
        }
        // check if the new Event is "surrounded" by the old event
        if( newDate.getTime() >= calendarDate.dateTime.getTime() &&  oldEndTime >= newEndTime){
          if(LOGGING) console.error("The anticipated day is already occupied by another event (case 3 - wrapper)")
          return false;
        }
      }
    }
    return true;
  }*/
}
