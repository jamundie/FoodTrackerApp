## TDR-007: Split Date/Time Picker with Calendar Interface

**Date**: August 2025  
**Status**: Accepted  
**Context**: Users need intuitive date/time selection for meal logging with both quick access and precise control

### Decision
Implement a dual-picker system with separate date and time selectors, featuring an expandable calendar interface for date selection.

### Alternatives Considered
- **Single ISO timestamp input**: Manual entry of full ISO format
- **Native date/time pickers**: Platform-specific date/time components
- **Third-party date picker library**: External dependency like react-native-date-picker
- **Simple dropdown lists**: Basic day/time selection without calendar

### Rationale
- **User Experience**: Split interface is more intuitive than single timestamp input
- **Quick Access**: "Today"/"Yesterday" options for common use cases
- **Precision Control**: Full calendar allows selection of any past date
- **Visual Clarity**: Calendar grid provides clear date context and navigation
- **Consistent Styling**: Custom implementation matches app design system
- **No Dependencies**: Avoids external libraries and platform inconsistencies

### Implementation Details
```typescript
// Dual state management
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedTime, setSelectedTime] = useState({ 
  hours: new Date().getHours(), 
  minutes: 0 
});

// Calendar generation with metadata
const generateCalendarDays = (year: number, month: number) => {
  // 42-day grid with isSelectable, isToday, isCurrentMonth flags
};

// Smart time intervals
const timeOptions = Array.from({ length: 24 }, (_, hour) =>
  [0, 15, 30, 45].map(minute => ({ hour, minute }))
);
```

### Date Picker Features
- **Quick Selection**: Today/Yesterday buttons for common scenarios
- **Expandable Calendar**: Traditional month grid with navigation
- **Smart Restrictions**: Only past dates selectable, future dates disabled
- **Visual Indicators**: Today highlighted, selected date emphasized
- **Month Navigation**: Previous/next with intelligent boundary handling

### Time Picker Features
- **Structured Intervals**: 15-minute increments (00, 15, 30, 45)
- **Complete Coverage**: All 24 hours × 4 intervals = 96 time slots
- **User-Friendly Display**: 12-hour AM/PM format in UI
- **ISO Timestamp Output**: Combined date/time for consistent storage

### Consequences
- **Positive**: 
  - Intuitive user experience with both quick and precise options
  - No external dependencies or platform-specific behavior
  - Consistent visual design with app theme
  - Comprehensive test coverage possible with testID attributes
  - Flexible architecture for future enhancements
- **Negative**: 
  - Custom implementation requires more initial development time
  - Additional state management complexity
  - Larger component file size
- **Mitigation**: 
  - Well-structured helper functions keep code maintainable
  - Comprehensive test suite ensures reliability
  - Clear documentation for future developers

### Testing Strategy
- Unit tests for calendar generation logic
- Integration tests for date/time selection flow
- Accessibility testing for keyboard navigation
- Visual regression testing for calendar display
