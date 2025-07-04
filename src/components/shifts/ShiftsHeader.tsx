import React from 'react';
import { Plus } from 'lucide-react';

interface ShiftsHeaderProps {
  onAddShift: () => void;
  hasHospitals: boolean;
  enabledHospitalsCount: number;
}

const ShiftsHeader: React.FC<ShiftsHeaderProps> = ({ 
  onAddShift, 
  hasHospitals, 
  enabledHospitalsCount 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantões</h2>
        <p className="text-gray-600 dark:text-gray-300">Gerencie seus plantões médicos</p>
      </div>
      <button
        onClick={onAddShift}
        disabled={!hasHospitals || enabledHospitalsCount === 0}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg ${
          hasHospitals && enabledHospitalsCount > 0
            ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700'
            : 'bg-gray-400 text-white cursor-not-allowed'
        }`}
      >
        <Plus className="w-5 h-5" />
        <span>Adicionar Plantão</span>
      </button>
    </div>
  );
};

export default ShiftsHeader; 