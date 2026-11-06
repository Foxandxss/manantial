export type ShiftType = 'M1' | 'M2' | 'FREE' | 'AFTERNOON' | 'FULL';

/**
 * A rotation anchor: from `startMonday` onwards, the week starting on that
 * Monday is week `startWeekIndex` of the 4-week cycle (0 = M1, 1 = M2,
 * 2 = FREE/FULL, 3 = AFTERNOON). To restart the rotation on a new date,
 * append an anchor. Anchors must be sorted by date.
 */
interface RotationAnchor {
  startMonday: [year: number, monthIndex: number, day: number];
  startWeekIndex: number;
}

// Schedule starts on January 10, 2026 (Saturday - first FULL weekend)
const SCHEDULE_START = new Date(2026, 0, 10);

// Special FULL days before the schedule starts
const SPECIAL_FULL_DAYS = [
  new Date(2025, 11, 28).getTime(), // December 28, 2025
  new Date(2026, 0, 2).getTime(), // January 2, 2026
];

const ROTATION_ANCHORS: RotationAnchor[] = [
  // Week of Jan 5, 2026 is Week 3 (FREE weekdays, FULL weekend Jan 10-11)
  { startMonday: [2026, 0, 5], startWeekIndex: 2 },
  // Rotation restarts on Jan 4, 2027 at Week 1 (M1)
  { startMonday: [2027, 0, 4], startWeekIndex: 0 },
];

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Calculates the shift type for a given date.
 *
 * Before January 10, 2026:
 *   - Dec 28, 2025 and Jan 2, 2026: FULL
 *   - All other days: FREE
 *
 * From January 10, 2026 onwards, a 4-week rotation (weeks run Mon-Sun):
 *   Week 1: M1 (Mon-Fri), FREE (Sat-Sun)
 *   Week 2: M2 (Mon-Fri), FREE (Sat-Sun)
 *   Week 3: FREE (Mon-Fri), FULL (Sat-Sun)
 *   Week 4: AFTERNOON (Mon-Fri), FREE (Sat-Sun)
 *
 * The rotation is anchored per period (see ROTATION_ANCHORS):
 *   - Jan 5, 2026 - Jan 3, 2027: the week of Jan 5, 2026 is Week 3
 *   - From Jan 4, 2027: the week of Jan 4, 2027 is Week 1 (M1)
 */
export function getShiftType(date: Date): ShiftType {
  if (date < SCHEDULE_START) {
    const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return SPECIAL_FULL_DAYS.includes(dateTime) ? 'FULL' : 'FREE';
  }

  // Use UTC to avoid DST issues (e.g., March DST transition causing off-by-one errors)
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  // Pick the latest anchor that starts on or before the date
  let anchor = ROTATION_ANCHORS[0];
  let anchorUtc = Date.UTC(...anchor.startMonday);
  for (const candidate of ROTATION_ANCHORS) {
    const candidateUtc = Date.UTC(...candidate.startMonday);
    if (candidateUtc <= dateUtc) {
      anchor = candidate;
      anchorUtc = candidateUtc;
    }
  }

  const weeksSinceAnchor = Math.floor((dateUtc - anchorUtc) / DAY_MS / 7);
  const weekInCycle = (weeksSinceAnchor + anchor.startWeekIndex) % 4;

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  switch (weekInCycle) {
    case 0:
      return isWeekend ? 'FREE' : 'M1';
    case 1:
      return isWeekend ? 'FREE' : 'M2';
    case 2:
      return isWeekend ? 'FULL' : 'FREE';
    case 3:
      return isWeekend ? 'FREE' : 'AFTERNOON';
    default:
      return 'FREE';
  }
}
