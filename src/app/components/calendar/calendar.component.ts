import { Component, HostBinding, OnInit } from '@angular/core';
import { CalendarMonth, CalendarDate, CalendarData } from 'src/app/interface/calendar';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  weekDays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  currentMonth!: CalendarMonth;
  calendarData: CalendarData | null = null;
  emptyCellsBefore: number[] = [];
  emptyCellsAfter: number[] = [];
  selectedDate: CalendarDate | null = null;

  ngOnInit() {
    // Initialize the calendar when the component is created.
    this.currentMonth = this.getCurrentMonth();
    this.calendarData = {} as CalendarData
    this.calendarData.currentMonth = this.currentMonth;
    this.calendarData.selectedDate = this.selectedDate;
    this.generateCalendar();
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
      if(isToday) isSelected = true;

      this.calendarData?.calendarDates.push({ date, isSelected, isToday });
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
    this.calendarData!.calendarDates.forEach(day => {
      if(day == this.selectedDate) day.isSelected = true;
      else day.isSelected = false
    })
  }
}
