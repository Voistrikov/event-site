import { Router } from 'express';
import { deleteAvatar, uploadAvatar, upgradeToOrganizer } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.middleware.js';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.post('/upgrade', upgradeToOrganizer);
userRouter.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
userRouter.delete('/avatar', deleteAvatar);
