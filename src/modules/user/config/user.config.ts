import { registerAs } from '@nestjs/config';

export default registerAs('user', () => ({
  verificationTokenExpiry: parseInt(
    process.env.VERIFICATION_TOKEN_EXPIRY || '15',
    10,
  ),
}));
