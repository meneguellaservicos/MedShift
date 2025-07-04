// Configuração centralizada da aplicação
// Centraliza todos os valores hardcoded para fácil manutenção

export const CONFIG = {
  // Configurações de Autenticação
  AUTH: {
    MAX_LOGIN_ATTEMPTS: 5,
    BLOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutos
    MAX_AUDIT_LOGS: 1000,
    MAX_LOGIN_ATTEMPTS_HISTORY: 1000,
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 50,
    SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Configurações de Notificações
  NOTIFICATIONS: {
    MAX_NOTIFICATIONS: 100,
    AUTO_CLEAR_DELAY_MS: 5000, // 5 segundos
    PROFILE_MESSAGE_DELAY_MS: 5000, // 5 segundos
    OVERLAP_MESSAGE_DELAY_MS: 5000, // 5 segundos
  },

  // Configurações de Validação
  VALIDATION: {
    MAX_HOURLY_RATE: 10000, // R$ 10.000,00
    MIN_NAME_LENGTH: 3,
    MIN_ADDRESS_LENGTH: 10,
    PASSWORD_STRENGTH_LEVELS: {
      WEAK: 40,
      MEDIUM: 70,
      GOOD: 90,
    },
  },

  // Configurações de UI/UX
  UI: {
    ANIMATION_DURATION_MS: 200,
    HOVER_TRANSITION_MS: 200,
    SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
    DEBOUNCE_DELAY_MS: 300,
  },

  // Configurações de Exportação
  EXPORT: {
    PDF: {
      MARGIN: 15,
      LOGO_WIDTH: 60,
      LOGO_HEIGHT: 20,
      LOGO_X: 15,
      LOGO_Y: 15,
      TITLE_Y: 50,
      SUBTITLE_Y: 65,
      TABLE_START_Y: 100,
      FOOTER_Y_OFFSET: 15,
    },
    CSV: {
      ENCODING: 'utf-8',
      DELIMITER: ',',
    },
  },

  // Configurações de Cores
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    PURPLE: '#8B5CF6',
    CYAN: '#06B6D4',
    LIME: '#84CC16',
    ORANGE: '#F97316',
    PINK: '#EC4899',
    INDIGO: '#6366F1',
    HOSPITAL_COLORS: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ],
  },

  // Configurações de Formatação
  FORMAT: {
    CURRENCY: {
      LOCALE: 'pt-BR',
      CURRENCY: 'BRL',
      MINIMUM_FRACTION_DIGITS: 2,
      MAXIMUM_FRACTION_DIGITS: 2,
    },
    DATE: {
      LOCALE: 'pt-BR',
      TIMEZONE: 'America/Sao_Paulo',
    },
    TIME: {
      FORMAT: 'HH:mm',
      TWENTY_FOUR_HOUR: true,
    },
  },

  // Configurações de Performance
  PERFORMANCE: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    MAX_RECORDS_PER_PAGE: 50,
    CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutos
  },

  // Configurações de Segurança
  SECURITY: {
    PASSWORD_SALT_ROUNDS: 10,
    JWT_EXPIRY_HOURS: 24,
    SESSION_TIMEOUT_MINUTES: 30,
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_FILE_TYPES: ['.pdf', '.csv', '.xlsx'],
  },

  // Configurações de Desenvolvimento
  DEVELOPMENT: {
    DEBUG_MODE: import.meta.env.DEV,
    LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error',
    MOCK_DATA: import.meta.env.DEV,
  },
} as const;

// Tipos para as configurações
export type ConfigKey = keyof typeof CONFIG;
export type AuthConfig = typeof CONFIG.AUTH;
export type NotificationConfig = typeof CONFIG.NOTIFICATIONS;
export type ValidationConfig = typeof CONFIG.VALIDATION;
export type UIConfig = typeof CONFIG.UI;
export type ExportConfig = typeof CONFIG.EXPORT;
export type ColorConfig = typeof CONFIG.COLORS;
export type FormatConfig = typeof CONFIG.FORMAT;
export type PerformanceConfig = typeof CONFIG.PERFORMANCE;
export type SecurityConfig = typeof CONFIG.SECURITY;
export type DevelopmentConfig = typeof CONFIG.DEVELOPMENT;

// Funções utilitárias para acessar configurações
export const getConfig = <K extends ConfigKey>(key: K): typeof CONFIG[K] => {
  return CONFIG[key];
};

export const getAuthConfig = (): AuthConfig => CONFIG.AUTH;
export const getNotificationConfig = (): NotificationConfig => CONFIG.NOTIFICATIONS;
export const getValidationConfig = (): ValidationConfig => CONFIG.VALIDATION;
export const getUIConfig = (): UIConfig => CONFIG.UI;
export const getExportConfig = (): ExportConfig => CONFIG.EXPORT;
export const getColorConfig = (): ColorConfig => CONFIG.COLORS;
export const getFormatConfig = (): FormatConfig => CONFIG.FORMAT;
export const getPerformanceConfig = (): PerformanceConfig => CONFIG.PERFORMANCE;
export const getSecurityConfig = (): SecurityConfig => CONFIG.SECURITY;
export const getDevelopmentConfig = (): DevelopmentConfig => CONFIG.DEVELOPMENT;

// Funções específicas para valores comuns
export const getMaxLoginAttempts = (): number => CONFIG.AUTH.MAX_LOGIN_ATTEMPTS;
export const getBlockDuration = (): number => CONFIG.AUTH.BLOCK_DURATION_MS;
export const getMaxHourlyRate = (): number => CONFIG.VALIDATION.MAX_HOURLY_RATE;
export const getAutoClearDelay = (): number => CONFIG.NOTIFICATIONS.AUTO_CLEAR_DELAY_MS;
export const getHospitalColors = (): readonly string[] => CONFIG.COLORS.HOSPITAL_COLORS; 