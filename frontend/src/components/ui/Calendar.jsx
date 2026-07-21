import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to format date consistently
const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse a YYYY-MM-DD string as a LOCAL date (midnight local time)
const parseLocalDateString = (ymd) => {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d); // Local time
};

const Calendar = ({
  selectedDate,
  onDateSelect,
  availableDates = [],
  minDate = null,
  loading = false,
  className = '',
  onMonthChange = null
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the first Sunday of the calendar view
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End at the last Saturday of the calendar view
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);

    // Notify parent component of month change
    if (onMonthChange) {
      onMonthChange(newMonth);
    }
  };

  const isDateAvailable = (date) => {
    const dateStr = formatDateToString(date);
    return availableDates.includes(dateStr);
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (date < today) return true;

    // Disable dates before minDate if provided
    if (minDate) {
      const min = typeof minDate === 'string' ? parseLocalDateString(minDate) : new Date(minDate);
      if (min && date < min) return true;
    }

    // Disable dates not in current month that aren't available
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    if (!isCurrentMonth) return true;

    // If we have available dates, only enable those
    if (availableDates.length > 0) {
      return !isDateAvailable(date);
    }

    return false;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    const dateStr = formatDateToString(date);
    return dateStr === selectedDate;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    const dateStr = formatDateToString(date);
    console.log('Calendar: Date clicked:', date, 'Formatted:', dateStr);
    onDateSelect(dateStr);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
          className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <h3 className="text-lg font-semibold text-foreground" aria-live="polite">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <button
          type="button"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
          className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((date, index) => {
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const isAvailable = isDateAvailable(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

          const dayLabel = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const statusLabel = isSelected
            ? ', selected'
            : isDisabled
              ? ', unavailable'
              : isAvailable && isCurrentMonth
                ? ', available'
                : '';

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={isDisabled || loading}
              aria-label={`${dayLabel}${statusLabel}`}
              aria-pressed={isSelected}
              className={`
                h-10 w-10 text-sm rounded-lg transition-all duration-200 relative
                ${isSelected
                  ? 'bg-gradient-to-br from-brand-cyan to-brand-teal text-white font-semibold shadow-md'
                  : isDisabled
                    ? 'text-muted-foreground/50 cursor-not-allowed'
                    : isAvailable && isCurrentMonth
                      ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20 font-medium'
                      : isCurrentMonth
                        ? 'text-foreground hover:bg-foreground/5'
                        : 'text-muted-foreground/50'
                }
                ${loading ? 'opacity-50' : ''}
              `}
            >
              {date.getDate()}
              {isAvailable && isCurrentMonth && !isSelected && (
                <div aria-hidden="true" className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500/20 rounded border border-green-500/40"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-foreground/5 rounded border border-border"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-brand-cyan rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Loading available dates...
        </div>
      )}
    </div>
  );
};

export default Calendar;
