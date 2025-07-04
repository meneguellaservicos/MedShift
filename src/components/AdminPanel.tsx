import React, { useState, useEffect } from 'react';
import { User, AuditLog } from '../types';
import * as authService from '../services/authService';
import { 
  createUserStatusChangeNotification, 
  createPasswordResetNotification, 
  createRoleChangeNotification,
  saveNotification 
} from '../services/notificationService';
import { 
  Users, 
  Shield, 
  Activity, 
  Eye, 
  EyeOff, 
  Key, 
  Plus, 
  Crown,
  User as UserIcon,
  Calendar,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  ArrowLeft
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  onBackToApp?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onBackToApp }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Formulário para criar usuário
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    specialty: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, auditLogsData] = await Promise.all([
        authService.getAllUsers(),
        Promise.resolve(authService.getAuditLogs()) // getAuditLogs ainda é síncrono
      ]);
      setUsers(usersData);
      setAuditLogs(auditLogsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const updatedUser = await authService.toggleUserStatus(userId, currentUser.id, currentUser.email);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      
      // Criar notificação
      const notification = createUserStatusChangeNotification(
        updatedUser, 
        updatedUser.status, 
        currentUser.name
      );
      saveNotification(notification);
      
      showMessage('success', `Usuário ${updatedUser.status === 'active' ? 'habilitado' : 'desabilitado'} com sucesso!`);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const password = await authService.resetUserPassword(userId, currentUser.id, currentUser.email);
      const user = users.find(u => u.id === userId);
      
      if (user) {
        // Criar notificação
        const notification = createPasswordResetNotification(user, currentUser.name);
        saveNotification(notification);
      }
      
      setTemporaryPassword(password);
      setShowResetPassword(userId);
      showMessage('success', 'Senha redefinida com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleCreateUser = async () => {
    try {
      const userData = {
        ...newUser,
        role: 'user' as const,
        status: 'active' as const,
      };
      const createdUser = await authService.createUser(userData, currentUser.id, currentUser.email);
      setUsers([...users, createdUser]);
      setShowCreateUser(false);
      setNewUser({ name: '', email: '', specialty: '' });
      showMessage('success', 'Usuário criado com sucesso!');
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'superuser') => {
    try {
      const updatedUser = await authService.updateUserRole(userId, newRole, currentUser.id, currentUser.email);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      
      // Criar notificação
      const notification = createRoleChangeNotification(updatedUser, newRole, currentUser.name);
      saveNotification(notification);
      
      showMessage('success', `Papel do usuário alterado para ${newRole === 'superuser' ? 'Superusuário' : 'Usuário'}!`);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getRoleIcon = (role: string) => {
    return role === 'superuser' ? <Crown className="w-4 h-4 text-yellow-500" /> : <UserIcon className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToApp}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao App</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900">Painel Administrativo</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{currentUser.name}</span>
                <div title="Superusuário">
                  <Crown className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Usuários</span>
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Logs de Auditoria</span>
                </button>
              </nav>

              <div className="p-6">
                {activeTab === 'users' && (
                  <div>
                    {/* Actions */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Gerenciar Usuários</h2>
                      <button
                        onClick={() => setShowCreateUser(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Usuário</span>
                      </button>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Papel
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Criado em
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Último Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-700">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {user.email}
                                    </div>
                                    {user.specialty && (
                                      <div className="text-xs text-gray-400">{user.specialty}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getRoleIcon(user.role)}
                                  <span className="text-sm text-gray-900">
                                    {user.role === 'superuser' ? 'Superusuário' : 'Usuário'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(user.status)}
                                  <span className={`text-sm ${
                                    user.status === 'active' ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(user.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.lastLogin ? (
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatDate(user.lastLogin)}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Nunca</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleToggleUserStatus(user.id)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    disabled={user.id === currentUser.id}
                                  >
                                    {user.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => handleResetPassword(user.id)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <Key className="w-4 h-4" />
                                  </button>
                                  {user.id !== currentUser.id && (
                                    <select
                                      value={user.role}
                                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'user' | 'superuser')}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="user">Usuário</option>
                                      <option value="superuser">Superusuário</option>
                                    </select>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'logs' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Logs de Auditoria</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usuário
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ação
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Detalhes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usuário Alvo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {auditLogs.slice().reverse().map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(log.timestamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{log.userEmail}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {log.details}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.targetUserEmail || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Criar Usuário */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Usuário</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                  <input
                    type="text"
                    value={newUser.specialty}
                    onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Senha Temporária */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Senha Temporária Gerada</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  A senha temporária foi enviada para o email do usuário. 
                  O usuário será forçado a alterar a senha no próximo login.
                </p>
                <div className="bg-white border border-yellow-300 rounded p-2">
                  <code className="text-sm font-mono text-gray-900">{temporaryPassword}</code>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowResetPassword(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 