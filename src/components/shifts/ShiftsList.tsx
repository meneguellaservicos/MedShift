import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Shift, Hospital } from '../../types';
import ShiftCard from './ShiftCard';

interface ShiftsListProps {
  shifts: Shift[];
  hospitals: Hospital[];
  showEconomicValues: boolean;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => Promise<void>;
  onTogglePaid: (shiftId: string) => Promise<void>;
  getPeriodLabel: () => string;
  filterHospitalId: string;
  filterPaidStatus: 'all' | 'paid' | 'pending';
}

const ShiftsList: React.FC<ShiftsListProps> = ({
  shifts,
  hospitals,
  showEconomicValues,
  onEdit,
  onDelete,
  onTogglePaid,
  getPeriodLabel,
  filterHospitalId,
  filterPaidStatus,
}) => {
  if (shifts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20">
        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum plantão encontrado
        </h3>
        <p className="text-gray-600">
          Ajuste os filtros para ver outros plantões
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Filtros ativos: {getPeriodLabel()}
          {filterHospitalId && `, Hospital: ${hospitals.find(h => h.id === filterHospitalId)?.name}`}
          {filterPaidStatus !== 'all' && `, Status: ${filterPaidStatus === 'paid' ? 'Pagos' : 'Pendentes'}`}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {shifts.map((shift) => {
        const hospital = hospitals.find(h => h.id === shift.hospitalId);
        return (
          <ShiftCard
            key={shift.id}
            shift={shift}
            hospital={hospital}
            showEconomicValues={showEconomicValues}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePaid={onTogglePaid}
          />
        );
      })}
    </div>
  );
};

export default ShiftsList; 