import { ReturnStatement } from '@angular/compiler';
import { AfterViewInit, Component, Input } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventRepetitionEnum } from 'src/app/enum/EventRepetition';
import { CalendarDate, CalendarEvent } from 'src/app/interface/calendar';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { HOURS_SELECTION } from 'src/app/variables/variables';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements AfterViewInit{
  @Input() currentEvent: CalendarEvent | null = null;
  @Input() currentEventDate: CalendarDate | null = null;

  //eventRepetitionEnum = EventRepetitionEnum;
  //eventRepetitionOptions: string[] = []
  //eventRepetitionKeys: string[] = []

  possibleHours = HOURS_SELECTION;

  constructor(private calendarEventService: CalendarEventService){
    //this.eventRepetitionOptions = Object.values(this.eventRepetitionEnum)
    //this.eventRepetitionKeys = Object.keys(this.eventRepetitionEnum)
  }

  ngAfterViewInit(): void {
    var eventDetailsElement = document.getElementById("event-details");

    if(!eventDetailsElement){
      console.error("Something went wrong: EventDetails - " + this.currentEvent?.id + " : " + this.currentEventDate?.dateTime)
      return;
    }

    if(eventDetailsElement.getBoundingClientRect().top + eventDetailsElement.getBoundingClientRect().height > window.innerHeight){
      eventDetailsElement.style.bottom = "40px";
    }
    // set initial time in eventDateTimeSelectElement
    const eventDateTimeSelectElement = <HTMLSelectElement>document.getElementById("event-date-time-select");
    eventDateTimeSelectElement.value = this.currentEventDate!.dateTime.toLocaleTimeString().substr(0,5);
  }

  closeEventDetails(){
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
    console.log(newDate)
    if(newDate.getTime() <= Date.now()){
      this.setElementNotMatchingRules(
        "EventDate", eventDateTimeSelectElement, "eventDate cannot be set to the past here", eventDateDayInputElement
        );
        matchingRules = false;
    }
    else this.setElementMatchingRules(eventDateTimeSelectElement, eventDateDayInputElement);

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
    this.currentEvent.eventDuration = Number.parseInt(eventDurationSelectElement.value);
    // TODO: Place of tutoring session not yet used, please set in backend
    this.currentEvent.eventPlace = eventPlaceSelectElement.value;

    this.calendarEventService.saveEvent(this.currentEvent).subscribe({
      next: (data) => {
        this.currentEvent = <CalendarEvent>data;
        this.convertDateData();
      },
      error: (e) => console.error(e)
    });
    this.closeEventDetails()

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
