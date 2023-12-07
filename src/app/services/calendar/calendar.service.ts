import { Injectable } from '@angular/core';
import { CalendarEvent, CalendarDate, CalendarData, CalendarDay, CalendarMonth } from 'src/app/interface/calendar';
import { MIN_DAILY_HOUR } from 'src/app/variables/variables';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }

  addEventToCalendarDay(calendarEvent: CalendarEvent, calendarDate: CalendarDate, calendarData: CalendarData){
    // check if we have the correct day matching our found event date day
    if(calendarData.calendarDays[calendarDate.dateTime.getDate()-1]){
      const correctDay = calendarData.calendarDays[calendarDate.dateTime.getDate()-1]

      // since we are sure this is the matching day, we now search for the correct time
      var startIndex = (calendarDate.dateTime.getHours() - MIN_DAILY_HOUR)
      if(calendarDate.dateTime.getMinutes() == 30){
        startIndex += 0.5
      }
      startIndex *= 2;

      // now we have to respect the duration as well
      const endIndex = startIndex + (Math.ceil(calendarEvent.eventDuration / 30)) - 1;

      // check the current time slot. We have to keep in mind, that the endIndex points to the end-time
      //  since a hourPerDay is representing a timeSlot (12:00 - 12:30), we have to do endIndex -= 1
      if(correctDay.hoursPerDay[startIndex].dateTime.toISOString() == calendarDate.dateTime.toISOString()){
        for(let i = startIndex; i <= endIndex; i++){
          correctDay.hoursPerDay[i].event = calendarEvent;
          correctDay.hasEvent = true;
        }
      }
    }
  }

  checkIfPartOfPreviousEvent(index: number, selectedDate: CalendarDay): boolean{
    var check: boolean = false;
    if(index > 0){
      if( selectedDate.hoursPerDay[index-1].event &&
        selectedDate.hoursPerDay[index].event &&
          (selectedDate.hoursPerDay[index].event?.id == selectedDate.hoursPerDay[index-1].event?.id)
      ){
        check = true;
      }
    }
    return check;
  }


  sortEventsIntoCalendar(calendarEvents: CalendarEvent[] | null, calendarData: CalendarData | null, currentMonth: CalendarMonth){
    if(!calendarEvents || !calendarData) return;

    // loop through each calendarEvent
    calendarEvents.forEach(calendarEvent => {
      if(
        calendarEvent.eventDate.dateTime.getFullYear() == currentMonth.year &&
        calendarEvent.eventDate.dateTime.getMonth() == currentMonth.month
      ){
        this.addEventToCalendarDay(calendarEvent, calendarEvent.eventDate, calendarData!);
      }
    })
  }

  calculateTime(date: Date, duration: number){
    var endTime = "";
    const fullHour = Math.floor((date.getHours() * 60 + date.getMinutes() + duration) / 30 / 2);
    var minutes = ((date.getMinutes() + duration) % 60).toString()

    if(minutes == "0") minutes = "00"

    endTime = fullHour.toString() + ":" + minutes.toString()
    return endTime
  }
}
