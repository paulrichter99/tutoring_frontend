import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CalendarDate, CalendarDay, CalendarEvent } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarService } from 'src/app/services/calendar/calendar.service';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent{
  @Input() selectedDate: CalendarDay | null = null;
  @Input() currentUser: User | null = null;

  @Output() setSelectedDayEmitter = new EventEmitter<number>();
  @Output() changeEventDetailsEmitter = new EventEmitter<CalendarEvent>();
  @ViewChild('calendarSingleDayWrapper') calendarSingleDayWrapper!: ElementRef;

  constructor(public calendarService: CalendarService){}

  selectEvent(selectedEventDateTime: CalendarDate | null){

    if(!this.currentUser){ return; }
    // we check if the selectEvent actually is meant to be a new event
    if(selectedEventDateTime?.event == null){
      // all times after 18:00 are only for the purpose of showing events, not for creating one at this time
      // therefore, we will set the max time to 18:00
      if(
        (selectedEventDateTime?.dateTime.getHours()! == 18 && selectedEventDateTime?.dateTime.getMinutes()! != 0)
        || selectedEventDateTime?.dateTime.getHours()! > 18){
        selectedEventDateTime?.dateTime.setHours(18);
        selectedEventDateTime?.dateTime.setMinutes(0);
      }
      selectedEventDateTime!.event =
        { "eventName": "",
          "eventDates": [ {"dateTime": selectedEventDateTime!.dateTime} ],
          "eventDescription": "",
          "eventDuration": 60,
          "eventPlace":"home",
          "eventUsers": [this.currentUser!]
        }
    }

    if(selectedEventDateTime && !selectedEventDateTime.showEvent)
      selectedEventDateTime.showEvent = true;
  }

  setSelectedDay(dayToAdd: number){
    this.setSelectedDayEmitter.emit(dayToAdd);
  }

  changeEventDetails(updatedEvent: CalendarEvent){
    this.changeEventDetailsEmitter.emit(updatedEvent);
  }

  setTopStyle(newTopForDayView: string){
    this.calendarSingleDayWrapper.nativeElement.style.top = newTopForDayView;
  }
}
