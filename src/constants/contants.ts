export const USER = 'user';

export const NOTIFICATION_EVENTS = {
  SEND_VERIFICATION_EMAIL: 'send-verification-email',
  SETUP_TEMPLATES: 'setup-templates',
  SEND_NOTIFICATION: 'send-notification',
  BUILDING_ANNOUNCEMENT: 'building-announcement',
};

export const DELIVERY_EVENTS = {
  PROCESS_DELIVERY: 'process-delivery',
  EMAIL: 'email',
  IN_APP: 'in-app',
} as const;
