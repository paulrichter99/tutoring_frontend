export interface CalendarDate {
  date: Date;
  isSelected: boolean | null;
  isToday: boolean;
  events: CalendarEvent[] | null;
}

export interface CalendarMonth {
  year: number;
  month: number;
}

export interface CalendarData {
  currentMonth: CalendarMonth;
  selectedDate: CalendarDate | null;
  calendarDates: CalendarDate[];
}

export interface CalendarEvent {
  name: string;
  description? : string;
}
