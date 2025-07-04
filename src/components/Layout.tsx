import React from 'react';
import { LogOut, User, Eye, EyeOff, AlertTriangle, Home, Building2, Calendar, BarChart3, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MedicalMenu } from './ui/MedicalMenu';
import AccountStatusBanner from './AccountStatusBanner';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { id: 'dashboard', title: 'Início', url: '/', icon: Home },
  { id: 'hospitals', title: 'Hospitais', url: '/hospitais', icon: Building2 },
  { id: 'shifts', title: 'Plantões', url: '/plantoes', icon: Calendar },
  { id: 'reports', title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    user,
    overlapMessage,
    showEconomicValues,
    logout,
    setShowEconomicValues,
    setCurrentView
  } = useAppContext();

  const toggleEconomicValues = () => {
    setShowEconomicValues(!showEconomicValues);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/medshift e logo copy.png" 
                alt="MedShift" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <button
                  onClick={() => setCurrentView && setCurrentView('profile')}
                  className="font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition px-1"
                  title="Ir para o perfil"
                >
                  {user?.name}
                </button>
                {user?.role === 'superuser' && (
                  <div title="Superusuário">
                    <Shield className="w-4 h-4 text-yellow-500" />
                  </div>
                )}
              </div>
              <button
                onClick={toggleEconomicValues}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  showEconomicValues
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={showEconomicValues ? 'Ocultar valores monetários' : 'Mostrar valores monetários'}
              >
                {showEconomicValues ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {showEconomicValues ? 'Valores' : 'Oculto'}
                </span>
              </button>
              {user?.role === 'superuser' && <NotificationBell />}
              {user?.role === 'superuser' && (
                <button
                  onClick={() => setCurrentView && setCurrentView('admin')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                  title="Painel Administrativo"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Account Status Banner */}
      {user && <AccountStatusBanner user={user} />}

      {/* Overlap Message - Sticky below header */}
      {overlapMessage && (
        <div className="sticky top-16 z-40 w-full py-3 px-4 bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-amber-800 text-sm">{overlapMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Novo Menu Responsivo */}
      <MedicalMenu
        items={menuItems}
        user={user ? { name: user.name, onProfileClick: () => window.location.href = '/profile' } : undefined}
        logo={{ text: 'MedShift', url: '/' }}
        setCurrentView={setCurrentView}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;