import { formatDisplayDate, formatDisplayTime, createTimestamp } from '../dateUtils';

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
});
