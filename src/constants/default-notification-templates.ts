import { DELIVERY_EVENTS, NOTIFICATION_EVENTS } from './contants';

export const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    eventKey: 'user_verification',
    channel: 'email',
    subject: 'Verify Your Account',
    body: 'Please verify your account using this token: {{token}}',
  },
  {
    eventKey: NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
    channel: DELIVERY_EVENTS.EMAIL,
    subject: '{{title}}',
    body: '{{body}}',
  },
  {
    eventKey: NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
    channel: DELIVERY_EVENTS.IN_APP,
    subject: '{{title}}',
    body: '{{body}}',
  },
];
