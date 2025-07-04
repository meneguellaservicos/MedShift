import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, DollarSign, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import { Shift, Hospital } from '../types';
import { formatDateWithWeekday, formatTime, formatCurrency, sortShiftsChronologically, daysBetween } from '../utils/dateUtils';
import { useAppContext } from '../context/AppContext';

interface DashboardViewProps {
  shifts: Shift[];
  hospitals: Hospital[];
  showEconomicValues: boolean;
}

const VAPID_PUBLIC_KEY = 'BOr7QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const DashboardView: React.FC<DashboardViewProps> = ({ shifts, hospitals, showEconomicValues }) => {
  const { upcomingShifts } = useAppContext();
  
  // Memoized calculations to prevent unnecessary re-renders
  const sortedUpcomingShifts = useMemo(() => {
    return sortShiftsChronologically(upcomingShifts);
  }, [upcomingShifts]);

  const nextFourShifts = useMemo(() => {
    return sortedUpcomingShifts.slice(0, 4);
  }, [sortedUpcomingShifts]);

  // Filtrar plantões do mês corrente
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const shiftsThisMonth = shifts.filter(shift => {
    const date = new Date(shift.startDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Memoized summary statistics (apenas mês corrente)
  const summaryStats = useMemo(() => {
    const totalShifts = shiftsThisMonth.length;
    const totalHours = shiftsThisMonth.reduce((sum, shift) => sum + shift.totalHours, 0);
    const totalEarnings = shiftsThisMonth.reduce((sum, shift) => sum + shift.totalAmount, 0);
    const pendingAmount = shiftsThisMonth.filter(s => !s.isPaid).reduce((sum, shift) => sum + shift.totalAmount, 0);
    return { totalShifts, totalHours, totalEarnings, pendingAmount };
  }, [shiftsThisMonth]);

  const { totalShifts, totalHours, totalEarnings, pendingAmount } = summaryStats;

  const getHospitalById = (hospitalId: string) => {
    return hospitals.find(h => h.id === hospitalId);
  };

  const getShiftStatus = (shift: Shift) => {
    const now = new Date();
    const shiftStart = new Date(`${shift.startDate}T${shift.startTime}`);
    const shiftEnd = new Date(`${shift.endDate}T${shift.endTime}`);
    
    if (now < shiftStart) {
      const days = daysBetween(now, shiftStart);
      let label = '';
      if (days === 0) label = 'Hoje';
      else if (days === 1) label = 'Falta 1 dia';
      else label = `Faltam ${days} dias`;
      return { status: 'upcoming', label, color: 'blue' };
    } else if (now >= shiftStart && now <= shiftEnd) {
      return { status: 'ongoing', label: 'Em andamento', color: 'green' };
    } else {
      return { status: 'completed', label: 'Concluído', color: 'gray' };
    }
  };

  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [pushStatus, setPushStatus] = useState<string>('');

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  const handleEnableNotifications = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          // Simular envio ao backend
          await fetch('http://localhost:4000/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          setPushStatus('Dispositivo inscrito e registrado no servidor!');
        } catch (err) {
          setPushStatus('Erro ao registrar inscrição no servidor.');
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral dos seus plantões e estatísticas</p>
        {pushStatus && (
          <div className="mt-2 text-blue-700 text-xs">{pushStatus}</div>
        )}
      </div>

      {hospitals.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Comece adicionando um hospital</h3>
              <p className="text-amber-700">
                Para criar plantões, você precisa primeiro cadastrar pelo menos um hospital na seção "Hospitais".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Plantões</p>
              <p className="text-2xl font-bold text-gray-900">{totalShifts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Trabalhadas</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {showEconomicValues && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ganho</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Pendente</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Próximos Plantões */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Plantões</h3>
        
        {nextFourShifts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum plantão próximo</h4>
            <p className="text-gray-600">Adicione novos plantões para vê-los aqui</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {nextFourShifts.map((shift) => {
              const hospital = getHospitalById(shift.hospitalId);
              const shiftStatus = getShiftStatus(shift);
              
              return (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: hospital?.color || '#3B82F6' }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {hospital?.name || 'Hospital não encontrado'}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateWithWeekday(shift.startDate)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{shift.totalHours.toFixed(1)}h</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shiftStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      shiftStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shiftStatus.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;