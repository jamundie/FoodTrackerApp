/**
 * Utility functions for date and time formatting and ID generation
 */

// Combines timestamp + random hex to avoid collisions under rapid submission
export const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export const formatDisplayDate = (date: Date): string => {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) {
    return "Today";
  }
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDisplayTime = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${paddedMinutes} ${period}`;
};

export const createTimestamp = (selectedDate: Date, selectedTime: { hours: number; minutes: number }): string => {
  const combinedDateTime = new Date(selectedDate);
  combinedDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
  return combinedDateTime.toISOString();
};

/** Returns true when two Date objects fall on the same calendar day. */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Local calendar date as YYYY-MM-DD — the format the health-report Edge Function expects. */
export const toDateOnly = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** `days`-long period ending today, as YYYY-MM-DD strings for generateHealthReport(periodStart, periodEnd). */
export const getPeriodDateRange = (days: number, referenceDate: Date = new Date()): { periodStart: string; periodEnd: string } => {
  const end = new Date(referenceDate);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  return { periodStart: toDateOnly(start), periodEnd: toDateOnly(end) };
};
