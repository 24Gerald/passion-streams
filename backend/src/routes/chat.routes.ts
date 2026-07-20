import express from 'express';
import {
  getChats,
  getChatMessages,
  sendMessage,
  inviteAdmin,
  createChat,
} from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id/messages', getChatMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/invite-admin', inviteAdmin);

export default router;

