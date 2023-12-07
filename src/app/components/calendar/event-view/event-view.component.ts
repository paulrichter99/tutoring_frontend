import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CalendarDate, CalendarDay, CalendarEvent } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { CalendarService } from 'src/app/services/calendar/calendar.service';
import { MONTHS_SHORT } from 'src/app/variables/variables';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.scss']
})
export class EventViewComponent implements OnInit{
  @Input() currentUser: User | null = null;
  @Input() selectedDate: CalendarDay | null = null;

  // TODO: these are missing
  @Output() changeEventDetailsEmitter = new EventEmitter<CalendarEvent>();
  @ViewChild('calendarEventViewWrapper') calendarEventViewWrapper!: ElementRef;

  eventList: CalendarEvent[] = [];
  startDate: string = "";
  endDate: string = "";

  months = MONTHS_SHORT;

  dataLoaded = Promise.resolve(false);

  constructor(public calendarService: CalendarService,
    private calendarEventService: CalendarEventService){
    var newPastDate = new Date();

    this.startDate = newPastDate.toISOString().slice(0,10);

    newPastDate.setDate(31);
    this.endDate = newPastDate.toISOString().slice(0,10);
  }

  ngOnInit(): void {
    this.calendarEventService.getCalendarEventsByDateRange(this.startDate, this.endDate).subscribe({
      next: (events) => {
        this.eventList = <CalendarEvent[]> events;
        this.convertDateData();
        this.dataLoaded = Promise.resolve(true);
      },
      error: (e) => console.error(e)
    })
  }

  selectEvent(selectedEventDateTime: CalendarDate | null){
    if(!this.currentUser){ return; }

    if(selectedEventDateTime && !selectedEventDateTime.showEvent)
      selectedEventDateTime.showEvent = true;
  }

  setTopStyle(newTopForEventView: string){
    this.calendarEventViewWrapper.nativeElement.style.top = newTopForEventView;
  }

  changeEventDetails(updatedEvent: CalendarEvent, index: number){
    if(updatedEvent.eventDate.dateTime > new Date(this.endDate) || updatedEvent.eventDate.dateTime < new Date(this.startDate)){
      this.eventList.splice(index, 1);
    }else{
      this.eventList[index] = updatedEvent;
    }
    this.changeEventDetailsEmitter.emit(updatedEvent);
  }

  changeDateRange(){
    var startDateElement = <HTMLInputElement> document.getElementById("start-date-input");
    var endDateElement = <HTMLInputElement> document.getElementById("end-date-input");

    this.startDate = startDateElement.value;
    this.endDate = endDateElement.value;

    this.calendarEventService.getCalendarEventsByDateRange(this.startDate, this.endDate).subscribe({
      next: (events) => {
        this.eventList = <CalendarEvent[]> events;
        this.convertDateData();
      },
      error: (e) => console.error(e)
    })
  }

  // this is more of a util function
  convertDateData(){
    this.eventList?.forEach(calendarEvent => {
        let angularDate:Date = new Date(calendarEvent.eventDate.dateTime)
        calendarEvent.eventDate.dateTime = angularDate;
    })
  }

  public changeEvent(changedEvent: CalendarEvent){
    const eventIndex = this.eventList.findIndex(oldEvent => {
      return oldEvent.id === changedEvent.id
    })

    if(eventIndex){
      this.eventList[eventIndex] = changedEvent
    }
  }
}
