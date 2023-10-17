import { ReturnStatement } from '@angular/compiler';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventRepetitionEnum } from 'src/app/enum/EventRepetition';
import { CalendarDate, CalendarDay, CalendarEvent } from 'src/app/interface/calendar';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { HOURS_SELECTION } from 'src/app/variables/variables';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements AfterViewInit, OnInit{
  @Input() currentEvent: CalendarEvent | null = null;
  @Input() currentEventDate: CalendarDate | null = null;
  @Input() currentCalendarDay: CalendarDay | null = null;

  //eventRepetitionEnum = EventRepetitionEnum;
  //eventRepetitionOptions: string[] = []
  //eventRepetitionKeys: string[] = []

  possibleHours = HOURS_SELECTION;
  isPlaceholderEvent: boolean = false;

  constructor(private calendarEventService: CalendarEventService){
    //this.eventRepetitionOptions = Object.values(this.eventRepetitionEnum)
    //this.eventRepetitionKeys = Object.keys(this.eventRepetitionEnum)
  }

  ngOnInit(): void {
    if(!(this.currentEvent?.id))  this.isPlaceholderEvent = true;
  }

  ngAfterViewInit(): void {
    var eventDetailsElement = document.getElementById("event-details");

    if(!eventDetailsElement){
      console.error("Something went wrong: EventDetails - " + this.currentEvent?.id + " : " + this.currentEventDate?.dateTime)
      return;
    }
    /*
    if(eventDetailsElement.getBoundingClientRect().top + eventDetailsElement.getBoundingClientRect().height > window.innerHeight){
      eventDetailsElement.style.bottom = "40px";
    }
    */
    // set initial time in eventDateTimeSelectElement
    const eventDateTimeSelectElement = <HTMLSelectElement>document.getElementById("event-date-time-select");
    eventDateTimeSelectElement.value =
      this.currentEventDate!.dateTime.getHours() + ":" + String(this.currentEventDate!.dateTime.getMinutes()).padStart(2, '0');
  }

  closeEventDetails(){
    if(this.isPlaceholderEvent){
      this.currentEventDate!.event = undefined;
      this.currentEvent = null;
    }
    if(this.currentEventDate)
      this.currentEventDate.showEvent = false;

    // console.log("closing event details")
  }

  saveEventDetails(){
    const eventNameInputElement = <HTMLInputElement>document.getElementById("event-name-input");
    const eventDateDayInputElement = <HTMLInputElement>document.getElementById("event-date-day-input");
    const eventDateTimeSelectElement = <HTMLSelectElement>document.getElementById("event-date-time-select");
    const eventDurationSelectElement = <HTMLSelectElement>document.getElementById("event-duration-select");
    // repetition seems pretty hard to realize and is unnecessary atm, so we drop it for now
    // const eventRepeatingSelectElement = <HTMLSelectElement>document.getElementById("event-repeating-select");
    const eventPlaceSelectElement = <HTMLSelectElement>document.getElementById("event-place-select");

    let matchingRules = true;

    if(this.currentEvent == null) {
      console.error("Something went wrong!")
      return;
    }

    //check if the values are matching the given rules
     // eventName should not be null and not too long
    if(eventNameInputElement.value == ""){
      this.setElementNotMatchingRules(
        "EventName", eventNameInputElement, "eventName cannot be empty"
        );
        matchingRules = false;
    }else if(eventNameInputElement.value.length > 40){
      this.setElementNotMatchingRules(
        "EventName", eventNameInputElement, "eventName should be less then 40 characters"
        );
        matchingRules = false;
    }else this.setElementMatchingRules(eventNameInputElement);

     // eventDateDay should not be in the past for the editing
    let newDate = new Date(eventDateDayInputElement.value);
    newDate.setHours(Number.parseInt(eventDateTimeSelectElement.value.split(":")[0]));
    newDate.setMinutes(Number.parseInt(eventDateTimeSelectElement.value.split(":")[1]));

    // console.log(newDate)

    if(newDate.getTime() <= Date.now()){
      this.setElementNotMatchingRules(
        "EventDate", eventDateTimeSelectElement, "eventDate cannot be set to the past here", eventDateDayInputElement
        );
        matchingRules = false;
    }
    else this.setElementMatchingRules(eventDateTimeSelectElement, eventDateDayInputElement);

    // TODO: additional check: We want to check if the date already is occupied
    if(!this.currentCalendarDay){
      console.error("Something went wrong: EventDetailsComponent : saveEventDetails()")
      return;
    }

    const newDuration = Number.parseInt(eventDurationSelectElement.value);
    let seenEventIds: number[] = [];

    for(let calendarDate of this.currentCalendarDay.hoursPerDay){
      // if calendarDate has an event and id is not the same as the edited/new event
      if(calendarDate.event && !(calendarDate.event.id == this.currentEvent.id)){
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
          console.error("The anticipated day is already occupied by another event (case 1 - endTime)")
          return;
        }

        // if we get here, we know that the new end-time is not interfering with the old event
        // so we check if the start-time is interfering
        if( newEndTime > oldEndTime
            && oldEndTime > newDate.getTime()){
          console.error("The anticipated day is already occupied by another event (case 2 - startTime)")
          return;
        }
        // check if the new Event is "surrounded" by the old event
        if( newDate.getTime() >= calendarDate.dateTime.getTime() &&  oldEndTime >= newEndTime){
          console.error("The anticipated day is already occupied by another event (case 3 - wrapper)")
          return;
        }
      }
    }

    if(!matchingRules) return;
     // eventDuration could be set to something different then the three possible options via HTML,
     // however, this will be checked in the backend, since it would be a deliberate exploit
     //  -> same goes for eventPlace

    // keep in mind that invalid data could be send to the backend somehow. We will still check the object with
    // validators in backend

    //set event values according to rules
    this.currentEvent.eventName = eventNameInputElement.value;
    for(let oldDate of this.currentEvent.eventDates){
      if(oldDate.dateTime.getTime() == this.currentEventDate?.dateTime.getTime()){
        oldDate.dateTime = newDate;
      }
    }
    this.currentEvent.eventDuration = newDuration;

    // TODO: Place of tutoring session not yet used, please set in backend
    this.currentEvent.eventPlace = eventPlaceSelectElement.value;

    if(this.currentEvent.id) this.updateEvent()
    else this.saveEvent();

    this.closeEventDetails()

  }

  saveEvent(){
    this.calendarEventService.saveEvent(this.currentEvent!).subscribe({
      next: (data) => {
        this.currentEvent = <CalendarEvent>data;
        this.convertDateData();
        this.isPlaceholderEvent = false;
      },
      error: (e) => console.error(e)
    });
  }

  updateEvent(){
    this.calendarEventService.updateEvent(this.currentEvent!).subscribe({
      next: (data) => {
        this.currentEvent = <CalendarEvent>data;
        this.convertDateData();
        this.isPlaceholderEvent = false;
      },
      error: (e) => console.error(e)
    });
  }

  convertDateData(){
    this.currentEvent?.eventDates?.forEach(calendarDate => {
      let angularDate:Date = new Date(calendarDate.dateTime)
      calendarDate.dateTime = angularDate;
    })
  }

  setElementNotMatchingRules(type: string, element: HTMLElement, reason: string, secondElement?: HTMLElement){
    console.error(`${type} is not matching the rules: ${reason}`);
    element.classList.add("data-violation");
    secondElement?.classList.add("data-violation")
  }

  setElementMatchingRules(element: HTMLElement, secondElement?: HTMLElement){
    element.classList.remove("data-violation")
    secondElement?.classList.remove("data-violation")
  }
}
