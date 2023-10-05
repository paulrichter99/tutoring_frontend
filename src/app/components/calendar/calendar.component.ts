import { Component, ElementRef, HostBinding, HostListener, OnInit, ViewChild } from '@angular/core';
import { CalendarMonth, CalendarDate, CalendarData, CalendarEvent } from 'src/app/interface/calendar';

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

  hours: string[] = [];
  weekDays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  currentMonth!: CalendarMonth;
  calendarData: CalendarData | null = null;
  emptyCellsBefore: number[] = [];
  emptyCellsAfter: number[] = [];
  selectedDate: CalendarDate | null = null;

  innerWidth: number = 0;

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    // TODO: instead of this use the event data structure and fill it with empty events
    for (let i = 6; i <= 20; i++) {
      this.hours.push(`${i}`);
    }
    // Initialize the calendar when the component is created.
    this.currentMonth = this.getCurrentMonth();
    this.calendarData = {} as CalendarData
    this.calendarData.currentMonth = this.currentMonth;
    this.calendarData.selectedDate = this.selectedDate;
    this.generateCalendar();
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
      this.calendarData.calendarDates = [];
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

      // This is dummy generation, normally events should be imported from the logged in user
      var events: CalendarEvent[] = [];
      var event: CalendarEvent = {"name": "Nachhilfe", "description":"13:30 - 15:00"};
      if(i%5 == 0 || i%8 == 0 || i == 4)
        events.push(event)

      this.calendarData?.calendarDates.push({ date, isSelected, isToday, events});
    }
    let a = 41;
    for(let i = 42; i > (this.calendarData!.calendarDates.length+this.emptyCellsBefore.length); i--){
      this.emptyCellsAfter.push(i - a);
      a = a-2;
    }
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
  selectDate(selectedDate: CalendarDate) {
    if(!selectedDate) return

    this.selectedDate = selectedDate;
    this.monthView.nativeElement.classList.remove("active");
    this.weekView.nativeElement.classList.remove("active");
    this.dayView.nativeElement.classList.add("active");
    this.calendarData!.calendarDates.forEach(day => {
      if(day == this.selectedDate) day.isSelected = true;
      else day.isSelected = false
    })
    this.changeCalendarDisplayMode("day", this.selectedDate);
  }

  changeCalendarDisplayMode(mode: String, selectedDate?: CalendarDate | null){
    this.monthView.nativeElement.classList.remove("active");
    this.weekView.nativeElement.classList.remove("active");
    this.dayView.nativeElement.classList.remove("active");
    var newSelectDate: CalendarDate | null = selectedDate ? selectedDate : null;
    var newTopForDayView = "100vh";

    switch(mode){
      case "month": this.monthView.nativeElement.classList.add("active"); break;
      case "week": this.weekView.nativeElement.classList.add("active"); break;
      case "day":
        this.dayView.nativeElement.classList.add("active");
        newTopForDayView = this.innerWidth > 750? "180px" : "115px";
        if(this.selectedDate == null){
          var res = this.calendarData?.calendarDates.filter((date) => date.isToday == true);
          if(res) newSelectDate = res[0];
        }
        break;
      default: this.monthView.nativeElement.classList.add("active"); break;
    }

    this.calendarSingleDayWrapper.nativeElement.style.top = newTopForDayView;
    this.selectedDate = newSelectDate;

  }
}
