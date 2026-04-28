import { Router } from 'express';
import { sendMessage, getInbox, getSent } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);
router.get('/inbox', getInbox);
router.get('/sent', getSent);

export default router;
