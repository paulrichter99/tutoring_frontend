import { Component, ElementRef, HostBinding, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { elementAt } from 'rxjs';
import { CalendarMonth, CalendarDate, CalendarData, CalendarEvent, CalendarDay } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { CalendarService } from 'src/app/services/calendar/calendar.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { HEADER_HEIGHT, HEADER_HEIGHT_MOBILE, MIN_DAILY_HOUR, MONTHS, WEEK_DAYS } from 'src/app/variables/variables';
import { DayViewComponent } from './day-view/day-view.component';

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
  // @ViewChild('eventView', { static: true }) eventView!: ElementRef;
  @ViewChild('calendarSingleDayWrapper') calendarSingleDayWrapper!: DayViewComponent;

  @ViewChild('calendar', { static: true }) calendar!: ElementRef;

  @Input() dropDownStyle: string = "none";

  weekDays: string[] = WEEK_DAYS;
  currentMonth!: CalendarMonth;
  calendarData: CalendarData | null = null;
  emptyCellsBefore: number[] = [];
  emptyCellsAfter: number[] = [];
  selectedDate: CalendarDay | null = null;

  calendarEvents: CalendarEvent[] | null = null;
  anonymousCalendarEvents: CalendarEvent[] | null = null;

  innerWidth: number = 0;
  selectedEvent: CalendarEvent | null = null;
  selectedEventDateTime: Date | null = null;

  currentCalendarViewMode: string = "month";
  currentUser: User | null = null;

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
      const isToday = date.toDateString() === new Date().toDateString();
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
    this.currentMonth.month = this.selectedDate!.date.getMonth();
    this.generateCalendar();
  }

  // Function to handle date selection.
  selectDay(selectedDate: CalendarDay) {
    if(!selectedDate) return

    this.selectedDate = selectedDate;
    this.calendarData!.calendarDays.forEach(day => {
      if(day == this.selectedDate) day.isSelected = true;
      else day.isSelected = false
    })
    this.changeCalendarDisplayMode("day", this.selectedDate);
  }

  // TODO: Complexity is very high and there are a lot of lines, maybe we can improve here
  changeCalendarDisplayMode(mode: string, selectedDate?: CalendarDay | null){
    if(this.currentCalendarViewMode == mode)
      return;

    this.currentCalendarViewMode = mode;
    this.monthView.nativeElement.classList.remove("active");
    // this.weekView.nativeElement.classList.remove("active");
    this.dayView.nativeElement.classList.remove("active");
    this.todayView.nativeElement.classList.remove("active");
    var newSelectedDate: CalendarDay | null = selectedDate ? selectedDate : this.selectedDate;
    var newTopForDayView = "100vh";

    // TODO: maybe instead of scrolling from bottom to top, imitate a component switch
    // -> create a calendarMonthView, calendarWeekView and calendarDayView
    // -> when switching components, you can just use the default animation or just set left: -100 or left: 0

    switch(mode){
      case "month":
        this.monthView.nativeElement.classList.add("active");
        break;
      // case "week": this.weekView.nativeElement.classList.add("active"); break;
      case "day":
        this.dayView.nativeElement.classList.add("active");
        newTopForDayView = this.innerWidth > 750? (HEADER_HEIGHT + 60) + "px" : (HEADER_HEIGHT_MOBILE+60) + "px";
        if(this.selectedDate == null){
          var res = this.calendarData?.calendarDays.filter((date) => date.isToday == true);
          if(res) newSelectedDate = res[0];
        }
        break;
      case "today":
        this.todayView.nativeElement.classList.add("active");
        newTopForDayView = this.innerWidth > 750? (HEADER_HEIGHT + 60) + "px" : (HEADER_HEIGHT_MOBILE+60) + "px";
        var res = this.calendarData?.calendarDays.filter((date) => date.isToday == true);
        if(res) newSelectedDate = res[0];
        this.calendarData!.calendarDays.forEach(day => {
          if(day == newSelectedDate) day.isSelected = true;
          else day.isSelected = false
        })
        break;
      default: this.monthView.nativeElement.classList.add("active"); break;
    }
    this.calendarSingleDayWrapper.setTopStyle(newTopForDayView);
    // this.calendarSingleDayWrapper.nativeElement.style.top = newTopForDayView;

    this.selectedDate = newSelectedDate;

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
      calendarEvent.eventDates?.forEach(calendarDate => {
        let angularDate:Date = new Date(calendarDate.dateTime)
        calendarDate.dateTime = angularDate;
      })
    })
  }

  changeEventDetails(updatedEvent: CalendarEvent){
    var eventToUpdate = this.calendarEvents!.findIndex((element) => element.id == updatedEvent.id);
    if(eventToUpdate > -1) {
      this.calendarEvents![eventToUpdate] = updatedEvent
    }else {
      this.calendarEvents!.push(updatedEvent);
    }
    this.generateCalendar();
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
    this.selectedDate?.date.setDate(this.selectedDate.date.getDate() + dayToAdd)
    this.setMonth();
  }
}
