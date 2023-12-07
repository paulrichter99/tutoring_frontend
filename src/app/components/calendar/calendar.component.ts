import { Component, ElementRef, HostBinding, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { elementAt } from 'rxjs';
import { CalendarMonth, CalendarDate, CalendarData, CalendarEvent, CalendarDay } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { CalendarService } from 'src/app/services/calendar/calendar.service';
import { StorageService } from 'src/app/services/storage.service';
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE, MIN_DAILY_HOUR, MONTHS, WEEK_DAYS } from 'src/app/variables/variables';
import { DayViewComponent } from './day-view/day-view.component';
import { EventViewComponent } from './event-view/event-view.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  @ViewChild('monthView', { static: true }) monthView!: ElementRef;
  // @ViewChild('weekView', { static: true }) weekView!: ElementRef;
  @ViewChild('dayView', { static: true }) dayView!: ElementRef;
  @ViewChild('todayView', { static: true }) todayView!: ElementRef;
  @ViewChild('eventView', { static: true }) eventView!: ElementRef;
  @ViewChild('calendarSingleDayWrapper') calendarSingleDayWrapper!: DayViewComponent;
  @ViewChild('calendarEventViewWrapper') calendarEventViewWrapper!: EventViewComponent;

  @ViewChild('calendar', { static: true }) calendar!: ElementRef;

  @Input() dropDownStyle: string = "none";

  weekDays: string[] = WEEK_DAYS;
  currentMonth!: CalendarMonth;
  calendarData: CalendarData | null = null;
  emptyCellsBefore: number[] = [];
  emptyCellsAfter: number[] = [];

  selectedDate: CalendarDay | null = null;
  currentDay: CalendarDay | null = null;

  calendarEvents: CalendarEvent[] | null = null;
  anonymousCalendarEvents: CalendarEvent[] | null = null;

  innerWidth: number = 0;
  selectedEvent: CalendarEvent | null = null;
  selectedEventDateTime: Date | null = null;

  currentCalendarViewMode: string = "month";
  currentUser: User | null = null;

  currentSelectedMonth: string = "";

  constructor(private calenderEventService: CalendarEventService,
              private storageService: StorageService,
              public calendarService: CalendarService)
  { }

  ngOnInit() {
    this.getAllEventsForUser();
    this.innerWidth = window.innerWidth;
    // Initialize the calendar when the component is created.
    this.currentMonth = this.getCurrentMonth();
    this.calendarData = {} as CalendarData
    this.calendarData.currentMonth = this.currentMonth;
    this.calendarData.selectedDate = this.selectedDate;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.innerWidth = window.innerWidth;
  }

  // Function to get the name of the month based on its number (0-based).
  getMonthName(month: number): string {
    return MONTHS[month];
  }

  // Function to get the current month and year.
  getCurrentMonth(): CalendarMonth {
    const currentDate = new Date();
    return { year: currentDate.getFullYear(), month: currentDate.getMonth() };
  }

  // Function to generate calendar dates for the current month.
  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentMonth.year, this.currentMonth.month, 1);
    const lastDayOfMonth = new Date(this.currentMonth.year, this.currentMonth.month + 1, 0);

    if(this.calendarData){
      this.calendarData.calendarDays = [];
    }
    this.emptyCellsBefore = [];
    this.emptyCellsAfter = [];
    this.changeCurrentSelectedMonth();

    // Calculate the number of empty cells needed to align the first day of the month.
    // 0 for Sunday, 1 for Monday, ...
    let startingDayOfWeek = firstDayOfMonth.getDay();

    // Adjust the starting day of the week to Monday (1).
    if (startingDayOfWeek === 0) {
      startingDayOfWeek = 7;
    }

    // Add empty cells (placeholder objects) before the 1st day of the month.
    const lastDayOfLastMonth = new Date(this.currentMonth.year, this.currentMonth.month, 0);
    for (let i = 0; i < startingDayOfWeek - 1; i++) {
      this.emptyCellsBefore.unshift(lastDayOfLastMonth.getDate() - i);
    }

    // Generate dates for the current month.
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentMonth.year, this.currentMonth.month, i);

      var isSelected = this.selectedDate && date.toDateString() === this.selectedDate.date.toDateString();
      const isToday = this.hasDateSameDay(date, new Date())
      if(isToday && !this.selectedDate) isSelected = true;

      // add events to month/days -> month/day
      var hoursPerDay: CalendarDate[] = this.generateHoursPerDate(date);
      const dayToAdd: CalendarDay = { date, isSelected, isToday, "hasEvent" : false,  hoursPerDay};

      // push the day to the calendarDays array
      this.calendarData?.calendarDays.push(dayToAdd);

      //set the selected day
      if(isSelected){
        this.selectedDate = dayToAdd;
      }
      if(isToday){
        this.currentDay = dayToAdd;
      }
    }
    // add the event to the corresponding dateTime, if matching
    this.calendarService.sortEventsIntoCalendar(this.calendarEvents, this.calendarData, this.currentMonth);

    let a = 41;
    for(let i = 42; i > (this.calendarData!.calendarDays.length+this.emptyCellsBefore.length); i--){
      this.emptyCellsAfter.push(i - a);
      a = a-2;
    }
  }

  // Function to generate the hours for every day from 8:00, 8:30 ... 19:00, 19:30
  generateHoursPerDate(date: Date){
    var arr: CalendarDate[] = [];
    for(let i = MIN_DAILY_HOUR; i <= 19; i++){
      var dateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i, 0, 0);
      arr.push({dateTime})
      dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i, 30, 0);
      arr.push({dateTime})
    }
    return arr;
  }

  // Function to handle navigation to the previous month.
  previousMonth() {
    this.currentMonth.month -= 1;
    if (this.currentMonth.month < 0) {
      this.currentMonth.month = 11;
      this.currentMonth.year -= 1;
    }
    this.generateCalendar();
  }

  // Function to handle navigation to the next month.
  nextMonth() {
    this.currentMonth.month += 1;
    if (this.currentMonth.month > 11) {
      this.currentMonth.month = 0;
      this.currentMonth.year += 1;
    }
    this.generateCalendar();
  }

  setMonth(){
    if(!(this.currentMonth.month == this.selectedDate?.date.getMonth())){
      this.currentMonth.month = this.selectedDate!.date.getMonth();
      this.currentMonth.year = this.selectedDate!.date.getFullYear();
    }
    this.generateCalendar();
  }
  setCurrentSelectedMonth(e:Event) {
    const element = <HTMLInputElement>e.target

    if(element.value != "" && element.value){
      this.currentSelectedMonth = element.value
    }else{
      return;
    }

    const newDate = new Date(this.currentSelectedMonth);
    this.currentMonth.month = newDate.getMonth();
    this.currentMonth.year = newDate.getFullYear();
    this.generateCalendar();
  }

  changeCurrentSelectedMonth(){
    this.currentSelectedMonth =
      this.currentMonth.year +
      "-" +
      ("0" + (this.currentMonth.month + 1)).toString().slice(-2);
  }

  // Function to handle date selection.
  selectDay(selectedDate: CalendarDay) {
    if(!selectedDate) return

    this.selectedDate = selectedDate;
    this.calendarData!.calendarDays.forEach(day => {
      if(day == this.selectedDate) day.isSelected = true;
      else day.isSelected = false
    })
    this.setCalendarToDayView(this.selectedDate);
  }

  setCalendarToMonthView(selectedDate?: CalendarDay | null){
    if(this.currentCalendarViewMode == "month"){
      return;
    }
    this.currentCalendarViewMode = "month";

    this.changeCalendarDisplayMode("100vh", "100vh")

    this.monthView.nativeElement.classList.add("active");
  }

  setCalendarToDayView(selectedDate?: CalendarDay | null){
    if(this.currentCalendarViewMode == "day"){
      return;
    }
    this.currentCalendarViewMode = "day";

    var newTopForDayView = this.innerWidth > 750? (HEADER_HEIGHT + 60) + "px" : (HEADER_HEIGHT_MOBILE+60) + "px";

    this.changeCalendarDisplayMode(newTopForDayView, "100vh");

    this.dayView.nativeElement.classList.add("active");
  }

  setCalendarToTodayView(selectedDate?: CalendarDay | null){
    if(this.currentCalendarViewMode == "today"){
      return;
    }
    this.currentCalendarViewMode = "today";

    var newTopForDayView = this.innerWidth > 750? (HEADER_HEIGHT + 60) + "px" : (HEADER_HEIGHT_MOBILE+60) + "px";

    var newSelectedDate = structuredClone(this.currentDay);
    this.selectedDate = newSelectedDate;

    this.changeCalendarDisplayMode(newTopForDayView, "100vh");
    this.setMonth();

    this.todayView.nativeElement.classList.add("active");
  }

  setCalendarToEventView(){
    if(this.currentCalendarViewMode == "event" || !this.currentUser){
      return;
    }
    this.currentCalendarViewMode = "event";

    var newTopForEventView = this.innerWidth > 750? (HEADER_HEIGHT + 60) + "px" : (HEADER_HEIGHT_MOBILE+60) + "px";

    this.changeCalendarDisplayMode("100vh", newTopForEventView);

    this.eventView.nativeElement.classList.add("active");
  }

  // TODO: Complexity is very high and there are a lot of lines, maybe we can improve here
  changeCalendarDisplayMode(newTopForDayView: string, newTopForEventView: string){

    this.monthView.nativeElement.classList.remove("active");
    // this.weekView.nativeElement.classList.remove("active");
    this.dayView.nativeElement.classList.remove("active");
    this.todayView.nativeElement.classList.remove("active");
    this.eventView.nativeElement.classList.remove("active");

    this.calendarSingleDayWrapper.setTopStyle(newTopForDayView);
    this.calendarEventViewWrapper.setTopStyle(newTopForEventView);
    // this.calendarSingleDayWrapper.nativeElement.style.top = newTopForDayView;

    /*  comment this in if you want the following behavior:
            -> do not jump to the current month when clicking switching mode to "today"
            -> comment out the last two lines before break in case "today"

        this.calendarData?.calendarDays.forEach(day => {
          if(this.hasDateSameDay(day.date, this.selectedDate?.date)){
            day.isSelected = true;
          }else day.isSelected = false;
        })
    */

    // we are not regenerating the calendar here, to stay in the selected month when switching modes.
    // if we always want to switch to the month of the selected date, simply comment in the line below
    // if we want to have buttons to jump to the current month, just call this.setMonth() from any function
    // this.setMonth();

    // Note: if we want a jump to current month and a separate one for the selectedDate, but keep the current date
    // when jumping to current month, we have to differ methods (not setting this.selectedDate but
    //  rather use this.currentDate)
  }

  getEventsFromUser(){
    this.currentUser = this.storageService.getLocalUserData();

    if(!this.anonymousCalendarEvents){
      console.error("Something went wrong: CalendarComponent -> getEventsFromUser()")
    }

    if(!this.currentUser) {
      this.calendarEvents = [];
      for(let anonymousCalendarEvent of this.anonymousCalendarEvents!){
          this.calendarEvents.push(anonymousCalendarEvent);
          this.calendarEvents[this.calendarEvents.length-1].isAnonymousEvent = true;
      }
    }else{
      this.calendarEvents = this.currentUser.calendarEvents;
      for(let anonymousCalendarEvent of this.anonymousCalendarEvents!){
        if(!(this.calendarEvents.find((element) => element.id == anonymousCalendarEvent.id))){
          this.calendarEvents.push(anonymousCalendarEvent);
          this.calendarEvents[this.calendarEvents.length-1].isAnonymousEvent = true;
        }
      }
    }
    this.convertDateData();
    this.generateCalendar();
  }

  // this is more of a util function
  convertDateData(){
    this.calendarEvents?.forEach(calendarEvent => {
        let angularDate:Date = new Date(calendarEvent.eventDate.dateTime)
        calendarEvent.eventDate.dateTime = angularDate;
    })
  }

  changeEventDetails(updatedEvent: CalendarEvent){
    var eventToUpdate = this.calendarEvents!.findIndex((element) => element.id == updatedEvent.id);
    if(eventToUpdate > -1) {
      this.calendarEvents![eventToUpdate] = updatedEvent
    }else {
      this.calendarEvents!.push(updatedEvent);
    }
    this.calendarEventViewWrapper.changeEvent(updatedEvent);
    this.setMonth();
  }

  getAllEventsForUser(){
    this.calenderEventService.getAllEventsForAnyUser().subscribe({
      next: data => {
        this.anonymousCalendarEvents = <CalendarEvent[]>data
        this.getEventsFromUser();
      },
      error: e => console.error(e)
    })
  }

  setSelectedDay(dayToAdd: number){
    // FIXME: This leads to some error and I don't know why
    //  currentDate seems to receive the same addition in time as selectedDate
    this.selectedDate?.date.setDate(this.selectedDate.date.getDate() + dayToAdd)
    this.setMonth();

    if(this.hasDateSameDay(this.selectedDate?.date, new Date())){
      this.setCalendarToTodayView();
    }else{
      this.setCalendarToDayView();
    }

    this.calendarData?.calendarDays.forEach(day => {
      //set the selected day
      if(this.hasDateSameDay(this.selectedDate?.date, day.date)){
        this.selectedDate = day;
      }
    })
  }

  hasDateSameDay(firstDate: Date | undefined, secondDate: Date | undefined): boolean{
    if(!firstDate || !secondDate) return false;
    else if(
      (firstDate.getDate() == secondDate.getDate())
      && (firstDate.getMonth() == secondDate.getMonth())
      && (firstDate.getFullYear() == secondDate.getFullYear())
    ){
      return true;
    }
    return false;
  }
}
