import { useState, useMemo } from 'react';
import { parseISO } from 'date-fns';
import { Shift } from '../../../types';

type FilterPeriod = 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'last3Months' | 'last6Months' | 'thisYear';
type FilterPaidStatus = 'all' | 'paid' | 'pending';

interface UseShiftsFiltersReturn {
  filterHospitalId: string;
  filterPaidStatus: FilterPaidStatus;
  filterPeriod: FilterPeriod;
  setFilterHospitalId: (value: string) => void;
  setFilterPaidStatus: (value: FilterPaidStatus) => void;
  setFilterPeriod: (value: FilterPeriod) => void;
  filteredShifts: Shift[];
  getPeriodLabel: () => string;
}

export const useShiftsFilters = (shifts: Shift[]): UseShiftsFiltersReturn => {
  const [filterHospitalId, setFilterHospitalId] = useState<string>('');
  const [filterPaidStatus, setFilterPaidStatus] = useState<FilterPaidStatus>('all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('thisMonth');

  // Filter shifts based on criteria - Memoized to prevent unnecessary re-renders
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const hospitalMatch = filterHospitalId === '' || shift.hospitalId === filterHospitalId;
      const paidMatch = filterPaidStatus === 'all' || 
        (filterPaidStatus === 'paid' && shift.isPaid) ||
        (filterPaidStatus === 'pending' && !shift.isPaid);
      
      // Period filter with proper date boundaries
      let periodMatch = true;
      if (filterPeriod !== 'all') {
        const shiftDate = parseISO(shift.startDate);
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        switch (filterPeriod) {
          case 'today': {
            const todayStr = today.toISOString().split('T')[0];
            periodMatch = shift.startDate === todayStr;
            break;
          }
          case 'thisWeek': {
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            periodMatch = shiftDate >= startOfWeek && shiftDate < endOfWeek;
            break;
          }
          case 'thisMonth': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            periodMatch = shiftDate >= startOfMonth && shiftDate < endOfMonth;
            break;
          }
          case 'last30Days': {
            const start30Days = new Date(startOfToday);
            start30Days.setDate(startOfToday.getDate() - 30);
            periodMatch = shiftDate >= start30Days && shiftDate < endOfToday;
            break;
          }
          case 'last3Months': {
            const start3Months = new Date(today);
            start3Months.setMonth(today.getMonth() - 3);
            start3Months.setHours(0, 0, 0, 0);
            periodMatch = shiftDate >= start3Months && shiftDate < endOfToday;
            break;
          }
          case 'last6Months': {
            const start6Months = new Date(today);
            start6Months.setMonth(today.getMonth() - 6);
            start6Months.setHours(0, 0, 0, 0);
            periodMatch = shiftDate >= start6Months && shiftDate < endOfToday;
            break;
          }
          case 'thisYear': {
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear() + 1, 0, 1);
            periodMatch = shiftDate >= startOfYear && shiftDate < endOfYear;
            break;
          }
        }
      }
      
      return hospitalMatch && paidMatch && periodMatch;
    });
  }, [shifts, filterHospitalId, filterPaidStatus, filterPeriod]);

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'today': return 'Hoje';
      case 'thisWeek': return 'Esta semana';
      case 'thisMonth': return 'Este mês';
      case 'last30Days': return 'Últimos 30 dias';
      case 'last3Months': return 'Últimos 3 meses';
      case 'last6Months': return 'Últimos 6 meses';
      case 'thisYear': return 'Este ano';
      default: return 'Todos os períodos';
    }
  };

  return {
    filterHospitalId,
    filterPaidStatus,
    filterPeriod,
    setFilterHospitalId,
    setFilterPaidStatus,
    setFilterPeriod,
    filteredShifts,
    getPeriodLabel,
  };
}; 