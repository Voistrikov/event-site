import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login',    loginHandler);
router.post('/refresh',  refreshHandler);

router.post('/logout', authenticate, logoutHandler);
router.get('/me',      authenticate, getMeHandler);

export { router as authRouter };
