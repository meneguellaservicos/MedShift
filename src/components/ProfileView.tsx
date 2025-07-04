import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, Save, Crown, Calendar, Clock, AlertTriangle, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useProfileForm } from '../hooks/useProfileForm';
import { getPasswordStrength } from '../utils/validation';

const VAPID_PUBLIC_KEY = 'BOr7QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw1Qn1QwQw';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const ProfileView: React.FC = () => {
  const { user, updateUserProfile, profileMessage, setNotificationsEnabled } = useAppContext();
  const [isEditing, setIsEditing] = useState(user?.forcePasswordChange || false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordSectionRef = useRef<HTMLDivElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [pushStatus, setPushStatus] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const profileForm = useProfileForm({ 
    user, 
    onUpdateProfile: (updates) => {
      updateUserProfile(updates);
      setIsEditing(false);
    }
  });

  // Focar na seção de senha quando entrar em modo de edição forçado
  useEffect(() => {
    if (user?.forcePasswordChange && isEditing && passwordSectionRef.current) {
      // Scroll suave para a seção de senha
      passwordSectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Adicionar destaque visual temporário
      passwordSectionRef.current.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-50');
      setTimeout(() => {
        if (passwordSectionRef.current) {
          passwordSectionRef.current.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-50');
        }
      }, 2000);
      
      // Focar no campo de senha atual após um pequeno delay
      setTimeout(() => {
        if (currentPasswordRef.current) {
          currentPasswordRef.current.focus();
        }
      }, 500);
    }
  }, [user?.forcePasswordChange, isEditing]);

  // Escutar evento para focar na seção de senha (quando vem do banner)
  useEffect(() => {
    const handleFocusPasswordSection = () => {
      if (passwordSectionRef.current) {
        // Scroll suave para a seção de senha
        passwordSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Adicionar destaque visual temporário
        passwordSectionRef.current.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-50');
        setTimeout(() => {
          if (passwordSectionRef.current) {
            passwordSectionRef.current.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-50');
          }
        }, 2000);
        
        // Focar no campo de senha atual após um pequeno delay
        setTimeout(() => {
          if (currentPasswordRef.current) {
            currentPasswordRef.current.focus();
          }
        }, 600);
      }
    };

    window.addEventListener('focusPasswordSection', handleFocusPasswordSection);
    
    return () => {
      window.removeEventListener('focusPasswordSection', handleFocusPasswordSection);
    };
  }, []);

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  const handleEnableNotifications = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          // Simular envio ao backend
          await fetch('http://localhost:4000/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          setPushStatus('Dispositivo inscrito e registrado no servidor!');
          await setNotificationsEnabled(true);
          setToast({ type: 'success', message: 'Notificações ativadas com sucesso!' });
        } catch (err) {
          setPushStatus('Erro ao registrar inscrição no servidor.');
          setToast({ type: 'error', message: 'Erro ao ativar notificações.' });
        }
      } else {
        setToast({ type: 'error', message: 'Permissão de notificações negada.' });
      }
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await profileForm.handleSubmit(e);
    if (success) {
      // Reset password fields on success
      profileForm.setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  const handleCancel = () => {
    profileForm.resetForm();
    setIsEditing(false);
  };

  const passwordStrength = getPasswordStrength(profileForm.formData.newPassword);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getRoleIcon = (role: string) => {
    return role === 'superuser' ? <Crown className="w-4 h-4 text-yellow-500" /> : <User className="w-4 h-4 text-blue-500" />;
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil do Usuário</h2>
        <p className="text-gray-600 dark:text-gray-300">Gerencie suas informações pessoais e configurações de segurança</p>
        {/* Notificações ativadas e botão de ativar notificações */}
        {(!user?.notificationsEnabled || notificationPermission !== 'granted') && (
          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={handleEnableNotifications}
          >
            Ativar notificações de plantão
          </button>
        )}
        {user?.notificationsEnabled && notificationPermission === 'granted' && (
          <span className="ml-2 text-green-600 text-sm font-medium flex items-center">
            <Bell className="w-4 h-4 mr-1" /> Notificações ativadas
          </span>
        )}
        {pushStatus && (
          <div className="mt-2 text-blue-700 text-xs">{pushStatus}</div>
        )}
      </div>

      {/* Profile Message */}
      {profileMessage && (
        <div className={`p-4 rounded-xl border ${
          profileMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {profileMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{profileMessage.message}</span>
          </div>
        </div>
      )}

      {/* Force Password Change Notice */}
      {user?.forcePasswordChange && (
        <div className="p-4 rounded-xl border bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Alteração de Senha Obrigatória
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Sua senha foi redefinida pelo administrador. Você deve alterá-la agora para continuar usando o sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Status */}
      {user && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              {getRoleIcon(user.role)}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Papel</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.role === 'superuser' ? 'Superusuário' : 'Usuário'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              {getStatusIcon(user.status)}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Calendar className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <Clock className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Último login</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">Aviso de Segurança</h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm mt-1">
              Esta é uma versão de demonstração. Em um ambiente de produção, todas as alterações de senha 
              seriam processadas de forma segura no servidor com criptografia adequada.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações Pessoais</h3>
          {!isEditing && !user?.forcePasswordChange && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
            >
              <User className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            {user?.specialty && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Especialidade</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.specialty}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileForm.formData.email}
                onChange={(e) => profileForm.updateField('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  profileForm.errors.email 
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                placeholder="seu@email.com"
              />
              {profileForm.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{profileForm.errors.email}</p>
              )}
            </div>

            <div 
              ref={passwordSectionRef} 
              className={`border-t border-gray-200 dark:border-gray-700 pt-6 ${
                user?.forcePasswordChange ? 'animate-pulse bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 -mx-4' : ''
              }`}
            >
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Alterar Senha</span>
                {user?.forcePasswordChange && (
                  <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                    Obrigatório
                  </span>
                )}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      ref={currentPasswordRef}
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={profileForm.formData.currentPassword}
                      onChange={(e) => profileForm.updateField('currentPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        profileForm.errors.currentPassword 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {profileForm.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{profileForm.errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={profileForm.formData.newPassword}
                      onChange={(e) => profileForm.updateField('newPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        profileForm.errors.newPassword 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {profileForm.formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
                        <span className={passwordStrength.color}>{passwordStrength.label}</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength < 40 ? 'bg-red-500' :
                            passwordStrength.strength < 70 ? 'bg-yellow-500' :
                            passwordStrength.strength < 90 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {profileForm.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{profileForm.errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={profileForm.formData.confirmPassword}
                      onChange={(e) => profileForm.updateField('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        profileForm.errors.confirmPassword 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {profileForm.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{profileForm.errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              {!user?.forcePasswordChange && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{user?.forcePasswordChange ? 'Alterar Senha' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast de feedback */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2
          ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileView;