import { CalendarEvent } from "./calendar";

export interface User {
  username: string;

  firstName?: string;
  lastName?: string;
  address?: string;
  birthday?: Date;

  phoneNumber?: string;
  email?: string;

  grade?: number;
  school?: string;
  schoolForm?: string;

  subjects?: string[];
  isTutor?: boolean;

  calendarEvents: CalendarEvent[];
}

export interface LoginRequest {
  username: string;
  password: string;
}
