import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ShiftType = 'M1' | 'M2' | 'FREE' | 'AFTERNOON' | 'FULL';

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

  // Reference start date for the schedule cycle (Week 1 M1 starts on this day)
  scheduleStartDate = new Date(2025, 9, 13); // October 13, 2025 (Monday)

  currentMonth = computed(() => {
    const monthYear = this.currentDate().toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
    // Capitalize first letter
    return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  });

  /**
   * Calculates the shift type for a given date based on the 4-week rotation
   * Week 1: M1 (Mon-Fri), FREE (Sat-Sun)
   * Week 2: M2 (Mon-Fri), FREE (Sat-Sun)
   * Week 3: FREE (Mon-Fri), FULL (Sat-Sun)
   * Week 4: AFTERNOON (Mon-Fri), FREE (Sat-Sun)
   */
  private getShiftType(date: Date): ShiftType {
    // Calculate days since schedule start
    const daysSinceStart = Math.floor(
      (date.getTime() - this.scheduleStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate which week in the 4-week cycle (0-3)
    // Use modulo that handles negative numbers correctly
    const weeksSinceStart = Math.floor(daysSinceStart / 7);
    let weekInCycle = weeksSinceStart % 4;

    // Handle negative modulo for dates before the seed date
    if (weekInCycle < 0) {
      weekInCycle = (weekInCycle + 4) % 4;
    }

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();

    // Check if weekend (Saturday = 6, Sunday = 0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    switch (weekInCycle) {
      case 0: // Week 1: M1 (Mon-Fri), FREE (Sat-Sun)
        return isWeekend ? 'FREE' : 'M1';
      case 1: // Week 2: M2 (Mon-Fri), FREE (Sat-Sun)
        return isWeekend ? 'FREE' : 'M2';
      case 2: // Week 3: FREE (Mon-Fri), FULL (Sat-Sun)
        return isWeekend ? 'FULL' : 'FREE';
      case 3: // Week 4: AFTERNOON (Mon-Fri), FREE (Sat-Sun)
        return isWeekend ? 'FREE' : 'AFTERNOON';
      default:
        return 'FREE';
    }
  }

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
        shiftType: this.getShiftType(date)
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
        shiftType: this.getShiftType(date)
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
        shiftType: this.getShiftType(date)
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
