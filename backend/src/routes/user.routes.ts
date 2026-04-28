import { Router } from 'express';
import { upgradeToOrganizer } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.post('/upgrade', upgradeToOrganizer);
