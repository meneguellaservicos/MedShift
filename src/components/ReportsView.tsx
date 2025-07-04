import React, { useMemo, useState } from 'react';
import { BarChart3, DollarSign, Clock, Calendar, TrendingUp, Building2, PieChart, Filter, Download, FileText, Table } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Shift, Hospital } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { exportToPDF, exportToCSV, exportHospitalBreakdownToPDF } from '../utils/exportUtils';
import ExportButtons from './reports/ExportButtons';
import ReportsFilters from './reports/ReportsFilters';
import SummaryCards from './reports/SummaryCards';
import PaymentStatusChart from './reports/PaymentStatusChart';

interface ReportsViewProps {
  shifts: Shift[];
  hospitals: Hospital[];
  showEconomicValues: boolean;
}

// Função utilitária para parse seguro de datas locais
function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const ReportsView: React.FC<ReportsViewProps> = ({ shifts, hospitals, showEconomicValues }) => {
  const [filterHospitalId, setFilterHospitalId] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'lastMonth' | 'last3Months' | 'last6Months' | 'lastYear' | 'thisMonth'>('thisMonth');
  const [isExporting, setIsExporting] = useState<string>('');

  // Filter shifts based on criteria
  const filteredShifts = useMemo(() => {
    let filtered = shifts;

    if (filterHospitalId) {
      filtered = filtered.filter(shift => shift.hospitalId === filterHospitalId);
    }

    if (filterDateRange !== 'all') {
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      let start: Date | null = null;
      let end: Date | null = null;

      switch (filterDateRange) {
        case 'thisMonth': {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        }
        case 'lastMonth': {
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        }
        case 'last3Months': {
          start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          end = endOfToday;
          break;
        }
        case 'last6Months': {
          start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          end = endOfToday;
          break;
        }
        case 'lastYear': {
          start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          end = endOfToday;
          break;
        }
      }

      if (start && end) {
        filtered = filtered.filter(shift => {
          const shiftDate = parseLocalDate(shift.startDate);
          return shiftDate >= start! && shiftDate < end!;
        });
      }
    }

    return filtered;
  }, [shifts, filterHospitalId, filterDateRange]);

  const report = useMemo(() => {
    const totalShifts = filteredShifts.length;
    const totalHours = filteredShifts.reduce((sum, shift) => sum + shift.totalHours, 0);
    const totalEarnings = filteredShifts.reduce((sum, shift) => sum + shift.totalAmount, 0);
    const paidAmount = filteredShifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0);
    const pendingAmount = totalEarnings - paidAmount;

    const hospitalBreakdown = hospitals.map(hospital => {
      const hospitalShifts = filteredShifts.filter(s => s.hospitalId === hospital.id);
      return {
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        hospitalColor: hospital.color,
        shifts: hospitalShifts.length,
        hours: hospitalShifts.reduce((sum, shift) => sum + shift.totalHours, 0),
        earnings: hospitalShifts.reduce((sum, shift) => sum + shift.totalAmount, 0),
        paidEarnings: hospitalShifts.filter(s => s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0),
      };
    }).filter(h => h.shifts > 0);

    return {
      totalShifts,
      totalHours,
      totalEarnings,
      paidAmount,
      pendingAmount,
      hospitalBreakdown,
    };
  }, [filteredShifts, hospitals]);

  // Prepare data for charts
  const paymentStatusData = [
    {
      name: 'Pago',
      value: report.paidAmount,
      color: '#10B981',
      percentage: report.totalEarnings > 0 ? (report.paidAmount / report.totalEarnings) * 100 : 0
    },
    {
      name: 'Pendente',
      value: report.pendingAmount,
      color: '#F59E0B',
      percentage: report.totalEarnings > 0 ? (report.pendingAmount / report.totalEarnings) * 100 : 0
    }
  ];

  const hospitalEarningsData = report.hospitalBreakdown.map(hospital => ({
    name: hospital.hospitalName,
    earnings: hospital.earnings,
    hours: hospital.hours,
    shifts: hospital.shifts,
    color: hospital.hospitalColor
  }));

  // Dados para Tendências Mensais (earnings, hours, shifts)
  const monthlyTrendsData = useMemo(() => {
    const monthlyStats: { [key: string]: { earnings: number; hours: number; shifts: number } } = {};
    filteredShifts.forEach(shift => {
      const date = parseLocalDate(shift.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { earnings: 0, hours: 0, shifts: 0 };
      }
      monthlyStats[monthKey].earnings += shift.totalAmount;
      monthlyStats[monthKey].hours += shift.totalHours;
      monthlyStats[monthKey].shifts += 1;
    });
    return Object.entries(monthlyStats)
      .map(([month, data]) => ({
        monthId: month,
        monthLabel: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        ...data
      }))
      .sort((a, b) => a.monthId.localeCompare(b.monthId))
      .slice(-6);
  }, [filteredShifts]);

  // Dados para Plantões por Mês por hospital
  const monthlyShiftsByHospitalData = useMemo(() => {
    const monthlyStats: { [key: string]: Record<string, number> & { monthId: string; monthLabel: string } } = {};
    filteredShifts.forEach(shift => {
      const date = parseLocalDate(shift.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {} as Record<string, number> & { monthId: string; monthLabel: string };
        monthlyStats[monthKey].monthId = monthKey;
        monthlyStats[monthKey].monthLabel = new Date(monthKey + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      }
      monthlyStats[monthKey][shift.hospitalId] = (monthlyStats[monthKey][shift.hospitalId] || 0) + 1;
    });
    return Object.values(monthlyStats)
      .sort((a, b) => a.monthId.localeCompare(b.monthId))
      .slice(-6);
  }, [filteredShifts, hospitals]);

  // Dados para Status de Pagamento por Hospital
  const paymentStatusByHospitalData = useMemo(() => {
    return report.hospitalBreakdown.map(hospital => ({
      name: hospital.hospitalName,
      paid: hospital.paidEarnings,
      pending: hospital.earnings - hospital.paidEarnings,
      color: hospital.hospitalColor
    }));
  }, [report.hospitalBreakdown]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                showEconomicValues === false && (entry.name.includes('Valor') || entry.name.includes('earnings') || entry.name.includes('Ganhos'))
                  ? '***'
                  : (showEconomicValues && (entry.name.includes('Valor') || entry.name.includes('earnings') || entry.name.includes('Ganhos'))
                    ? formatCurrency(entry.value)
                    : entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getDateRangeLabel = () => {
    switch (filterDateRange) {
      case 'thisMonth': return 'Este mês';
      case 'lastMonth': return 'Último mês';
      case 'last3Months': return 'Últimos 3 meses';
      case 'last6Months': return 'Últimos 6 meses';
      case 'lastYear': return 'Último ano';
      default: return 'Todos os períodos';
    }
  };

  // Export functions
  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      const selectedHospital = hospitals.find(h => h.id === filterHospitalId);
      await exportToPDF({
        shifts: filteredShifts,
        hospitals,
        showEconomicValues,
        filterInfo: {
          hospitalName: selectedHospital?.name,
          dateRange: getDateRangeLabel(),
          totalShifts: filteredShifts.length
        }
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting('');
    }
  };

  const handleExportCSV = () => {
    setIsExporting('csv');
    try {
      const selectedHospital = hospitals.find(h => h.id === filterHospitalId);
      exportToCSV({
        shifts: filteredShifts,
        hospitals,
        showEconomicValues,
        filterInfo: {
          hospitalName: selectedHospital?.name,
          dateRange: getDateRangeLabel(),
          totalShifts: filteredShifts.length
        }
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar CSV. Tente novamente.');
    } finally {
      setIsExporting('');
    }
  };

  const handleExportHospitalBreakdown = async () => {
    setIsExporting('hospital-pdf');
    try {
      await exportHospitalBreakdownToPDF({
        shifts: filteredShifts,
        hospitals,
        showEconomicValues,
        filterInfo: {
          dateRange: getDateRangeLabel(),
          totalShifts: filteredShifts.length
        }
      });
    } catch (error) {
      console.error('Error exporting hospital breakdown PDF:', error);
      alert('Erro ao exportar relatório por hospital. Tente novamente.');
    } finally {
      setIsExporting('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="text-gray-600 dark:text-gray-300">Acompanhe seu desempenho e ganhos com visualizações interativas</p>
        </div>
        
        {/* Export Buttons */}
        {filteredShifts.length > 0 && (
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onExportHospitalBreakdown={handleExportHospitalBreakdown}
            isExporting={isExporting}
            showHospitalBreakdown={report.hospitalBreakdown.length > 1}
          />
        )}
      </div>

      {/* Export Info */}
      {filteredShifts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">Opções de Exportação</h3>
              <p className="text-blue-800 dark:text-blue-300 text-sm mt-1">
                <strong>PDF:</strong> Relatório completo com gráficos e logo para apresentações. 
                <strong>CSV:</strong> Dados tabulares para análise em planilhas. 
                <strong>Relatório por Hospital:</strong> Breakdown detalhado por instituição.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <ReportsFilters
        hospitals={hospitals}
        filterHospitalId={filterHospitalId}
        setFilterHospitalId={setFilterHospitalId}
        filterDateRange={filterDateRange}
        setFilterDateRange={(range) => setFilterDateRange(range as typeof filterDateRange)}
        getDateRangeLabel={getDateRangeLabel}
      />

      {/* Summary Cards */}
      <SummaryCards
        totalShifts={report.totalShifts}
        totalHours={report.totalHours}
        totalEarnings={report.totalEarnings}
        paidAmount={report.paidAmount}
        showEconomicValues={showEconomicValues}
        formatCurrency={formatCurrency}
      />

      {/* Charts */}
      <div className="space-y-8">
        {/* Payment Status Chart */}
        {showEconomicValues ? (
          <PaymentStatusChart
            data={paymentStatusData}
            showEconomicValues={showEconomicValues}
            formatCurrency={formatCurrency}
            CustomTooltip={CustomTooltip}
          />
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20 flex items-center justify-center min-h-[200px] border-2 border-red-400 rounded-xl shadow-[0_4px_24px_rgba(239,68,68,0.3)]">
            <span className="text-gray-700 dark:text-gray-200 text-center">
              Os valores monetários estão ocultos.<br />
              Para visualizar este gráfico, habilite a opção de mostrar valores monetários.
            </span>
          </div>
        )}

        {/* Payment Status by Hospital Chart */}
        {showEconomicValues ? (
          paymentStatusByHospitalData.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status de Pagamento por Hospital
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentStatusByHospitalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number, key: string) => showEconomicValues ? formatCurrency(value) : '***'} />
                    <Legend />
                    <Bar dataKey="paid" name="Pago" fill="#10B981" />
                    <Bar dataKey="pending" name="Pendente" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20 flex items-center justify-center min-h-[200px] border-2 border-red-400 rounded-xl shadow-[0_4px_24px_rgba(239,68,68,0.3)]">
            <span className="text-gray-700 dark:text-gray-200 text-center">
              Os valores monetários estão ocultos.<br />
              Para visualizar este gráfico, habilite a opção de mostrar valores monetários.
            </span>
          </div>
        )}

        {/* Hospital Earnings Chart */}
        {showEconomicValues ? (
          hospitalEarningsData.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ganhos por Hospital
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalEarningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number, key: string) => showEconomicValues ? formatCurrency(value) : '***'} />
                    <Legend />
                    <Bar dataKey="earnings" name="Ganhos">
                      {hospitalEarningsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20 flex items-center justify-center min-h-[200px] border-2 border-red-400 rounded-xl shadow-[0_4px_24px_rgba(239,68,68,0.3)]">
            <span className="text-gray-700 dark:text-gray-200 text-center">
              Os valores monetários estão ocultos.<br />
              Para visualizar este gráfico, habilite a opção de mostrar valores monetários.
            </span>
          </div>
        )}

        {/* Monthly Trends Chart */}
        {showEconomicValues ? (
          monthlyTrendsData.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tendências Mensais
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthId" tickFormatter={(id) => {
                      const found = monthlyTrendsData.find(m => m.monthId === id);
                      return found ? found.monthLabel : id;
                    }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: number, key: string) => {
                      if (key === 'earnings' && !showEconomicValues) return '***';
                      if (key === 'earnings' && showEconomicValues) return formatCurrency(value);
                      return value;
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="earnings" name="Ganhos" fill="#3B82F6" />
                    <Bar yAxisId="right" dataKey="hours" name="Horas" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20 flex items-center justify-center min-h-[200px] border-2 border-red-400 rounded-xl shadow-[0_4px_24px_rgba(239,68,68,0.3)]">
            <span className="text-gray-700 dark:text-gray-200 text-center">
              Os valores monetários estão ocultos.<br />
              Para visualizar este gráfico, habilite a opção de mostrar valores monetários.
            </span>
          </div>
        )}

        {/* Monthly Shifts Chart (Plantões por Mês por hospital) */}
        {monthlyShiftsByHospitalData.length > 0 && hospitals.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plantões por Mês
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyShiftsByHospitalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthId" tickFormatter={(id) => {
                    const found = monthlyShiftsByHospitalData.find(m => m.monthId === id);
                    return found ? found.monthLabel : id;
                  }} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {hospitals.map((hospital) => (
                    <Bar
                      key={hospital.id}
                      dataKey={hospital.id}
                      name={hospital.name}
                      fill={hospital.color}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {filteredShifts.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum plantão encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tente ajustar os filtros para ver mais resultados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView; 