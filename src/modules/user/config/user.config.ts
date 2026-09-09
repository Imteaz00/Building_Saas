import { registerAs } from '@nestjs/config';

export default registerAs('user', () => ({
  verificationTokenExpiry: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRY || '900',
    10,
  ),
  refreshTokenExpiry: parseInt(
    process.env.REFRESH_TOKEN_EXPIRY || '604800',
    10,
  ),
}));
