import React from 'react';

interface ReportsFiltersProps {
  hospitals: { id: string; name: string; isDisabled?: boolean }[];
  filterHospitalId: string;
  setFilterHospitalId: (id: string) => void;
  filterDateRange: string;
  setFilterDateRange: (range: string) => void;
  getDateRangeLabel: () => string;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  hospitals,
  filterHospitalId,
  setFilterHospitalId,
  filterDateRange,
  setFilterDateRange,
  getDateRangeLabel,
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20 dark:border-gray-700/20">
    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
      </div>
      {/* Hospital Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hospital:</label>
        <select
          value={filterHospitalId}
          onChange={(e) => setFilterHospitalId(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todos os hospitais</option>
          {hospitals.filter(h => !h.isDisabled).map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>
      {/* Date Range Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</label>
        <select
          value={filterDateRange}
          onChange={(e) => setFilterDateRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os períodos</option>
          <option value="thisMonth">Este mês</option>
          <option value="lastMonth">Último mês</option>
          <option value="last3Months">Últimos 3 meses</option>
          <option value="last6Months">Últimos 6 meses</option>
          <option value="lastYear">Último ano</option>
        </select>
      </div>
      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-300 md:ml-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {getDateRangeLabel()}
        </div>
      </div>
    </div>
  </div>
);

export default ReportsFilters; 