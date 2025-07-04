import React from 'react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

interface PaymentStatusEntry {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PaymentStatusChartProps {
  data: PaymentStatusEntry[];
  showEconomicValues: boolean;
  formatCurrency: (value: number) => string;
  CustomTooltip: React.FC<any>;
}

const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({
  data,
  showEconomicValues,
  formatCurrency,
  CustomTooltip,
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Status de Pagamento
    </h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
    <div className="flex justify-center space-x-6 mt-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {entry.name}: {showEconomicValues ? formatCurrency(entry.value) : entry.value} ({entry.percentage.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentStatusChart; 