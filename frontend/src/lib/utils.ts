import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a Date object to local YYYY-MM-DD string without UTC shift
 */
export function formatLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CalendarDay {
  month: string;
  dayNum: number;
  dayLabel: string;
  dateStr: string;
  isToday: boolean;
}

/**
 * Generate sequence of upcoming calendar days starting from today
 */
export function getUpcomingCalendarDays(count = 7): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = d.getDate();
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = formatLocalDateStr(d);

    days.push({
      month,
      dayNum,
      dayLabel,
      dateStr,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Parse a showDate string ('YYYY-MM-DD') and showTime string ('07:30 PM' or '19:30')
 * into a local Date object.
 */
export function getShowtimeDateObj(showDateStr: string, showTimeStr: string): Date | null {
  if (!showDateStr || !showTimeStr) return null;

  const dateParts = showDateStr.trim().split('-');
  if (dateParts.length !== 3) return null;

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  let hours = 0;
  let minutes = 0;

  // Match 12-hour format like "07:30 PM", "7:30 PM", "11:00 AM"
  const time12Match = showTimeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (time12Match) {
    hours = parseInt(time12Match[1], 10);
    minutes = parseInt(time12Match[2], 10);
    const modifier = time12Match[3]?.toUpperCase();

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    // Try 24-hour format "19:30"
    const time24Match = showTimeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (time24Match) {
      hours = parseInt(time24Match[1], 10);
      minutes = parseInt(time24Match[2], 10);
    } else {
      const fallback = new Date(`${showDateStr} ${showTimeStr}`);
      if (!isNaN(fallback.getTime())) {
        return fallback;
      }
      return null;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Checks if a specific screening (showDate + showTime) has already passed
 * relative to the current real time (or provided referenceDate).
 */
export function isShowtimePast(
  showDateStr: string,
  showTimeStr: string,
  referenceDate: Date = new Date()
): boolean {
  if (!showDateStr || !showTimeStr) return false;

  const showtimeDate = getShowtimeDateObj(showDateStr, showTimeStr);
  if (!showtimeDate) return false;

  return showtimeDate.getTime() <= referenceDate.getTime();
}

