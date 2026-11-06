import { getShiftType } from './shift';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('getShiftType', () => {
  it('keeps the pre-schedule rules', () => {
    expect(getShiftType(d(2025, 12, 28))).toBe('FULL');
    expect(getShiftType(d(2026, 1, 2))).toBe('FULL');
    expect(getShiftType(d(2026, 1, 6))).toBe('FREE');
  });

  it('keeps the 2026 rotation untouched', () => {
    expect(getShiftType(d(2026, 1, 10))).toBe('FULL');
    expect(getShiftType(d(2026, 1, 12))).toBe('AFTERNOON');
    expect(getShiftType(d(2026, 1, 19))).toBe('M1');
    expect(getShiftType(d(2026, 1, 26))).toBe('M2');
    expect(getShiftType(d(2026, 2, 7))).toBe('FULL');
    expect(getShiftType(d(2026, 3, 30))).toBe('FREE'); // across DST change
    expect(getShiftType(d(2026, 7, 15))).toBe('M2');
    expect(getShiftType(d(2026, 12, 21))).toBe('M1');
    expect(getShiftType(d(2026, 12, 28))).toBe('M2');
    expect(getShiftType(d(2027, 1, 3))).toBe('FREE');
  });

  it('matches the previous formula for every day of 2026', () => {
    const previous = (date: Date) => {
      const days = Math.floor(
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2026, 0, 5)) / 86400000,
      );
      const week = (Math.floor(days / 7) + 2) % 4;
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      return [weekend ? 'FREE' : 'M1', weekend ? 'FREE' : 'M2', weekend ? 'FULL' : 'FREE', weekend ? 'FREE' : 'AFTERNOON'][week];
    };
    for (let day = d(2026, 1, 10); day <= d(2027, 1, 3); day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      expect(getShiftType(day)).toBe(previous(day));
    }
  });

  it('restarts the rotation at M1 on Jan 4, 2027', () => {
    expect(getShiftType(d(2027, 1, 4))).toBe('M1');
    expect(getShiftType(d(2027, 1, 8))).toBe('M1');
    expect(getShiftType(d(2027, 1, 9))).toBe('FREE');
    expect(getShiftType(d(2027, 1, 10))).toBe('FREE');
    expect(getShiftType(d(2027, 1, 11))).toBe('M2');
    expect(getShiftType(d(2027, 1, 18))).toBe('FREE');
    expect(getShiftType(d(2027, 1, 23))).toBe('FULL');
    expect(getShiftType(d(2027, 1, 24))).toBe('FULL');
    expect(getShiftType(d(2027, 1, 25))).toBe('AFTERNOON');
    expect(getShiftType(d(2027, 2, 1))).toBe('M1');
    expect(getShiftType(d(2027, 3, 29))).toBe('M1'); // across DST change
  });
});
