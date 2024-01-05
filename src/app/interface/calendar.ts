import { EventRepetitionEnum } from "../enum/EventRepetition";
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
export interface CalendarDay {
  // represents day, month and year without time
  date: Date;
  isSelected: boolean | null;
  isToday: boolean;
  hasEvent: boolean;

  hoursPerDay: CalendarDate[];
}
export interface CalendarDate {
  // important are hours and minutes
  id?: number;
  dateTime: Date;
  events?: CalendarEvent[];
  showEvent?: boolean | null;
}

export interface CalendarEvent {
  id?: number;
  eventName: string;
  eventDescription: string;
  eventDuration: number;
  eventDate: CalendarDate;
  // these two should be mandatory
  eventUsers?: User[];
  eventPlace?: string;
  isAnonymousEvent?: boolean;
}

