import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod').required(),
  PORT: Joi.number().default(3000).port().required(),
  DATABASE_URL: Joi.string().required(),
  SYNCHRONIZE: Joi.boolean().required(),
  VERIFICATION_TOKEN_EXPIRY: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRY: Joi.number().required(),
});
