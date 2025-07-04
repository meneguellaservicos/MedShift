import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, DollarSign, CheckCircle, Hourglass, Building2, Filter, CalendarDays, AlertCircle } from 'lucide-react';
import { Shift, Hospital } from '../types';
import { formatDate, formatTime, formatCurrency } from '../utils/dateUtils';
import { parseISO } from 'date-fns';
import Calendar from './Calendar';
import { useAppContext } from '../context/AppContext';
import { useShiftForm } from '../hooks/useShiftForm';
import { validateShiftForm } from '../utils/validation';
import ShiftForm from './shifts/ShiftForm';

interface ShiftsViewProps {
  shifts: Shift[];
  hospitals: Hospital[];
  enabledHospitals: Hospital[];
  onAddShift: (shift: Omit<Shift, 'id'>) => Promise<boolean>;
  onBulkAddShifts: (shifts: Omit<Shift, 'id'>[]) => Promise<{ success: boolean; conflictDates: string[]; addedShifts: number }>;
  onEditShift: (id: string, shift: Omit<Shift, 'id'>) => Promise<boolean>;
  onDeleteShift: (id: string) => Promise<void>;
  onTogglePaid: (id: string) => Promise<void>;
  showEconomicValues: boolean;
}

const ShiftsView: React.FC<ShiftsViewProps> = ({
  shifts,
  hospitals,
  enabledHospitals,
  onAddShift,
  onBulkAddShifts,
  onEditShift,
  onDeleteShift,
  onTogglePaid,
  showEconomicValues,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [filterHospitalId, setFilterHospitalId] = useState<string>('');
  const [filterPaidStatus, setFilterPaidStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'thisWeek' | 'thisMonth' | 'last30Days' | 'last3Months' | 'last6Months' | 'thisYear'>('thisMonth');
  const calendarRef = useRef<HTMLDivElement>(null);
  const [focusOnSelectedDates, setFocusOnSelectedDates] = useState(false);
  const { setCurrentView } = useAppContext();

  // Use the shift form validation hook
  const shiftForm = useShiftForm({
    onAddShift,
    onBulkAddShifts,
    onEditShift,
    hospitals,
    selectedDates,
    editingShift
  });

  // Reset focus flag after focus is applied
  useEffect(() => {
    if (focusOnSelectedDates) {
      const timer = setTimeout(() => {
        setFocusOnSelectedDates(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [focusOnSelectedDates]);

  const handleAddShiftClick = () => {
    if (!hospitals || hospitals.length === 0) {
      alert('Cadastre um hospital antes de adicionar plantão! Você será direcionado para o cadastro de hospitais.');
      if (setCurrentView) setCurrentView('hospitals');
      return;
    }
    setShowForm(true);
    setEditingShift(null);
    setSelectedDates([]);
    shiftForm.resetForm();
    setFocusOnSelectedDates(false);
    setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação manual direta
    const validation = validateShiftForm(shiftForm.formData);
    
    if (!validation.isValid) {
      // Se há erros, atualiza o estado de erros manualmente
      shiftForm.setFormErrors(validation.errors);
      return;
    }
    
    // Se não há erros, prossegue com o submit
    shiftForm.handleSubmit().then((result) => {
      if (result) {
        resetForm();
      }
    }).catch((error) => {
      console.error('Erro ao submeter formulário:', error);
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingShift(null);
    setSelectedDates([]);
    shiftForm.resetForm();
    setFocusOnSelectedDates(false);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setSelectedDates([shift.startDate]);
    shiftForm.setFormData({
      hospitalId: shift.hospitalId,
      startTime: shift.startTime,
      endTime: shift.endTime,
      notes: shift.notes || '',
    });
    setShowForm(true);
    setFocusOnSelectedDates(true);
  };

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

  // No hospitals warning component
  if (enabledHospitals.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantões</h2>
            <p className="text-gray-600 dark:text-gray-300">Gerencie seus plantões médicos</p>
          </div>
          <button
            onClick={handleAddShiftClick}
            className="flex items-center space-x-2 bg-gray-400 text-white px-4 py-2 rounded-xl cursor-not-allowed"
            disabled
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Plantão</span>
          </button>
        </div>

        {/* No hospitals warning */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20 dark:border-gray-700/20">
          <Building2 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {hospitals.length === 0 
              ? 'Adicione um hospital primeiro'
              : 'Nenhum hospital ativo disponível'
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {hospitals.length === 0 
              ? 'Para criar plantões, você precisa ter pelo menos um hospital cadastrado com suas informações e valor por hora.'
              : 'Todos os hospitais estão desabilitados. Habilite pelo menos um hospital para criar plantões.'
            }
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              💡 <strong>Dica:</strong> Vá para a seção "Hospitais" no menu lateral e {hospitals.length === 0 ? 'adicione seu primeiro hospital' : 'habilite um hospital existente'}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantões</h2>
          <p className="text-gray-600 dark:text-gray-300">Gerencie seus plantões médicos</p>
        </div>
        <button
          onClick={handleAddShiftClick}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Plantão</span>
        </button>
      </div>

      {/* Filters */}
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
              onChange={(e) => setFilterHospitalId(e.target.value)}
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
              onChange={(e) => setFilterPeriod(e.target.value as typeof filterPeriod)}
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
                onClick={() => setFilterPaidStatus('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filterPaidStatus === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterPaidStatus('paid')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filterPaidStatus === 'paid'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setFilterPaidStatus('pending')}
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
            <span className="font-medium">{filteredShifts.length}</span> de <span className="font-medium">{shifts.length}</span> plantões
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {getPeriodLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingShift ? 'Editar Plantão' : 'Adicionar Plantão'}
          </h3>
          <ShiftForm
            editingShift={!!editingShift}
            hospitals={hospitals}
            enabledHospitals={enabledHospitals}
            showEconomicValues={showEconomicValues}
            formData={shiftForm.formData}
            errors={shiftForm.errors}
            selectedDates={selectedDates}
            onDateSelect={setSelectedDates}
            onFieldChange={(field, value) => shiftForm.updateField(field as keyof typeof shiftForm.formData, value)}
            onCancel={resetForm}
            onSubmit={handleSubmit}
            isSubmitting={shiftForm.isSubmitting}
            calendarRef={calendarRef}
            focusOnSelectedDates={focusOnSelectedDates}
          />
        </div>
      )}

      {/* Shifts List */}
      <div className="grid gap-4">
        {filteredShifts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {shifts.length === 0 ? 'Nenhum plantão cadastrado' : 'Nenhum plantão encontrado'}
            </h3>
            <p className="text-gray-600">
              {shifts.length === 0 
                ? 'Adicione seu primeiro plantão para começar'
                : 'Ajuste os filtros para ver outros plantões'
              }
            </p>
            {shifts.length > 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Filtros ativos: {getPeriodLabel()}
                {filterHospitalId && `, Hospital: ${hospitals.find(h => h.id === filterHospitalId)?.name}`}
                {filterPaidStatus !== 'all' && `, Status: ${filterPaidStatus === 'paid' ? 'Pagos' : 'Pendentes'}`}
              </div>
            )}
          </div>
        ) : (
          filteredShifts.map((shift) => {
            const hospital = hospitals.find(h => h.id === shift.hospitalId);
            return (
              <div
                key={shift.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: hospital?.color || '#3B82F6' }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {hospital?.name || 'Hospital não encontrado'}
                        {hospital?.isDisabled && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Desabilitado
                          </span>
                        )}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        shift.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {shift.isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(shift.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{shift.totalHours.toFixed(1)}h</span>
                      </div>
                      {showEconomicValues && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">{formatCurrency(shift.totalAmount)}</span>
                        </div>
                      )}
                    </div>
                    
                    {shift.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">{shift.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={async () => {
                        try {
                          await onTogglePaid(shift.id);
                        } catch (error: unknown) {
                          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                          alert(errorMessage);
                        }
                      }}
                      className={`p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                        shift.isPaid
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      }`}
                      title={shift.isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
                    >
                      {shift.isPaid ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Hourglass className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(shift)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      title="Editar plantão"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Tem certeza que deseja excluir este plantão?')) {
                          try {
                            await onDeleteShift(shift.id);
                                              } catch (error: unknown) {
                      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                      alert(errorMessage);
                    }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      title="Excluir plantão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ShiftsView;