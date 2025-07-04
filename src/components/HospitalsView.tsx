import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, DollarSign, MapPin, Power, PowerOff, Filter, AlertCircle } from 'lucide-react';
import { Hospital } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { useHospitalForm } from '../hooks/useHospitalForm';
import { getHospitalColors } from '../config';

interface HospitalsViewProps {
  hospitals: Hospital[];
  onAddHospital: (hospital: Omit<Hospital, 'id'>) => Promise<void>;
  onEditHospital: (id: string, hospital: Omit<Hospital, 'id'>) => Promise<void>;
  onDeleteHospital: (id: string) => Promise<void>;
  onToggleHospitalStatus: (id: string) => Promise<void>;
  showEconomicValues: boolean;
}

const HospitalsView: React.FC<HospitalsViewProps> = ({
  hospitals,
  onAddHospital,
  onEditHospital,
  onDeleteHospital,
  onToggleHospitalStatus,
  showEconomicValues,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [displayHourlyRate, setDisplayHourlyRate] = useState('0,00');

  // Use the hospital form validation hook
  const hospitalForm = useHospitalForm({
    onAddHospital,
    onEditHospital,
    editingHospital
  });

  const colors = getHospitalColors();

  // Filter hospitals based on status
  const filteredHospitals = hospitals.filter(hospital => {
    switch (filterStatus) {
      case 'enabled':
        return !hospital.isDisabled;
      case 'disabled':
        return hospital.isDisabled;
      default:
        return true;
    }
  });

  // Format number to currency display (e.g., 12345 -> "123,45")
  const formatToCurrencyDisplay = (value: number): string => {
    const cents = Math.round(value * 100);
    const centsStr = cents.toString().padStart(3, '0');
    const reais = centsStr.slice(0, -2);
    const centavos = centsStr.slice(-2);
    return `${reais},${centavos}`;
  };

  // Parse currency display to number (e.g., "123,45" -> 123.45)
  const parseCurrencyDisplay = (display: string): number => {
    const cleanValue = display.replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  // Handle currency input change
  const handleCurrencyInputChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly === '') {
      setDisplayHourlyRate('0,00');
      hospitalForm.updateField('hourlyRate', '0');
      return;
    }

    // Ensure at least 3 digits for proper formatting
    const paddedDigits = digitsOnly.padStart(3, '0');
    
    // Insert comma before last 2 digits
    const reais = paddedDigits.slice(0, -2);
    const centavos = paddedDigits.slice(-2);
    const formattedDisplay = `${reais},${centavos}`;
    
    // Calculate actual numeric value
    const numericValue = parseInt(digitsOnly) / 100;
    
    setDisplayHourlyRate(formattedDisplay);
    hospitalForm.updateField('hourlyRate', numericValue.toString());
  };

  // Sincronizar displayHourlyRate com o estado do formulário
  useEffect(() => {
    if (hospitalForm.formData.hourlyRate && hospitalForm.formData.hourlyRate !== '0') {
      const rate = parseFloat(hospitalForm.formData.hourlyRate);
      if (!isNaN(rate)) {
        setDisplayHourlyRate(formatToCurrencyDisplay(rate));
      }
    }
  }, [hospitalForm.formData.hourlyRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const success = await hospitalForm.handleSubmit();
      if (success) {
        resetForm();
      }
      // Se não foi bem-sucedido, o formulário permanece aberto com os erros exibidos
    } catch (error: any) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingHospital(null);
    hospitalForm.resetForm();
    setDisplayHourlyRate('0,00');
  };

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    hospitalForm.setFormData({
      name: hospital.name,
      hourlyRate: hospital.hourlyRate.toString(),
      address: hospital.address || '',
      color: hospital.color,
    });
    setDisplayHourlyRate(formatToCurrencyDisplay(hospital.hourlyRate));
    setShowForm(true);
  };

  const handleAddClick = () => {
    setDisplayHourlyRate('0,00');
    hospitalForm.resetForm();
    hospitalForm.updateField('hourlyRate', '0');
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hospitais</h2>
          <p className="text-gray-600">Gerencie os hospitais onde você trabalha</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Hospital</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos ({hospitals.length})
            </button>
            <button
              onClick={() => setFilterStatus('enabled')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'enabled'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Ativos ({hospitals.filter(h => !h.isDisabled).length})
            </button>
            <button
              onClick={() => setFilterStatus('disabled')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'disabled'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Desabilitados ({hospitals.filter(h => h.isDisabled).length})
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingHospital ? 'Editar Hospital' : 'Adicionar Hospital'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Hospital
                </label>
                <input
                  type="text"
                  value={hospitalForm.formData.name}
                  onChange={(e) => hospitalForm.updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                    hospitalForm.errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Hospital São Lucas"
                  required
                />
                {hospitalForm.errors.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {hospitalForm.errors.name}
                  </p>
                )}
              </div>

              {/* Hourly Rate with Currency Mask */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor por Hora (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="text"
                    value={displayHourlyRate}
                    onChange={(e) => handleCurrencyInputChange(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                      hospitalForm.errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                    required
                  />
                </div>
                {hospitalForm.errors.hourlyRate && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {hospitalForm.errors.hourlyRate}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Digite apenas números. Ex: 15000 = R$ 150,00
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço (Opcional)
              </label>
              <input
                type="text"
                value={hospitalForm.formData.address}
                onChange={(e) => hospitalForm.updateField('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                  hospitalForm.errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rua das Flores, 123 - Centro"
              />
              {hospitalForm.errors.address && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {hospitalForm.errors.address}
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Identificação
              </label>
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => hospitalForm.updateField('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      hospitalForm.formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {hospitalForm.errors.color && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {hospitalForm.errors.color}
                </p>
              )}
            </div>

            {/* Status Toggle for Editing */}
            {editingHospital && (
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={editingHospital.isDisabled || false}
                    onChange={(e) => {
                      // Note: This would need to be handled by the parent component
                      // For now, we'll just show the current status
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Hospital desabilitado
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Hospitais desabilitados não aparecerão nas opções para novos plantões
                </p>
              </div>
            )}

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
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700"
              >
                {editingHospital ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hospitals List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.length === 0 ? (
          <div className="col-span-full bg-white/80 rounded-2xl shadow-lg p-8 text-center border border-white/20">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {filterStatus === 'all' 
                ? 'Nenhum hospital cadastrado' 
                : filterStatus === 'enabled'
                ? 'Nenhum hospital ativo'
                : 'Nenhum hospital desabilitado'
              }
            </h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'Adicione seu primeiro hospital para começar'
                : 'Altere o filtro para ver outros hospitais'
              }
            </p>
          </div>
        ) : (
          filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`bg-white/80 rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-200 ${
                hospital.isDisabled ? 'opacity-75' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: hospital.color }}
                  />
                  <h3 className={`text-lg font-semibold ${
                    hospital.isDisabled 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900'
                  }`}>
                    {hospital.name}
                  </h3>
                  {hospital.isDisabled && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      Desabilitado
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        await onToggleHospitalStatus(hospital.id);
                      } catch (error: any) {
                        alert(error.message);
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      hospital.isDisabled
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-orange-600 hover:bg-orange-100'
                    }`}
                    title={hospital.isDisabled ? 'Habilitar hospital' : 'Desabilitar hospital'}
                  >
                    {hospital.isDisabled ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(hospital)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="Editar hospital"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja excluir este hospital?')) {
                        try {
                          await onDeleteHospital(hospital.id);
                        } catch (error: any) {
                          alert(error.message);
                        }
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Excluir hospital"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">
                    {showEconomicValues ? formatCurrency(hospital.hourlyRate) : '***'}/hora
                  </span>
                </div>
                {hospital.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HospitalsView;