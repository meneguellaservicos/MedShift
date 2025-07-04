import { format, parseISO, differenceInHours, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy');
};

export const formatDateWithWeekday = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEE, dd/MM/yyyy', { locale: ptBR });
};

export const formatTime = (time: string): string => {
  return time;
};

// Create a DateTime object from date and time strings
export const createDateTime = (dateStr: string, timeStr: string): Date => {
  return new Date(`${dateStr}T${timeStr}`);
};

// Check if two time intervals overlap
export const areIntervalsOverlapping = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

export const calculateShiftHours = (
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): number => {
  const start = createDateTime(startDate, startTime);
  const end = createDateTime(endDate, endTime);
  
  // Calculate duration in milliseconds and convert to hours
  const durationMs = end.getTime() - start.getTime();
  return Math.abs(durationMs) / (1000 * 60 * 60);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

// Get upcoming shifts (considerando data e horário)
export const getUpcomingShifts = (shifts: any[]): any[] => {
  const now = new Date();
  return shifts.filter(shift => {
    const shiftStart = createDateTime(shift.startDate, shift.startTime);
    return shiftStart >= now;
  });
};

// Sort shifts chronologically (oldest first)
export const sortShiftsChronologically = (shifts: any[]): any[] => {
  return [...shifts].sort((a, b) => {
    const dateA = createDateTime(a.startDate, a.startTime);
    const dateB = createDateTime(b.startDate, b.startTime);
    return dateA.getTime() - dateB.getTime();
  });
};

// Calcula diferença de dias entre duas datas (ignorando horas/minutos)
export const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};