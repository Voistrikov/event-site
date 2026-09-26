import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { authRouter } from './routes/auth.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { eventRouter } from './routes/event.routes.js';
import { bookingRouter } from './routes/booking.routes.js';
import { userRouter } from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth',  authRouter);
app.use('/admin', adminRouter);
app.use('/events', eventRouter);
app.use('/bookings', bookingRouter);
app.use('/users', userRouter);
app.use('/messages', messageRouter);
app.use('/categories', categoryRouter);

app.use(errorHandler);

if (env.SSL_KEY_PATH && env.SSL_CERT_PATH) {
  const httpsOptions = {
    key:  fs.readFileSync(env.SSL_KEY_PATH),
    cert: fs.readFileSync(env.SSL_CERT_PATH),
  };
  https.createServer(httpsOptions, app).listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV, tls: true }, 'HTTPS server started');
  });
} else {
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV, tls: false }, 'HTTP server started');
  });
}

export default app;
