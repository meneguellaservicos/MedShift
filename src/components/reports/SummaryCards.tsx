import React from 'react';
import { Calendar, Clock, DollarSign, BarChart3 } from 'lucide-react';

interface SummaryCardsProps {
  totalShifts: number;
  totalHours: number;
  totalEarnings: number;
  paidAmount: number;
  showEconomicValues: boolean;
  formatCurrency: (value: number) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalShifts,
  totalHours,
  totalEarnings,
  paidAmount,
  showEconomicValues,
  formatCurrency,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total de Plantões
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {totalShifts}
          </p>
        </div>
        <div className="bg-blue-500 p-3 rounded-xl">
          <Calendar className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Total de Horas
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {totalHours}
          </p>
        </div>
        <div className="bg-green-500 p-3 rounded-xl">
          <Clock className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Ganhos Totais
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {showEconomicValues ? formatCurrency(totalEarnings) : '***'}
          </p>
        </div>
        <div className="bg-yellow-500 p-3 rounded-xl">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Valor Pago
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {showEconomicValues ? formatCurrency(paidAmount) : '***'}
          </p>
        </div>
        <div className="bg-emerald-500 p-3 rounded-xl">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  </div>
);

export default SummaryCards; 