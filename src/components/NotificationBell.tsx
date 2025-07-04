import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import * as notificationService from '../services/notificationService';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    // Carregar contagem inicial
    updateUnreadCount();

    // Verificar por novas notificações a cada 30 segundos
    const interval = setInterval(updateUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = () => {
    const count = notificationService.getUnreadCount();
    setUnreadCount(count);
  };

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
    updateUnreadCount(); // Atualizar contagem ao abrir
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        title="Notificações"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};

export default NotificationBell; 