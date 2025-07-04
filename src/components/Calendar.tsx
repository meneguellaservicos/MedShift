import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Shift } from '../types';

interface CalendarProps {
  selectedDates: string[];
  onDateSelect: (dates: string[]) => void;
  singleDateMode?: boolean;
  allShifts?: Shift[];
  focusOnSelectedDates?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ 
  selectedDates, 
  onDateSelect, 
  singleDateMode = false,
  allShifts = [],
  focusOnSelectedDates = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedDatesRef = useRef<HTMLParagraphElement>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.includes(formatDateString(date));
  };

  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if a date has existing shifts - Memoized
  const getShiftsForDate = useMemo(() => {
    return (date: Date): Shift[] => {
      const dateString = formatDateString(date);
      return allShifts.filter(shift => shift.startDate === dateString);
    };
  }, [allShifts]);

  const hasExistingShift = (date: Date): boolean => {
    return getShiftsForDate(date).length > 0;
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDateString(date);
    const isSelected = selectedDates.includes(dateString);

    if (singleDateMode) {
      // Single date mode for editing
      onDateSelect([dateString]);
    } else {
      // Multiple date mode for adding
      if (isSelected) {
        onDateSelect(selectedDates.filter(d => d !== dateString));
      } else {
        onDateSelect([...selectedDates, dateString]);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Memoized calculations to prevent unnecessary re-renders
  const days = useMemo(() => {
    return getDaysInMonth(currentMonth);
  }, [currentMonth]);

  // Get shifts for the current month to display in summary - Memoized
  const currentMonthShifts = useMemo(() => {
    return allShifts.filter(shift => {
      const shiftDate = new Date(shift.startDate);
      return shiftDate.getMonth() === currentMonth.getMonth() && 
             shiftDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [allShifts, currentMonth]);

  useEffect(() => {
    if (focusOnSelectedDates && selectedDates.length > 0) {
      selectedDatesRef.current?.focus();
    }
  }, [selectedDates, focusOnSelectedDates]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Month Summary */}
      {currentMonthShifts.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📅 {currentMonthShifts.length} plantão(ões) neste mês
          </p>
        </div>
      )}

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-10" />;
          }

          const isSelected = isDateSelected(date);
          const isPast = isDateInPast(date);
          const hasShift = hasExistingShift(date);
          const shiftsForDate = getShiftsForDate(date);

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              className={`h-10 w-full rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg z-10'
                  : hasShift
                  ? isPast
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                  : isPast
                  ? 'text-gray-500 hover:bg-gray-50'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
              title={hasShift ? `${shiftsForDate.length} plantão(ões) nesta data` : undefined}
            >
              {date.getDate()}
              {hasShift && !isSelected && (
                <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                  isPast 
                    ? 'bg-gray-500' 
                    : 'bg-green-500'
                }`} />
              )}
              {shiftsForDate.length > 1 && !isSelected && (
                <div className={`absolute bottom-1 right-1 text-xs font-bold ${
                  isPast 
                    ? 'text-gray-600' 
                    : 'text-green-600'
                }`}>
                  {shiftsForDate.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p 
            ref={selectedDatesRef}
            tabIndex={0}
            className="text-sm font-medium text-blue-900 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            {singleDateMode ? 'Data selecionada:' : `Datas selecionadas (${selectedDates.length}):`}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.sort().map(date => {
              const dateObj = new Date(date + 'T00:00:00');
              const isPastDate = isDateInPast(dateObj);
              const hasExistingShiftOnDate = hasExistingShift(dateObj);
              
              return (
                <span
                  key={date}
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    isPastDate 
                      ? 'bg-gray-100 text-gray-700' 
                      : hasExistingShiftOnDate
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {dateObj.toLocaleDateString('pt-BR')}
                  {isPastDate && (
                    <span className="ml-1 text-xs text-gray-500">(passado)</span>
                  )}
                  {hasExistingShiftOnDate && !isPastDate && (
                    <span className="ml-1 text-xs text-yellow-600">(tem plantão)</span>
                  )}
                  {!singleDateMode && (
                    <button
                      type="button"
                      onClick={() => onDateSelect(selectedDates.filter(d => d !== date))}
                      className={`ml-1 hover:text-red-600 ${
                        isPastDate ? 'text-gray-600' : 
                        hasExistingShiftOnDate ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-medium text-gray-700 mb-2">Legenda:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 rounded border border-green-300"></div>
            <span className="text-gray-600">Com plantão</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-teal-600 rounded"></div>
            <span className="text-gray-600">Selecionado</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Data passada</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          💡 <strong>Dica:</strong> Você pode selecionar datas passadas para registrar plantões já realizados.
          Datas com plantões existentes são destacadas em verde.
        </p>
      </div>
    </div>
  );
};

export default Calendar;