import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getShiftType, ShiftType } from './shift';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  shiftType: ShiftType;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent {
  currentDate = signal(new Date());
  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  currentMonth = computed(() => {
    const monthYear = this.currentDate().toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
    // Capitalize first letter
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  });

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the current month
    const firstDay = new Date(year, month, 1);
    // Last day of the current month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    // We need to adjust so Monday = 0
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Sunday becomes 6

    // Days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;

    // Days to show from next month (to fill the grid)
    const totalCells = Math.ceil((daysFromPrevMonth + lastDay.getDate()) / 7) * 7;
    const daysFromNextMonth = totalCells - (daysFromPrevMonth + lastDay.getDate());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        shiftType: getShiftType(date)
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        shiftType: getShiftType(date)
      });
    }

    // Add days from next month
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        shiftType: getShiftType(date)
      });
    }

    return days;
  });

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }
}
