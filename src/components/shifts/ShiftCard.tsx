import React from 'react';
import { Edit2, Trash2, CheckCircle, Hourglass, Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';
import { Shift, Hospital } from '../../types';
import { formatDate, formatTime, formatCurrency } from '../../utils/dateUtils';

interface ShiftCardProps {
  shift: Shift;
  hospital: Hospital | undefined;
  showEconomicValues: boolean;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => Promise<void>;
  onTogglePaid: (shiftId: string) => Promise<void>;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  hospital,
  showEconomicValues,
  onEdit,
  onDelete,
  onTogglePaid,
}) => {
  const handleTogglePaid = async () => {
    try {
      await onTogglePaid(shift.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este plantão?')) {
      try {
        await onDelete(shift.id);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-200">
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
            onClick={handleTogglePaid}
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
            onClick={() => onEdit(shift)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
            title="Editar plantão"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
            title="Excluir plantão"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftCard; 