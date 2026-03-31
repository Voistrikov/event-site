import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorise } from '../middleware/authorise.middleware.js';
import {
  listUsersHandler,
  updateUserStatusHandler,
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorise('ADMIN'));

router.get('/users',          listUsersHandler);
router.patch('/users/:id/status', updateUserStatusHandler);

export { router as adminRouter };
