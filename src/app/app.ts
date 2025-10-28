import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';

@Component({
  imports: [CalendarComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'manantial';
}
