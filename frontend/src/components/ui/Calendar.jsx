import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
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
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={isDisabled || loading}
              className={`
                h-10 w-10 text-sm rounded-lg transition-all duration-200 relative
                ${isSelected 
                  ? 'bg-primary text-white font-semibold shadow-md' 
                  : isDisabled 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isAvailable && isCurrentMonth
                      ? 'text-green-600 bg-green-50 hover:bg-green-100 font-medium'
                      : isCurrentMonth
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300'
                }
                ${loading ? 'opacity-50' : ''}
              `}
            >
              {date.getDate()}
              {isAvailable && isCurrentMonth && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {loading && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Loading available dates...
        </div>
      )}
    </div>
  );
};

export default Calendar;
