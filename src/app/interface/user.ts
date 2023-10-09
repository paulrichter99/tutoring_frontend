import { CalendarEvent } from "./calendar";

export interface User {
  username: string;
  calendarEvents: CalendarEvent[];
}

export interface LoginRequest {
  username: string;
  password: string;
}
