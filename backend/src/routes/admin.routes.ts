import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { authorise } from '../middleware/authorise.middleware.js';
import {
  listUsersHandler,
  updateUserStatusHandler,
  getUserHandler,
  exportEventsJsonHandler,
  exportEventsXmlHandler
} from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorise('ADMIN'));

router.get('/users',          listUsersHandler);
router.get('/users/:id',      getUserHandler);
router.patch('/users/:id/status', updateUserStatusHandler);
router.get('/export/events/json', exportEventsJsonHandler);
router.get('/export/events/xml', exportEventsXmlHandler);

export { router as adminRouter };
