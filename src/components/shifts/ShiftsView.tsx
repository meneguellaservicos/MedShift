import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Shift, Hospital } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import { useAppContext } from '../../context/AppContext';
import { useShiftForm } from '../../hooks/useShiftForm';
import { validateShiftForm } from '../../utils/validation';
import { useShiftsFilters } from './hooks/useShiftsFilters';
import ShiftsHeader from './ShiftsHeader';
import ShiftsFilters from './ShiftsFilters';
import ShiftsList from './ShiftsList';
import NoHospitalsWarning from './NoHospitalsWarning';
import Calendar from '../Calendar';

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

  // Use the shifts filters hook
  const {
    filterHospitalId,
    filterPaidStatus,
    filterPeriod,
    setFilterHospitalId,
    setFilterPaidStatus,
    setFilterPeriod,
    filteredShifts,
    getPeriodLabel,
  } = useShiftsFilters(shifts);

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

  // No hospitals warning component
  if (enabledHospitals.length === 0) {
    return (
      <NoHospitalsWarning 
        hospitalsCount={hospitals.length}
        enabledHospitalsCount={enabledHospitals.length}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ShiftsHeader 
        onAddShift={handleAddShiftClick}
        hasHospitals={hospitals.length > 0}
        enabledHospitalsCount={enabledHospitals.length}
      />

      {/* Filters */}
      <ShiftsFilters
        hospitals={hospitals}
        filterHospitalId={filterHospitalId}
        filterPaidStatus={filterPaidStatus}
        filterPeriod={filterPeriod}
        filteredShiftsCount={filteredShifts.length}
        totalShiftsCount={shifts.length}
        onFilterHospitalChange={setFilterHospitalId}
        onFilterPaidStatusChange={setFilterPaidStatus}
        onFilterPeriodChange={setFilterPeriod}
        getPeriodLabel={getPeriodLabel}
      />

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingShift ? 'Editar Plantão' : 'Adicionar Plantão'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calendar for Date Selection */}
            <div ref={calendarRef}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {editingShift ? 'Data do plantão' : 'Selecione as datas do plantão'}
              </label>
              <Calendar
                selectedDates={selectedDates}
                onDateSelect={setSelectedDates}
                singleDateMode={!!editingShift}
                allShifts={shifts}
                focusOnSelectedDates={focusOnSelectedDates}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital
                </label>
                <select
                  value={shiftForm.formData.hospitalId}
                  onChange={(e) => shiftForm.updateField('hospitalId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    shiftForm.errors.hospitalId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecione um hospital</option>
                  {(editingShift ? hospitals : enabledHospitals).map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {showEconomicValues ? formatCurrency(hospital.hourlyRate) : '***'}/h
                      {hospital.isDisabled ? ' (Desabilitado)' : ''}
                    </option>
                  ))}
                </select>
                {shiftForm.errors.hospitalId && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {shiftForm.errors.hospitalId}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={shiftForm.formData.startTime}
                  onChange={(e) => shiftForm.updateField('startTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    shiftForm.errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {shiftForm.errors.startTime && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {shiftForm.errors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Término
                </label>
                <input
                  type="time"
                  value={shiftForm.formData.endTime}
                  onChange={(e) => shiftForm.updateField('endTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    shiftForm.errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {shiftForm.errors.endTime && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {shiftForm.errors.endTime}
                  </p>
                )}
                {shiftForm.formData.endTime && shiftForm.formData.startTime && (
                  <div className="mt-2">
                    {shiftForm.formData.endTime === shiftForm.formData.startTime ? (
                      <p className="text-xs text-blue-600">
                        ⏰ Plantão de 24 horas (termina no dia seguinte)
                      </p>
                    ) : shiftForm.formData.endTime < shiftForm.formData.startTime ? (
                      <p className="text-xs text-blue-600">
                        🌙 Plantão terminará no dia seguinte
                      </p>
                    ) : (
                      <p className="text-xs text-green-600">
                        ☀️ Plantão no mesmo dia
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={shiftForm.formData.notes || ''}
                  onChange={(e) => shiftForm.updateField('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  rows={3}
                  placeholder="Observações opcionais..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={selectedDates.length === 0 || shiftForm.isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700"
              >
                {editingShift ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shifts List */}
      <ShiftsList
        shifts={filteredShifts}
        hospitals={hospitals}
        showEconomicValues={showEconomicValues}
        onEdit={handleEdit}
        onDelete={onDeleteShift}
        onTogglePaid={onTogglePaid}
        getPeriodLabel={getPeriodLabel}
        filterHospitalId={filterHospitalId}
        filterPaidStatus={filterPaidStatus}
      />
    </div>
  );
};

export default ShiftsView; 