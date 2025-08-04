import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { styles } from "../styles/food.styles";

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

export default function DatePickerModal({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
}: DatePickerModalProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date <= today;
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelectable: isPast && isCurrentMonth
      });
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
    setShowCalendar(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownModal}>
          <Text style={styles.dropdownHeader}>Select Date</Text>
          <ScrollView>
            {/* Quick Options */}
            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => handleDateSelect(new Date())}
              testID="date-today"
            >
              <Text style={styles.categoryOptionText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                handleDateSelect(yesterday);
              }}
              testID="date-yesterday"
            >
              <Text style={styles.categoryOptionText}>Yesterday</Text>
            </TouchableOpacity>

            {/* Separator / Calendar Toggle */}
            <TouchableOpacity 
              style={styles.dateSeparator}
              onPress={() => setShowCalendar(!showCalendar)}
              testID="calendar-toggle-button"
            >
              <Text style={styles.dateSeparatorText}>
                Or choose a specific date {showCalendar ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                {/* Calendar Header */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity
                    style={styles.calendarNavButton}
                    onPress={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCalendarDate(newDate);
                    }}
                    testID="calendar-prev-month"
                  >
                    <Text style={styles.calendarNavText}>◀</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.calendarHeaderText}>
                    {calendarDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.calendarNavButton,
                      calendarDate.getMonth() === new Date().getMonth() && 
                      calendarDate.getFullYear() === new Date().getFullYear() && 
                      styles.calendarNavButtonDisabled
                    ]}
                    onPress={() => {
                      const newDate = new Date(calendarDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      const today = new Date();
                      if (newDate <= today) {
                        setCalendarDate(newDate);
                      }
                    }}
                    disabled={
                      calendarDate.getMonth() === new Date().getMonth() && 
                      calendarDate.getFullYear() === new Date().getFullYear()
                    }
                    testID="calendar-next-month"
                  >
                    <Text style={[
                      styles.calendarNavText,
                      calendarDate.getMonth() === new Date().getMonth() && 
                      calendarDate.getFullYear() === new Date().getFullYear() && 
                      styles.calendarNavTextDisabled
                    ]}>▶</Text>
                  </TouchableOpacity>
                </View>

                {/* Calendar Days of Week */}
                <View style={styles.calendarDaysHeader}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.calendarDayHeaderText}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                  {generateCalendarDays(calendarDate.getFullYear(), calendarDate.getMonth()).map((dayInfo, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        !dayInfo.isCurrentMonth && styles.calendarDayOtherMonth,
                        dayInfo.isToday && styles.calendarDayToday,
                        !dayInfo.isSelectable && styles.calendarDayDisabled,
                        dayInfo.date.toDateString() === selectedDate.toDateString() && styles.calendarDaySelected
                      ]}
                      onPress={() => {
                        if (dayInfo.isSelectable) {
                          handleDateSelect(dayInfo.date);
                        }
                      }}
                      disabled={!dayInfo.isSelectable}
                      testID={`calendar-day-${dayInfo.date.toISOString().split('T')[0]}`}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        !dayInfo.isCurrentMonth && styles.calendarDayTextOtherMonth,
                        dayInfo.isToday && styles.calendarDayTextToday,
                        !dayInfo.isSelectable && styles.calendarDayTextDisabled,
                        dayInfo.date.toDateString() === selectedDate.toDateString() && styles.calendarDayTextSelected
                      ]}>
                        {dayInfo.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
       
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
