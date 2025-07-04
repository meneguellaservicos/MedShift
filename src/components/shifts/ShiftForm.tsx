import React, { RefObject } from 'react';
import { AlertCircle } from 'lucide-react';
import Calendar from '../Calendar';
import { Hospital } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface ShiftFormProps {
  editingShift: boolean;
  hospitals: Hospital[];
  enabledHospitals: Hospital[];
  showEconomicValues: boolean;
  formData: {
    hospitalId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  };
  errors: {
    hospitalId?: string;
    startTime?: string;
    endTime?: string;
  };
  selectedDates: string[];
  onDateSelect: (dates: string[]) => void;
  onFieldChange: (field: string, value: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  calendarRef: RefObject<HTMLDivElement>;
  focusOnSelectedDates: boolean;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  editingShift,
  hospitals,
  enabledHospitals,
  showEconomicValues,
  formData,
  errors,
  selectedDates,
  onDateSelect,
  onFieldChange,
  onCancel,
  onSubmit,
  isSubmitting,
  calendarRef,
  focusOnSelectedDates,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Calendar for Date Selection */}
      <div ref={calendarRef}>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {editingShift ? 'Data do plantão' : 'Selecione as datas do plantão'}
        </label>
        <Calendar
          selectedDates={selectedDates}
          onDateSelect={onDateSelect}
          singleDateMode={!!editingShift}
          allShifts={[]}
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
            value={formData.hospitalId}
            onChange={(e) => onFieldChange('hospitalId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
              errors.hospitalId ? 'border-red-500' : 'border-gray-300'
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
          {errors.hospitalId && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.hospitalId}
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
            value={formData.startTime}
            onChange={(e) => onFieldChange('startTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.startTime && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.startTime}
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
            value={formData.endTime}
            onChange={(e) => onFieldChange('endTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
              errors.endTime ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.endTime && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.endTime}
            </p>
          )}
          {formData.endTime && formData.startTime && (
            <div className="mt-2">
              {formData.endTime === formData.startTime ? (
                <p className="text-xs text-blue-600">
                  ⏰ Plantão de 24 horas (termina no dia seguinte)
                </p>
              ) : formData.endTime < formData.startTime ? (
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
            value={formData.notes || ''}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            rows={3}
            placeholder="Observações opcionais..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={selectedDates.length === 0 || isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700"
        >
          {editingShift ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
};

export default ShiftForm; 