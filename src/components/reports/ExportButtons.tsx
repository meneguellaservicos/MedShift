import React from 'react';
import { FileText, Table, Building2 } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportHospitalBreakdown: () => void;
  isExporting: string;
  showHospitalBreakdown: boolean;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportPDF,
  onExportCSV,
  onExportHospitalBreakdown,
  isExporting,
  showHospitalBreakdown,
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <button
      onClick={onExportPDF}
      disabled={isExporting === 'pdf'}
      className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting === 'pdf' ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      <span>Exportar PDF</span>
    </button>
    <button
      onClick={onExportCSV}
      disabled={isExporting === 'csv'}
      className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting === 'csv' ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Table className="w-4 h-4" />
      )}
      <span>Exportar CSV</span>
    </button>
    {showHospitalBreakdown && (
      <button
        onClick={onExportHospitalBreakdown}
        disabled={isExporting === 'hospital-pdf'}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting === 'hospital-pdf' ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Building2 className="w-4 h-4" />
        )}
        <span>Relatório por Hospital</span>
      </button>
    )}
  </div>
);

export default ExportButtons; 