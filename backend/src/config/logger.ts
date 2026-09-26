import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV !== 'production' ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'body.password',
      'body.passwordHash',
    ],
    censor: '[REDACTED]',
  },
});
