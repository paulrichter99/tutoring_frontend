import { HttpErrorResponse } from '@angular/common/http';
import { ReturnStatement } from '@angular/compiler';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { EventRepetitionEnum } from 'src/app/enum/EventRepetition';
import { CalendarDate, CalendarDay, CalendarEvent } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { StorageService } from 'src/app/services/storage.service';
import { HOURS_SELECTION, LOGGING } from 'src/app/variables/variables';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements AfterViewInit, OnInit{
  @Input() currentEvent: CalendarEvent | null = null;
  @Input() currentEventDate: CalendarDate | null = null;
  @Input() currentCalendarDay: CalendarDay | null = null;

  @Output() changeEventDetails = new EventEmitter<CalendarEvent>();

  currentUser: User | null = null;

  logging = LOGGING;

  // this is not used yet
  //eventRepetitionEnum = EventRepetitionEnum;
  //eventRepetitionOptions: string[] = []
  //eventRepetitionKeys: string[] = []

  possibleHours = HOURS_SELECTION;
  isPlaceholderEvent: boolean = false;
  errorMessage = "";
  allUsers: User[] | null = [];

  possibleUsernames: string[] = [];

  constructor(
    private calendarEventService: CalendarEventService,
    private storageService: StorageService){
    // this is not used yet
    //this.eventRepetitionOptions = Object.values(this.eventRepetitionEnum)
    //this.eventRepetitionKeys = Object.keys(this.eventRepetitionEnum)
  }

  ngOnInit(): void {
    this.currentUser = this.storageService.getLocalUserData();
    if(!(this.currentEvent?.id))  this.isPlaceholderEvent = true;
    if(this.currentUser?.isTutor) {
      this.allUsers = this.storageService.getAllUser();
      this.allUsers?.forEach(user => this.possibleUsernames?.push(user.username));
    }
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
      this.currentEvent!.eventDate.dateTime.getHours() + ":" + String(this.currentEvent!.eventDate.dateTime.getMinutes()).padStart(2, '0');
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

  // TODO: clean up this mess with util helper classes/functions
  saveEventDetails(){
    const eventNameInputElement = <HTMLInputElement>document.getElementById("event-name-input");
    const eventDateDayInputElement = <HTMLInputElement>document.getElementById("event-date-day-input");
    const eventDateTimeSelectElement = <HTMLSelectElement>document.getElementById("event-date-time-select");
    const eventDurationSelectElement = <HTMLSelectElement>document.getElementById("event-duration-select");
    /* not yet used */
    // repetition seems pretty hard to realize and is unnecessary atm, so we drop it for now
    // const eventRepeatingSelectElement = <HTMLSelectElement>document.getElementById("event-repeating-select");
    // const eventPlaceSelectElement = <HTMLSelectElement>document.getElementById("event-place-select");
    const eventPrivateInputElement = <HTMLInputElement>document.getElementById("event-private-input");

    var matchingRules = true;
    var tempMatchingRules = true;

    if(!this.performPreSaveChecks()){
      return;
    }

    //check if the values are matching the given rules
    matchingRules = this.checkEventNameValidity(eventNameInputElement);

    // eventDateDay should not be in the past for the editing
    let newDate = new Date(eventDateDayInputElement.value);
    newDate.setHours(Number.parseInt(eventDateTimeSelectElement.value.split(":")[0]));
    newDate.setMinutes(Number.parseInt(eventDateTimeSelectElement.value.split(":")[1]));

    tempMatchingRules = this.checkEventNotInPastValidity(newDate, eventDateTimeSelectElement, eventDateDayInputElement);
    if(matchingRules && !tempMatchingRules) matchingRules = false;

    tempMatchingRules = this.calendarEventService.checkEventDateValidity(
      newDate,
      eventDurationSelectElement,
      this.currentCalendarDay!,
      this.currentEvent!
    )

    if(this.currentEvent?.eventUsers && this.currentEvent.eventUsers.length <= 1){
      matchingRules = true;
      tempMatchingRules = true;
    }

    if(!tempMatchingRules){
      this.errorMessage = "The anticipated date is already occupied by another event!"
      this.setElementNotMatchingRules(
        "EventTime",
        Array.of(eventDateTimeSelectElement),
        "The anticipated date is already occupied by another event!"
      )
    }
    if(matchingRules && !tempMatchingRules) matchingRules = false;

    // keep in mind that data is processed and validated in the backend a second time
    if(!matchingRules) return;

    if(this.privateEventIsChecked)
      this.currentEvent!.eventUsers = [];

    console.log(this.currentEvent?.eventUsers)

    const oldEventCopy = JSON.stringify(this.currentEvent!)
    var updatedEvent: CalendarEvent = JSON.parse(oldEventCopy);
    //set event values according to rules
    updatedEvent.eventName = eventNameInputElement.value;
    const oldDate = updatedEvent.eventDate;

    var date: Date = new Date(oldDate.dateTime);
    if(date.getTime() == this.currentEventDate?.dateTime.getTime()){
      oldDate.dateTime = newDate;
    }

    updatedEvent.eventDuration = Number.parseInt(eventDurationSelectElement.value);

    // TODO: Place of tutoring session not yet used, please set in backend
    // updatedEvent.eventPlace = eventPlaceSelectElement.value;

    if(updatedEvent.id) this.updateEvent(updatedEvent)
    else this.saveEvent(updatedEvent, eventPrivateInputElement.checked);
  }


  saveEvent(updatedEvent: CalendarEvent, isPrivate: boolean){
    this.calendarEventService.saveEvent(updatedEvent, isPrivate).subscribe({
      next: (data) => {
        this.currentEvent = <CalendarEvent>data;
        this.convertDateData();
        this.isPlaceholderEvent = false;
      },
      error: (e) => {
        this.handleHttpErrorRequest(e)
      }
    });
  }

  updateEvent(updatedEvent: CalendarEvent){
    this.calendarEventService.updateEvent(updatedEvent).subscribe({
      next: (data) => {
        this.currentEvent = <CalendarEvent>data;
        this.convertDateData();
        this.isPlaceholderEvent = false;
      },
      error: (e) => {
        this.handleHttpErrorRequest(e)
      }
    });
  }

  convertDateData(){
    if(!this.currentEvent) return;

    let angularDate:Date = new Date(this.currentEvent.eventDate.dateTime)
    this.currentEvent.eventDate.dateTime = angularDate;

    this.changeEventDetails.next(this.currentEvent);

    this.closeEventDetails();
  }

  setElementNotMatchingRules(type: string, elements: HTMLElement[], reason: string){
    if(this.logging) console.error(`${type} is not matching the rules: ${reason}`);
    this.errorMessage = `The Event is not matching the rules: ${reason}`;

    elements.forEach((e) => e.classList.add("data-violation"))
  }

  setElementMatchingRules(elements: HTMLElement[]){
    elements.forEach((e) => e.classList.remove("data-violation"))
  }

  /* Util functions to check the validity of variables for new or updated Event */
  performPreSaveChecks(): boolean{
    if(this.currentEvent == null) {
      console.error("Something went wrong!")
      return false;
    }

    if(!this.currentCalendarDay){
      console.error("Something went wrong: EventDetailsComponent : saveEventDetails()")
      return false;
    }
    return true;
  }
  checkEventNameValidity(eventNameElement: HTMLInputElement): boolean{
    // eventName should not be null and not too long
    if(eventNameElement.value == ""){
      this.setElementNotMatchingRules(
        "EventName", Array.of(eventNameElement), "The event's name cannot be empty!"
        );
        return false;
    }else if(eventNameElement.value.length > 40){
      this.setElementNotMatchingRules(
        "EventName", Array.of(eventNameElement), "The event's name should be less then 40 characters long!"
        );
        return false
    }else if(eventNameElement.value.length < 5){
      this.setElementNotMatchingRules(
        "EventName", Array.of(eventNameElement), "The event's name should be more then 5 characters long!"
        );
        return false
    }else this.setElementMatchingRules(Array.of(eventNameElement));
    return true;
  }

  checkEventNotInPastValidity(newDate: Date, eventDateTimeSelect: HTMLSelectElement, eventDateDayElement: HTMLInputElement): boolean {
    if(newDate.getTime() <= Date.now()){
      this.setElementNotMatchingRules(
        "EventDate",
        Array.of(eventDateTimeSelect, <HTMLElement>eventDateDayElement),
        "The event's date may not be in the past!"
      );
      return false;
    }
    else this.setElementMatchingRules(Array.of(<HTMLElement>eventDateTimeSelect, <HTMLElement>eventDateDayElement));
    return true;
  }


  handleHttpErrorRequest(e: any){
    if(e.error.includes("DATE_ALREADY_OCCUPIED")){
      if(this.logging) console.error("The anticipated day is already occupied by another event (message from backend)")

      const eventDateTimeSelectElement = <HTMLSelectElement>document.getElementById("event-date-time-select");
      const eventDateDayInputElement = <HTMLInputElement>document.getElementById("event-date-day-input");
      this.setElementNotMatchingRules(
        "EventDate",
        Array.of(eventDateTimeSelectElement, <HTMLElement>eventDateDayInputElement),
        "The event's date may not be in the past!"
      );
      this.errorMessage = "The anticipated day is already occupied by another event!"
    }
  }

  getCurrentEventUsernames() : string[]{
    var eventUsernames: string[] = [];
    this.currentEvent?.eventUsers?.forEach(user => {
      if(user.username == this.currentUser?.username) return;
      eventUsernames.push(user.username);
    })
    return eventUsernames;
  }

  changeUserParticipation(username: string){
    const newUserForEvent = this.getUserByUsername(username);
    if(!this.currentEvent || !newUserForEvent){
      console.error("Something wen't wrong: EventDetails::277");
    }
    if(!this.currentEvent?.eventUsers?.find(user => user.username == newUserForEvent?.username)){
      this.currentEvent!.eventUsers?.push(newUserForEvent!);
    }
    else {
      for(let i = 0; i < this.currentEvent.eventUsers.length; i++){
        var user = this.currentEvent.eventUsers[i];
        if(user.username == newUserForEvent?.username){
          this.currentEvent.eventUsers.splice(i, 1);
        }
      }
    }
  }

  getUserByUsername(username: string): User | undefined {
    return this.allUsers?.find(user => user.username == username)
  }

  privateEventIsChecked: boolean = false;

  setIsPrivate(value: boolean){
    var userSelect = document.getElementById("user-select") as HTMLElement
    if(value) {
      userSelect.hidden = true;
    }
    else userSelect.hidden = false
  }
}
