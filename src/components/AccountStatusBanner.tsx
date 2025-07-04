import React from 'react';
import { AlertTriangle, Key, Shield } from 'lucide-react';
import { User } from '../types';
import { useAppContext } from '../context/AppContext';

interface AccountStatusBannerProps {
  user: User;
}

const AccountStatusBanner: React.FC<AccountStatusBannerProps> = ({ user }) => {
  const { setCurrentView } = useAppContext();

  if (!user.forcePasswordChange) {
    return null;
  }

  const handleChangePassword = () => {
    setCurrentView('profile');
    // Adicionar um pequeno delay para garantir que a navegação aconteça primeiro
    setTimeout(() => {
      // Disparar um evento customizado para focar na seção de senha
      window.dispatchEvent(new CustomEvent('focusPasswordSection'));
    }, 100);
  };

  return (
    <div className="sticky top-16 z-40 w-full py-3 px-4 bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Key className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm font-medium">
              Alteração de Senha Obrigatória
            </p>
            <p className="text-yellow-700 text-xs">
              Sua senha foi redefinida pelo administrador. Você deve alterá-la agora.
            </p>
          </div>
          <button
            onClick={handleChangePassword}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
          >
            Alterar Senha
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountStatusBanner; 