import { Router } from 'express';
import {
  deleteInboxMessage,
  deleteSentMessage,
  getInbox,
  getSent,
  getUnreadCount,
  markAsRead,
  sendMessage,
} from '../controllers/message.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);
router.get('/unread-count', getUnreadCount);
router.get('/inbox', getInbox);
router.get('/sent', getSent);
router.patch('/:id/read', markAsRead);
router.delete('/:id/inbox', deleteInboxMessage);
router.delete('/:id/sent', deleteSentMessage);

export default router;
