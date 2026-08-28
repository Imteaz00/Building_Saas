import { registerAs } from '@nestjs/config';

export default registerAs('user', () => ({
  verificationTokenExpiry: parseInt(
    process.env.VerificationTokenExpiry || '15',
    10,
  ),
}));
