import { User } from "./user";


export interface CalendarData {
  currentMonth: CalendarMonth;
  selectedDate: CalendarDay | null;
  calendarDays: CalendarDay[];
}
export interface CalendarMonth {
  year: number;
  month: number;
}
/* ******************************************* */
// this could be used to represent a day in the calendar
// it should hold an array, that stores a new object for every hour, that
// can only hold one event. This would untangle the code a bit, since
// CalendarDate is currently the placeholder for a day holding the hours in frontend,
// but CalendarDate in the backend is one specific point at a day (hours:minutes)
export interface CalendarDay {
  // represents day, month and year without time
  date: Date;
  isSelected: boolean | null;
  isToday: boolean;
  hasEvent: boolean;

  hoursPerDay: CalendarDate[];
}
export interface CalendarDate {
  dateTime: Date; //with minutes and hours, can be compared
  event: CalendarEvent | null;
  // we could compare event.eventDates.indexOf(date) or something
}
/* ******************************************* */
export interface CalendarDate2 {
  currentDate: Date;
  isSelected: boolean | null;
  isToday: boolean;
  events: CalendarEvent[] | null;
  hoursPerDate: Date[];
}

export interface CalendarEvent {
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventDuration: number;
  eventDates: CalendarDate[];
  // these two should be mandatory
  eventUsers?: User[];
}

