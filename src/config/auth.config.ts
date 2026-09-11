import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY || '900', 10),
}));
