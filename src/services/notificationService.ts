import { SystemNotification, User } from '../types';
import { getNotificationConfig } from '../config';

const NOTIFICATIONS_KEY = 'medshift-notifications';

// Inicializar notificações se não existirem
const initializeNotifications = () => {
  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  }
};

// Função para criar notificação de novo usuário
export const createNewUserNotification = (newUser: User): SystemNotification => {
  const notification: SystemNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'new_user',
    title: 'Novo Usuário Registrado',
    message: `O usuário ${newUser.name} (${newUser.email}) se registrou no sistema.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetUserId: newUser.id,
    targetUserEmail: newUser.email,
    actionRequired: false,
  };

  return notification;
};

// Função para criar notificação de mudança de status de usuário
export const createUserStatusChangeNotification = (user: User, newStatus: string, adminName: string): SystemNotification => {
  const notification: SystemNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'user_status_change',
    title: 'Status de Usuário Alterado',
    message: `O usuário ${user.name} (${user.email}) foi ${newStatus === 'active' ? 'habilitado' : 'desabilitado'} por ${adminName}.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetUserId: user.id,
    targetUserEmail: user.email,
    actionRequired: false,
  };

  return notification;
};

// Função para criar notificação de redefinição de senha
export const createPasswordResetNotification = (user: User, adminName: string): SystemNotification => {
  const notification: SystemNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'password_reset',
    title: 'Senha Redefinida',
    message: `A senha do usuário ${user.name} (${user.email}) foi redefinida por ${adminName}.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetUserId: user.id,
    targetUserEmail: user.email,
    actionRequired: false,
  };

  return notification;
};

// Função para criar notificação de alteração de papel
export const createRoleChangeNotification = (user: User, newRole: string, adminName: string): SystemNotification => {
  const notification: SystemNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'user_status_change',
    title: 'Papel de Usuário Alterado',
    message: `O papel do usuário ${user.name} (${user.email}) foi alterado para ${newRole === 'superuser' ? 'Superusuário' : 'Usuário'} por ${adminName}.`,
    timestamp: new Date().toISOString(),
    read: false,
    targetUserId: user.id,
    targetUserEmail: user.email,
    actionRequired: false,
  };

  return notification;
};

// Função para salvar notificação
export const saveNotification = (notification: SystemNotification) => {
  initializeNotifications();
  const notifications: SystemNotification[] = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
  notifications.unshift(notification); // Adicionar no início
  
  // Manter apenas as últimas notificações conforme configuração
  const maxNotifications = getNotificationConfig().MAX_NOTIFICATIONS;
  if (notifications.length > maxNotifications) {
    notifications.splice(maxNotifications);
  }
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// Função para obter todas as notificações
export const getAllNotifications = (): SystemNotification[] => {
  initializeNotifications();
  return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
};

// Função para obter notificações não lidas
export const getUnreadNotifications = (): SystemNotification[] => {
  const notifications = getAllNotifications();
  return notifications.filter(notification => !notification.read);
};

// Função para marcar notificação como lida
export const markNotificationAsRead = (notificationId: string) => {
  const notifications = getAllNotifications();
  const updatedNotifications = notifications.map(notification =>
    notification.id === notificationId ? { ...notification, read: true } : notification
  );
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
};

// Função para marcar todas as notificações como lidas
export const markAllNotificationsAsRead = () => {
  const notifications = getAllNotifications();
  const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
};

// Função para deletar notificação
export const deleteNotification = (notificationId: string) => {
  const notifications = getAllNotifications();
  const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
};

// Função para limpar todas as notificações
export const clearAllNotifications = () => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
};

// Função para obter contagem de notificações não lidas
export const getUnreadCount = (): number => {
  return getUnreadNotifications().length;
}; 