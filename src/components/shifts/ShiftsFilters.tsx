import React from 'react';
import { Filter, CalendarDays } from 'lucide-react';
import { Hospital } from '../../types';

interface ShiftsFiltersProps {
  hospitals: Hospital[];
  filterHospitalId: string;
  filterPaidStatus: 'all' | 'paid' | 'pending';
  filterPeriod: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'last3Months' | 'last6Months' | 'thisYear';
  filteredShiftsCount: number;
  totalShiftsCount: number;
  onFilterHospitalChange: (value: string) => void;
  onFilterPaidStatusChange: (value: 'all' | 'paid' | 'pending') => void;
  onFilterPeriodChange: (value: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'last3Months' | 'last6Months' | 'thisYear') => void;
  getPeriodLabel: () => string;
}

const ShiftsFilters: React.FC<ShiftsFiltersProps> = ({
  hospitals,
  filterHospitalId,
  filterPaidStatus,
  filterPeriod,
  filteredShiftsCount,
  totalShiftsCount,
  onFilterHospitalChange,
  onFilterPaidStatusChange,
  onFilterPeriodChange,
  getPeriodLabel,
}) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20 dark:border-gray-700/20">
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
        </div>
        
        {/* Hospital Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hospital:</label>
          <select
            value={filterHospitalId}
            onChange={(e) => onFilterHospitalChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os hospitais</option>
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name} {hospital.isDisabled ? '(Desabilitado)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Period Filter */}
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
          <select
            value={filterPeriod}
            onChange={(e) => onFilterPeriodChange(e.target.value as typeof filterPeriod)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="thisWeek">Esta semana</option>
            <option value="thisMonth">Este mês</option>
            <option value="last30Days">Últimos 30 dias</option>
            <option value="last3Months">Últimos 3 meses</option>
            <option value="last6Months">Últimos 6 meses</option>
            <option value="thisYear">Este ano</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => onFilterPaidStatusChange('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterPaidStatus === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => onFilterPaidStatusChange('paid')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterPaidStatus === 'paid'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => onFilterPaidStatusChange('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterPaidStatus === 'pending'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-300 lg:ml-auto">
          <span className="font-medium">{filteredShiftsCount}</span> de <span className="font-medium">{totalShiftsCount}</span> plantões
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getPeriodLabel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftsFilters; 