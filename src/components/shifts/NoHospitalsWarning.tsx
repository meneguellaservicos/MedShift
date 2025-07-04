import React from 'react';
import { Building2 } from 'lucide-react';

interface NoHospitalsWarningProps {
  hospitalsCount: number;
  enabledHospitalsCount: number;
}

const NoHospitalsWarning: React.FC<NoHospitalsWarningProps> = ({ 
  hospitalsCount, 
  enabledHospitalsCount 
}) => {
  const hasHospitals = hospitalsCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plantões</h2>
          <p className="text-gray-600 dark:text-gray-300">Gerencie seus plantões médicos</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-gray-400 text-white px-4 py-2 rounded-xl cursor-not-allowed"
          disabled
        >
          <Building2 className="w-5 h-5" />
          <span>Adicionar Plantão</span>
        </button>
      </div>

      {/* No hospitals warning */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-white/20 dark:border-gray-700/20">
        <Building2 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {!hasHospitals 
            ? 'Adicione um hospital primeiro'
            : 'Nenhum hospital ativo disponível'
          }
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {!hasHospitals 
            ? 'Para criar plantões, você precisa ter pelo menos um hospital cadastrado com suas informações e valor por hora.'
            : 'Todos os hospitais estão desabilitados. Habilite pelo menos um hospital para criar plantões.'
          }
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            💡 <strong>Dica:</strong> Vá para a seção "Hospitais" no menu lateral e {!hasHospitals ? 'adicione seu primeiro hospital' : 'habilite um hospital existente'}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoHospitalsWarning; 