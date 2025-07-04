export interface User {
  id: string;
  nome: string;
  email: string;
  specialty?: string;
  role: 'user' | 'superuser';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  forcePasswordChange?: boolean;
  twoFactorEnabled?: boolean;
  notificationsEnabled?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  hourlyRate: number;
  address?: string;
  color: string;
  isDisabled?: boolean;
}

export interface Shift {
  id: string;
  hospitalId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  totalHours: number;
  totalAmount: number;
  isPaid: boolean;
  notes?: string;
}

export interface Report {
  totalShifts: number;
  totalHours: number;
  totalEarnings: number;
  paidAmount: number;
  pendingAmount: number;
  hospitalBreakdown: {
    hospitalId: string;
    hospitalName: string;
    shifts: number;
    hours: number;
    earnings: number;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
  targetUserId?: string;
  targetUserEmail?: string;
}

export interface UserManagementData {
  users: User[];
  auditLogs: AuditLog[];
}

export interface LoginAttempt {
  email: string;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  type: 'new_user' | 'user_status_change' | 'password_reset' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetUserId?: string;
  targetUserEmail?: string;
  actionRequired?: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newUserAlerts: boolean;
  systemAlerts: boolean;
}