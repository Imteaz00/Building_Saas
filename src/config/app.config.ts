import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'prod',
  PORT: process.env.PORT || 3000,
}));
