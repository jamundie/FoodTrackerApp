/**
 * Utility functions for date and time formatting
 */

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
