import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface InternalStateType {
  [key: string]: any;
}

@Injectable()
export class CalendarConnector {

  public calendarId: string = '0mbcoaqok78epqtgqcegk21n48@group.calendar.google.com';
  public apiKey: string = 'AIzaSyBJXXJXd4Has2vTZvwL8lVYL3dMu1rCEFc';

  constructor(
    public http: HttpClient
  ) { }

  // en.romanian#holiday@group.v.calendar.google.com - Holidays Calendar

  public getEvents() {
    return this.http
      .get(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events?key=${this.apiKey}`);
  }

}
