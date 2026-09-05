import { formatDisplayDate, formatDisplayTime, createTimestamp, toDateOnly, getPeriodDateRange } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDisplayDate', () => {
    test('returns "Today" for current date', () => {
      const today = new Date();
      expect(formatDisplayDate(today)).toBe('Today');
    });

    test('returns formatted date for non-current date', () => {
      const testDate = new Date('2025-08-01T12:00:00.000Z');
      const result = formatDisplayDate(testDate);
      
      // Should contain day abbreviation, month abbreviation, and day number
      expect(result).toMatch(/\w{3}, \w{3} \d{1,2}/);
    });

    test('handles different dates correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = formatDisplayDate(yesterday);
      expect(result).not.toBe('Today');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDisplayTime', () => {
    test('formats morning time correctly', () => {
      expect(formatDisplayTime(9, 30)).toBe('9:30 AM');
      expect(formatDisplayTime(0, 0)).toBe('12:00 AM');
      expect(formatDisplayTime(11, 45)).toBe('11:45 AM');
    });

    test('formats afternoon/evening time correctly', () => {
      expect(formatDisplayTime(13, 15)).toBe('1:15 PM');
      expect(formatDisplayTime(18, 0)).toBe('6:00 PM');
      expect(formatDisplayTime(23, 59)).toBe('11:59 PM');
    });

    test('formats noon correctly', () => {
      expect(formatDisplayTime(12, 0)).toBe('12:00 PM');
      expect(formatDisplayTime(12, 30)).toBe('12:30 PM');
    });

    test('pads minutes correctly', () => {
      expect(formatDisplayTime(9, 5)).toBe('9:05 AM');
      expect(formatDisplayTime(15, 1)).toBe('3:01 PM');
      expect(formatDisplayTime(8, 0)).toBe('8:00 AM');
    });
  });

  describe('createTimestamp', () => {
    test('creates correct ISO timestamp', () => {
      const testDate = new Date('2025-08-04');
      const testTime = { hours: 14, minutes: 30 };
      
      const result = createTimestamp(testDate, testTime);
      
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      const parsedDate = new Date(result);
      expect(parsedDate.getHours()).toBe(14);
      expect(parsedDate.getMinutes()).toBe(30);
      expect(parsedDate.getSeconds()).toBe(0);
      expect(parsedDate.getMilliseconds()).toBe(0);
    });

    test('handles midnight correctly', () => {
      const testDate = new Date('2025-08-04');
      const testTime = { hours: 0, minutes: 0 };
      
      const result = createTimestamp(testDate, testTime);
      const parsedDate = new Date(result);
      
      expect(parsedDate.getHours()).toBe(0);
      expect(parsedDate.getMinutes()).toBe(0);
    });

    test('handles different time combinations', () => {
      const testDate = new Date('2025-08-04');
      const testTime = { hours: 23, minutes: 59 };
      
      const result = createTimestamp(testDate, testTime);
      const parsedDate = new Date(result);
      
      expect(parsedDate.getHours()).toBe(23);
      expect(parsedDate.getMinutes()).toBe(59);
    });

    test('preserves date while setting time', () => {
      const testDate = new Date('2025-12-25');
      const testTime = { hours: 10, minutes: 15 };
      
      const result = createTimestamp(testDate, testTime);
      const parsedDate = new Date(result);
      
      expect(parsedDate.getFullYear()).toBe(2025);
      expect(parsedDate.getMonth()).toBe(11); // December is month 11
      expect(parsedDate.getDate()).toBe(25);
      expect(parsedDate.getHours()).toBe(10);
      expect(parsedDate.getMinutes()).toBe(15);
    });
  });

  describe('toDateOnly', () => {
    test('formats a date as YYYY-MM-DD', () => {
      expect(toDateOnly(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    test('pads single-digit month and day', () => {
      expect(toDateOnly(new Date(2026, 8, 9))).toBe('2026-09-09');
    });

    test('handles December correctly', () => {
      expect(toDateOnly(new Date(2025, 11, 25))).toBe('2025-12-25');
    });
  });

  describe('getPeriodDateRange', () => {
    test('7-day period ends on the reference date and starts 6 days earlier', () => {
      const reference = new Date(2026, 8, 10); // 10 Sep 2026
      const { periodStart, periodEnd } = getPeriodDateRange(7, reference);
      expect(periodEnd).toBe('2026-09-10');
      expect(periodStart).toBe('2026-09-04');
    });

    test('30-day period spans 30 calendar days inclusive', () => {
      const reference = new Date(2026, 8, 30);
      const { periodStart, periodEnd } = getPeriodDateRange(30, reference);
      expect(periodEnd).toBe('2026-09-30');
      expect(periodStart).toBe('2026-09-01');
    });

    test('90-day period crosses a year boundary correctly', () => {
      const reference = new Date(2026, 0, 15); // 15 Jan 2026
      const { periodStart, periodEnd } = getPeriodDateRange(90, reference);
      expect(periodEnd).toBe('2026-01-15');
      expect(periodStart).toBe('2025-10-18');
    });

    test('defaults to the current date when no reference is given', () => {
      const { periodEnd } = getPeriodDateRange(7);
      expect(periodEnd).toBe(toDateOnly(new Date()));
    });
  });
});
