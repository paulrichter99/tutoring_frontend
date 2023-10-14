import { Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild } from '@angular/core';
import { CalendarMonth, CalendarDate, CalendarData, CalendarEvent, CalendarDay } from 'src/app/interface/calendar';
import { User } from 'src/app/interface/user';
import { CalendarEventService } from 'src/app/services/calendar-event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  @ViewChild('monthView', { static: true }) monthView!: ElementRef;
  @ViewChild('weekView', { static: true }) weekView!: ElementRef;
  @ViewChild('dayView', { static: true }) dayView!: ElementRef;
  @ViewChild('calendarSingleDayWrapper', { static: true }) calendarSingleDayWrapper!: ElementRef;

  @ViewChild('calendar', { static: true }) calendar!: ElementRef;

  weekDays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  currentMonth!: CalendarMonth;
  calendarData: CalendarData | null = null;
  emptyCellsBefore: number[] = [];
  emptyCellsAfter: number[] = [];
  selectedDate: CalendarDay | null = null;

  calendarEvents: CalendarEvent[] | null = null;

  innerWidth: number = 0;
  selectedEvent: CalendarEvent | null = null;
  selectedEventDateTime: Date | null = null;

  currentCalendarViewMode: string = "month";

  constructor(private calenderEventService: CalendarEventService,
              private userService: UserService)
  { }

  ngOnInit() {
    this.getEventsFromBackend();
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
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
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
      this.calendarData.selectedDate = null;
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

      // push the day to the calendarDays array
      this.calendarData?.calendarDays.push({ date, isSelected, isToday, "hasEvent" : false,  hoursPerDay});
    }
    // add the event to the corresponding dateTime, if matching
    this.sortEventsIntoCalendar();

    let a = 41;
    for(let i = 42; i > (this.calendarData!.calendarDays.length+this.emptyCellsBefore.length); i--){
      this.emptyCellsAfter.push(i - a);
      a = a-2;
    }
  }

  sortEventsIntoCalendar(){
    if(!this.calendarEvents) return;

    // loop through each calendarEvent
    this.calendarEvents.forEach(calendarEvent => {
      // since one calendarEvent can have multiple dates, we check if the item
      //  matches with our current year and month
      calendarEvent.eventDates.find(item => {
        // if it matches, we have to assign it to the right day and time slot
        if(
          item.dateTime.getFullYear() == this.currentMonth.year &&
          item.dateTime.getMonth() == this.currentMonth.month
        ){
          this.addEventToCalendarDay(calendarEvent, item);
        }
      })
    })
  }

  addEventToCalendarDay(calendarEvent: CalendarEvent, calendarDate: CalendarDate){
    // check if we have the correct day matching our found event date day
    if(this.calendarData!.calendarDays[calendarDate.dateTime.getDate()-1]){
      const correctDay = this.calendarData!.calendarDays[calendarDate.dateTime.getDate()-1]

      // since we are sure this is the matching day, we now search for the correct time
      var startIndex = (calendarDate.dateTime.getHours() - 6)
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

  generateHoursPerDate(date: Date){
    var arr: CalendarDate[] = [];
    for(let i = 6; i <= 19; i++){
      var dateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i, 0, 0);
      arr.push({dateTime, "event": null})
      dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), i, 30, 0);
      arr.push({dateTime, "event": null})
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

  changeCalendarDisplayMode(mode: string, selectedDate?: CalendarDay | null){
    if(this.currentCalendarViewMode == mode)
      return;
    this.currentCalendarViewMode = mode;
    this.monthView.nativeElement.classList.remove("active");
    this.weekView.nativeElement.classList.remove("active");
    this.dayView.nativeElement.classList.remove("active");
    var newSelectDate: CalendarDay | null = selectedDate ? selectedDate : null;
    var newTopForDayView = "100vh";

    // TODO: maybe instead of scrolling from bottom to top, imitate a component switch
    // -> create a calendarMonthView, calendarWeekView and calendarDayView
    // -> when switching components, you can just use the default animation or just set left: -100 or left: 0

    switch(mode){
      case "month":
        this.monthView.nativeElement.classList.add("active");
        break;
      case "week": this.weekView.nativeElement.classList.add("active"); break;
      case "day":
        this.dayView.nativeElement.classList.add("active");
        newTopForDayView = this.innerWidth > 750? "180px" : "115px";
        if(this.selectedDate == null){
          var res = this.calendarData?.calendarDays.filter((date) => date.isToday == true);
          if(res) newSelectDate = res[0];
        }
        break;
      default: this.monthView.nativeElement.classList.add("active"); break;
    }

    this.calendarSingleDayWrapper.nativeElement.style.top = newTopForDayView;
    this.selectedDate = newSelectDate;

  }

  getEventsFromBackend(){
    this.userService.getUserData().subscribe({
      next: (data) => {
        this.calendarEvents = (<User>data)?.calendarEvents;
        console.log(data)
        this.convertDateData();
        this.generateCalendar();
      },
      error: (error) => {
        this.calendarEvents = [];
        this.generateCalendar();
      }
    })
  }

  checkIfPartOfPreviousEvent(index: number): boolean{
    var check: boolean = false;
    if(index > 0){
      if( this.selectedDate!.hoursPerDay[index-1].event &&
          this.selectedDate!.hoursPerDay[index].event &&
          (this.selectedDate!.hoursPerDay[index].event?.id == this.selectedDate!.hoursPerDay[index-1].event?.id)
      ){
        check = true;
      }
    }
    return check;
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

  // this is more of a util function
  calculateTime(date: Date, duration: number){
    var endTime = "";
    const fullHour = Math.floor((date.getHours() * 60 + date.getMinutes() + duration) / 30 / 2);
    var minutes = ((date.getMinutes() + duration) % 60).toString()

    if(minutes == "0") minutes = "00"

    endTime = fullHour.toString() + ":" + minutes.toString()
    return endTime
  }

  selectEvent(selectedEventDateTime: CalendarDate | null){
    // TODO: Maybe we want to check if the event an event located in the past
    //  -> note:  this can be disadvantageous if the teacher or student misses to
    //            edit the event in time, after they agreed to move the event verbally
    //            The check for the new date in the event-details-component may be enough here
    if(selectedEventDateTime && !selectedEventDateTime.showEvent)
      selectedEventDateTime.showEvent = true;
  }
}
